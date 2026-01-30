import { getSupabaseClient } from "@/lib/supabase/client";

export interface IDocumentoDB {
    id: string;
    numero: string;
    titulo: string;
    tipo: string;
    categoria_id: string;
    subcategoria_id: string;
    lei?: string;
    processo_id?: string;
    especialista_id?: string;
    objetivo?: string;
    contexto?: string;
    conteudo?: string;
    tokens_utilizados: number;
    versao: number;
    status: string;
    criado_por?: string;
    active?: boolean; // Schemaless or different name
    created_at: string;
    updated_at: string;
    // Relations
    categoria?: { nome: string; lei?: string };
    subcategoria?: { nome: string };
    processo?: { numero: string };
    anexos?: IDocumentoAnexoDB[];
    historico?: IDocumentoHistoricoDB[];
    versoes?: IDocumentoVersaoDB[];
}

export interface IDocumentoAnexoDB {
    id: string;
    documento_id: string;
    nome: string;
    tamanho: string;
    url?: string;
    tipo_mime?: string;
    created_at: string;
}

export interface IDocumentoHistoricoDB {
    id: string;
    documento_id: string;
    acao: string;
    usuario_nome?: string;
    created_at: string;
}

export interface IDocumentoVersaoDB {
    id: string;
    documento_id: string;
    versao: number;
    conteudo: string;
    descricao?: string;
    usuario_nome?: string;
    created_at: string;
}

const TABLE_NAME = 'documentos';

export const documentosService = {
    async listar(filtros?: { termo?: string; categoria?: string; status?: string }): Promise<IDocumentoDB[]> {
        const supabase = getSupabaseClient();

        // Fetch raw documents
        let query = supabase
            .from(TABLE_NAME)
            .select('*') // No joins allowed due to missing FKs
            .eq('excluido', false) // Logical Delete Filter
            .order('created_at', { ascending: false });

        if (filtros?.termo) {
            query = query.or(`titulo.ilike.%${filtros.termo}%,numero.ilike.%${filtros.termo}%`);
        }
        if (filtros?.status && filtros.status !== 'todos') {
            query = query.eq('status', filtros.status);
        }

        const { data: docs, error } = await query;
        if (error) throw error;
        if (!docs || docs.length === 0) return [];

        // Manual Join: Collect IDs
        const categoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.categoria_id).filter(Boolean))];
        const subcategoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.subcategoria_id).filter(Boolean))];
        const processoIds = [...new Set((docs as IDocumentoDB[]).map(d => d.processo_id).filter(Boolean))];

        // Fetch Related Data
        let cats: any[] = [];
        let subs: any[] = [];
        let procs: any[] = [];

        if (categoriaIds.length > 0) {
            const { data } = await supabase.from('categorias_documentos').select('id, nome, lei').in('id', categoriaIds);
            cats = data || [];
        }
        if (subcategoriaIds.length > 0) {
            const { data } = await supabase.from('subcategorias_documentos').select('id, nome').in('id', subcategoriaIds);
            subs = data || [];
        }
        if (processoIds.length > 0) {
            const { data } = await supabase.from('processos').select('id, numero').in('id', processoIds);
            procs = data || [];
        }

        // Map back to docs
        const catsMap = new Map(cats.map(c => [c.id, c]));
        const subsMap = new Map(subs.map(s => [s.id, s]));
        const procsMap = new Map(procs.map(p => [p.id, p]));

        return (docs as IDocumentoDB[]).map(doc => ({
            ...doc,
            categoria: doc.categoria_id ? catsMap.get(doc.categoria_id) : undefined,
            subcategoria: doc.subcategoria_id ? subsMap.get(doc.subcategoria_id) : undefined,
            processo: doc.processo_id ? procsMap.get(doc.processo_id) : undefined,
        }));
    },

    async obterPorId(id: string): Promise<IDocumentoDB | null> {
        const supabase = getSupabaseClient();

        // 1. Fetch Doc
        const { data: doc, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!doc) return null;

        // 2. Fetch Relations Manually
        const promises = [
            supabase.from('documento_anexos').select('*').eq('documento_id', id),
            supabase.from('documento_historico').select('*').eq('documento_id', id).order('created_at', { ascending: false }),
            supabase.from('documento_versoes').select('*').eq('documento_id', id).order('versao', { ascending: false })
        ];

        // Conditional fetches for relations
        if (doc.categoria_id) promises.push(supabase.from('categorias_documentos').select('nome, lei').eq('id', doc.categoria_id).single());
        if (doc.subcategoria_id) promises.push(supabase.from('subcategorias_documentos').select('nome').eq('id', doc.subcategoria_id).single());
        if (doc.processo_id) promises.push(supabase.from('processos').select('numero').eq('id', doc.processo_id).single());

        const results = await Promise.all(promises);

        const anexos = results[0].data || [];
        const historico = results[1].data || [];
        const versoes = results[2].data || [];

        // Extract optional results based on index offset
        let offset = 3;
        const categoria = doc.categoria_id ? results[offset++]?.data : undefined;
        const subcategoria = doc.subcategoria_id ? results[offset++]?.data : undefined;
        const processo = doc.processo_id ? results[offset++]?.data : undefined;

        return {
            ...doc,
            anexos,
            historico,
            versoes,
            categoria,
            subcategoria,
            processo
        };
    },

    async criar(dados: Partial<IDocumentoDB>): Promise<IDocumentoDB> {
        const supabase = getSupabaseClient();

        // Ensure numero exists (simple generation)
        const payload = { ...dados };
        if (!payload.numero) {
            const now = new Date();
            const year = now.getFullYear();
            const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            payload.numero = `${year}/${sequence}`; // Format: 2025/1234
        }

        // Clean payload of unsupported fields (TEMPORARY: until DB fixed for these)
        // We KEEP ativo/excluido now as we expect them to be fixed
        delete (payload as any).objetivo;
        delete (payload as any).contexto;
        delete (payload as any).conteudo;
        delete (payload as any).especialista_id;
        delete (payload as any).tokens_utilizados;
        delete (payload as any).versao;
        delete (payload as any).lei;

        // Force defaults
        (payload as any).ativo = true;
        (payload as any).excluido = false;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(payload)
            .select() // Returning * is fine usually
            .single();

        if (error) throw error;
        return data;
    },

    async atualizar(id: string, dados: Partial<IDocumentoDB>): Promise<IDocumentoDB> {
        const supabase = getSupabaseClient();

        const payload = { ...dados };

        // Clean payload of unsupported fields
        delete (payload as any).objetivo;
        delete (payload as any).contexto;
        delete (payload as any).conteudo;
        delete (payload as any).especialista_id;
        delete (payload as any).tokens_utilizados;
        delete (payload as any).versao;
        delete (payload as any).lei;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        // Logical Delete - Soft Delete
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) throw error;
    }
};
