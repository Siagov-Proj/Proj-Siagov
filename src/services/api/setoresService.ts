/**
 * Setores Service
 * CRUD operations for sectors
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ISetorDB {
    id: string;
    codigo: string;
    instituicao_id?: string;
    orgao_id?: string;
    unidade_gestora_id?: string;
    nome: string;
    nome_abreviado?: string;
    email_primario?: string;
    email_secundario?: string;
    telefone_01?: string;
    telefone_02?: string;
    ramal?: string;
    responsavel?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'setores';

export const setoresService = {
    async listar(termoBusca?: string): Promise<ISetorDB[]> {
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
            console.error('Erro ao listar setores:', error);
            throw error;
        }

        return data as ISetorDB[];
    },

    async buscarPorId(id: string): Promise<ISetorDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar setor:', error);
            throw error;
        }

        return data as ISetorDB;
    },

    async criar(setor: Omit<ISetorDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ISetorDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...setor,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar setor:', error);
            throw error;
        }

        return data as ISetorDB;
    },

    async atualizar(id: string, setor: Partial<ISetorDB>): Promise<ISetorDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = setor;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar setor:', error);
            throw error;
        }

        return data as ISetorDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir setor:', error);
            throw error;
        }
    },

    async listarPorUnidadeGestora(unidadeGestoraId: string): Promise<ISetorDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('unidade_gestora_id', unidadeGestoraId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar setores por unidade gestora:', error);
            throw error;
        }

        return data as ISetorDB[];
    }
};
