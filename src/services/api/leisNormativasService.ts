/**
 * Leis Normativas Service
 * CRUD operations for normative laws
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ILeiNormativaDB {
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'leis_normativas';

export const leisNormativasService = {
    async listar(termoBusca?: string): Promise<ILeiNormativaDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar leis:', error);
            throw error;
        }

        return data as ILeiNormativaDB[];
    },

    async listarAtivas(): Promise<ILeiNormativaDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .eq('ativo', true)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar leis ativas:', error);
            throw error;
        }

        return data as ILeiNormativaDB[];
    },

    async buscarPorId(id: string): Promise<ILeiNormativaDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar lei:', error);
            throw error;
        }

        return data as ILeiNormativaDB;
    },

    async criar(lei: Omit<ILeiNormativaDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ILeiNormativaDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...lei,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar lei:', error);
            throw error;
        }

        return data as ILeiNormativaDB;
    },

    async atualizar(id: string, lei: Partial<ILeiNormativaDB>): Promise<ILeiNormativaDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = lei;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar lei:', error);
            throw error;
        }

        return data as ILeiNormativaDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir lei:', error);
            throw error;
        }
    },
};
