/**
 * Esferas Service
 * CRUD operations for government spheres
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IEsferaDB {
    id: string;
    sigla: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'esferas';

export const esferasService = {
    async listar(termoBusca?: string): Promise<IEsferaDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,sigla.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar esferas:', error);
            throw error;
        }

        return data as IEsferaDB[];
    },

    async buscarPorId(id: string): Promise<IEsferaDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar esfera:', error);
            throw error;
        }

        return data as IEsferaDB;
    },

    async criar(esfera: Omit<IEsferaDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IEsferaDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...esfera,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar esfera:', error);
            throw error;
        }

        return data as IEsferaDB;
    },

    async atualizar(id: string, esfera: Partial<IEsferaDB>): Promise<IEsferaDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = esfera;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar esfera:', error);
            throw error;
        }

        return data as IEsferaDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir esfera:', error);
            throw error;
        }
    },

    async contarInstituicoes(esferaId: string): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from('instituicoes')
            .select('*', { count: 'exact', head: true })
            .eq('esfera_id', esferaId)
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar instituições:', error);
            return 0;
        }

        return count || 0;
    }
};
