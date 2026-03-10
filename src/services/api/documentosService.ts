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
    active?: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    categoria?: { nome: string; lei?: string };
    subcategoria?: { nome: string; codigo?: string };
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
    usuario_id?: string;
    usuario_nome?: string;
    detalhes?: string;
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

/**
 * Extrai o prefixo numérico de um nome de subcategoria.
 * Ex: "4.1. Dispensa" -> "4.1"
 * Ex: "2. Estimativa de preços" -> "2"
 */
function extrairPrefixoSubcategoria(nome: string): string | null {
    const match = nome.match(/^(\d+(?:\.\d+)*)\./);
    return match ? match[1] : null;
}

export const documentosService = {

    /**
     * Gera o próximo código de documento para uma subcategoria.
     * Ex: subcategoria "4.1. Dispensa" com 2 docs existentes -> retorna "4.1.3."
     */
    async gerarProximoCodigo(subcategoriaId: string): Promise<string> {
        const supabase = getSupabaseClient();

        // 1. Buscar nome da subcategoria (com campo codigo se disponível)
        const { data: subcat, error: subcatError } = await supabase
            .from('subcategorias_documentos')
            .select('nome, codigo')
            .eq('id', subcategoriaId)
            .single();

        if (subcatError || !subcat) {
            // Fallback: gerar número sequencial simples
            const fallbackSeq = Date.now().toString().slice(-4);
            return `DOC-${fallbackSeq}`;
        }

        // 2. Extrair o prefixo da subcategoria (ex: "4.1" de "4.1. Nome")
        const prefixo = subcat.codigo || extrairPrefixoSubcategoria(subcat.nome);

        if (!prefixo) {
            // Sem prefixo numérico, usar contagem simples
            const { count } = await supabase
                .from(TABLE_NAME)
                .select('*', { count: 'exact', head: true })
                .eq('subcategoria_id', subcategoriaId)
                .eq('excluido', false);

            const seq = (count || 0) + 1;
            return `${seq}`;
        }

        // 3. Contar documentos existentes nessa subcategoria (excluídos não contam)
        const { count, error: countError } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('subcategoria_id', subcategoriaId)
            .eq('excluido', false);

        if (countError) {
            console.error('Erro ao contar documentos da subcategoria:', countError);
        }

        const proximoNum = (count || 0) + 1;
        return `${prefixo}.${proximoNum}.`;
    },

    async listar(filtros?: { termo?: string; categoria?: string; status?: string }): Promise<IDocumentoDB[]> {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
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

        // Manual Join
        const categoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.categoria_id).filter(Boolean))];
        const subcategoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.subcategoria_id).filter(Boolean))];
        const processoIds = [...new Set((docs as IDocumentoDB[]).map(d => d.processo_id).filter(Boolean))];

        let cats: any[] = [];
        let subs: any[] = [];
        let procs: any[] = [];

        if (categoriaIds.length > 0) {
            const { data } = await supabase.from('categorias_documentos').select('id, nome, lei').in('id', categoriaIds);
            cats = data || [];
        }
        if (subcategoriaIds.length > 0) {
            const { data } = await supabase.from('subcategorias_documentos').select('id, nome, codigo').in('id', subcategoriaIds);
            subs = data || [];
        }
        if (processoIds.length > 0) {
            const { data } = await supabase.from('processos').select('id, numero').in('id', processoIds);
            procs = data || [];
        }

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

        const { data: doc, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!doc) return null;

        const promises: Promise<any>[] = [
            supabase.from('documento_anexos').select('*').eq('documento_id', id),
            supabase.from('documento_historico').select('*').eq('documento_id', id).order('created_at', { ascending: false }),
            supabase.from('documento_versoes').select('*').eq('documento_id', id).order('versao', { ascending: false })
        ];

        if (doc.categoria_id) promises.push(supabase.from('categorias_documentos').select('nome, lei, codigo').eq('id', doc.categoria_id).single());
        if (doc.subcategoria_id) promises.push(supabase.from('subcategorias_documentos').select('nome, codigo').eq('id', doc.subcategoria_id).single());
        if (doc.processo_id) promises.push(supabase.from('processos').select('numero').eq('id', doc.processo_id).single());

        const results = await Promise.all(promises);

        const anexos = results[0].data || [];
        const historico = results[1].data || [];
        const versoes = results[2].data || [];

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

        const payload = { ...dados };

        // Se subcategoria_id estiver presente, gerar o código automaticamente
        if (!payload.numero && payload.subcategoria_id) {
            payload.numero = await this.gerarProximoCodigo(payload.subcategoria_id);
        } else if (!payload.numero) {
            const now = new Date();
            const year = now.getFullYear();
            const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            payload.numero = `${year}/${sequence}`;
        }

        // Limpar campos que não existem no schema da tabela
        delete (payload as any).objetivo;
        delete (payload as any).contexto;
        delete (payload as any).conteudo;
        delete (payload as any).especialista_id;
        delete (payload as any).tokens_utilizados;
        delete (payload as any).versao;
        delete (payload as any).lei;

        (payload as any).ativo = true;
        (payload as any).excluido = false;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        // Registrar log de criação
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('documento_historico').insert({
                documento_id: data.id,
                acao: 'Criado',
                usuario_id: user?.id || null,
                usuario_nome: user?.email || 'Sistema',
            });
        } catch (logError) {
            console.warn('Aviso: Não foi possível registrar log de criação:', logError);
        }

        return data;
    },

    async atualizar(id: string, dados: Partial<IDocumentoDB>): Promise<IDocumentoDB> {
        const supabase = getSupabaseClient();

        const payload = { ...dados };

        // Limpar campos que não existem no schema
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

        // Registrar log de atualização
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('documento_historico').insert({
                documento_id: id,
                acao: 'Atualizado',
                usuario_id: user?.id || null,
                usuario_nome: user?.email || 'Sistema',
            });
        } catch (logError) {
            console.warn('Aviso: Não foi possível registrar log de atualização:', logError);
        }

        return data;
    },

    /**
     * Registra um download do documento no histórico.
     * Deve ser chamado quando o usuário clica em "Baixar PDF".
     */
    async registrarDownload(documentoId: string): Promise<void> {
        const supabase = getSupabaseClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('documento_historico').insert({
                documento_id: documentoId,
                acao: 'Download',
                usuario_id: user?.id || null,
                usuario_nome: user?.email || 'Desconhecido',
            });

            if (error) {
                console.error('Erro ao registrar download:', error);
            }
        } catch (err) {
            console.error('Erro ao registrar download:', err);
        }
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) throw error;
    }
};
