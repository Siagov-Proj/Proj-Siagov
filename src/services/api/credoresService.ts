
import { getSupabaseClient } from "@/lib/supabase/client";
import { ICredor } from "@/types";

const TABLE_NAME = 'credores';

export const credoresService = {
    async listar(termoBusca?: string) {
        const supabase = getSupabaseClient();
        let query = supabase.from(TABLE_NAME).select('*').order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,identificador.ilike.%${termoBusca}%,nomeFantasia.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar credores:', error);
            throw error;
        }

        return data as ICredor[];
    },

    async buscarPorId(id: string) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

        if (error) {
            console.error('Erro ao buscar credor por id:', error);
            throw error;
        }

        return data as ICredor;
    },

    async criar(credor: Omit<ICredor, 'id' | 'createdAt' | 'updatedAt'>) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from(TABLE_NAME).insert({
            ...credor,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).select().single();

        if (error) {
            console.error('Erro ao criar credor:', error);
            throw error;
        }

        return data as ICredor;
    },

    async atualizar(id: string, credor: Partial<ICredor>) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from(TABLE_NAME).update({
            ...credor,
            updatedAt: new Date().toISOString(),
        }).eq('id', id).select().single();

        if (error) {
            console.error('Erro ao atualizar credor:', error);
            throw error;
        }

        return data as ICredor;
    },

    async excluir(id: string) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

        if (error) {
            console.error('Erro ao excluir credor:', error);
            throw error;
        }
    }
};
