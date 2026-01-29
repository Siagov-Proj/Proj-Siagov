/**
 * Cargos Service
 * CRUD operations for positions/roles
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ICargoDB {
    id: string;
    codigo: string;
    instituicao_id?: string;
    orgao_id?: string;
    unidade_gestora_id?: string;
    setor_id?: string;
    nome: string;
    descricao?: string;
    nivel?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'cargos';

export const cargosService = {
    async listar(termoBusca?: string): Promise<ICargoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,codigo.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar cargos:', error);
            throw error;
        }

        return data as ICargoDB[];
    },

    async buscarPorId(id: string): Promise<ICargoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar cargo:', error);
            throw error;
        }

        return data as ICargoDB;
    },

    async criar(cargo: Omit<ICargoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ICargoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...cargo,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar cargo:', error);
            throw error;
        }

        return data as ICargoDB;
    },

    async atualizar(id: string, cargo: Partial<ICargoDB>): Promise<ICargoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = cargo;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar cargo:', error);
            throw error;
        }

        return data as ICargoDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir cargo:', error);
            throw error;
        }
    },

    async listarPorSetor(setorId: string): Promise<ICargoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('setor_id', setorId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar cargos por setor:', error);
            throw error;
        }

        return data as ICargoDB[];
    }
};
