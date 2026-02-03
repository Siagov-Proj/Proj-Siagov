import { getSupabaseClient } from "@/lib/supabase/client";

export interface IProcessoDB {
    id: string;
    numero: string;
    ano: number;
    assunto: string;
    tipo: string;
    interessado_id?: string;
    interessado_nome?: string;
    status: string;
    prioridade: string;
    setor_atual_id?: string;
    data_abertura: string;
    data_prazo?: string;
    data_encerramento?: string;
    observacoes?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
    // Relations (Partial)
    setor_atual?: { nome: string };
}

const TABLE_NAME = 'processos';

export const processosService = {
    async listar(termoBusca?: string): Promise<IProcessoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select(`
                *,
                setor_atual:setores(nome)
            `)
            .order('created_at', { ascending: false });

        if (termoBusca) {
            query = query.or(`numero.ilike.%${termoBusca}%,assunto.ilike.%${termoBusca}%,interessado_nome.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async obterPorId(id: string): Promise<IProcessoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                setor_atual:setores(nome)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Minimal listing for Dropdowns
    async listarParaSelect(): Promise<Pick<IProcessoDB, 'id' | 'numero' | 'assunto'>[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('id, numero, assunto')
            .order('numero', { ascending: false })
            .limit(50); // Limit for dropdown performance

        if (error) throw error;
        return data || [];
    }
};
