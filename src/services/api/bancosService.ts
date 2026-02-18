/**
 * Bancos Service
 * CRUD operations for banks
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IBancoDB {
    id: string;
    codigo: string;
    nome: string;
    nome_abreviado?: string;
    cnpj?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'bancos';

export const bancosService = {
    async listar(termoBusca?: string): Promise<IBancoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,nome_abreviado.ilike.%${termoBusca}%,codigo.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar bancos:', error);
            throw error;
        }

        return data as IBancoDB[];
    },

    async buscarPorId(id: string): Promise<IBancoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar banco:', error);
            throw error;
        }

        return data as IBancoDB;
    },

    async criar(banco: Omit<IBancoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IBancoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...banco,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar banco:', error);
            throw error;
        }

        return data as IBancoDB;
    },

    async atualizar(id: string, banco: Partial<IBancoDB>): Promise<IBancoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = banco;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar banco:', error);
            throw error;
        }

        return data as IBancoDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir banco:', error);
            throw error;
        }
    },

    async contarAgencias(bancoId: string): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from('agencias')
            .select('*', { count: 'exact', head: true })
            .eq('banco_id', bancoId)
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar agências do banco:', error);
            throw error;
        }

        return count ?? 0;
    }
};
