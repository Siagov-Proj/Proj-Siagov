/**
 * Ordenadores Service
 * CRUD operations for expenditure officers
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IOrdenadorDB {
    id: string;
    unidade_gestora_id: string;
    codigo_credor: string;
    nome: string;
    tipo: string;
    cargo?: string;

    // Nomeação
    data_nomeacao?: string;
    ato_nomeacao?: string;
    numero_diario_oficial_nomeacao?: string;
    data_publicacao_nomeacao?: string;

    // Exoneração
    data_exoneracao?: string;
    ato_exoneracao?: string;
    numero_diario_oficial_exoneracao?: string;
    data_publicacao_exoneracao?: string;

    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

type IOrdenadorUpdatePayload = Partial<Omit<IOrdenadorDB, 'id' | 'created_at' | 'updated_at'>>;

const TABLE_NAME = 'ordenadores';

export const ordenadoresService = {
    async listarPorUnidadeGestora(unidadeGestoraId: string): Promise<IOrdenadorDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('unidade_gestora_id', unidadeGestoraId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar ordenadores por unidade gestora:', error);
            throw error;
        }

        return data as IOrdenadorDB[];
    },

    async buscarPorId(id: string): Promise<IOrdenadorDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar ordenador:', error);
            throw error;
        }

        return data as IOrdenadorDB;
    },

    async criar(ordenador: Omit<IOrdenadorDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IOrdenadorDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...ordenador,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar ordenador:', error);
            throw error;
        }

        return data as IOrdenadorDB;
    },

    async atualizar(id: string, ordenador: Partial<IOrdenadorDB>): Promise<IOrdenadorDB> {
        const supabase = getSupabaseClient();
        // Remove campos que não devem ser atualizados diretamente
        const { id: _ignoredId, created_at: _ignoredCreatedAt, updated_at: _ignoredUpdatedAt, ...dadosAtualizacao } = ordenador;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao as IOrdenadorUpdatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar ordenador:', JSON.stringify(error));
            throw new Error(error.message || 'Erro desconhecido ao atualizar');
        }

        return data as IOrdenadorDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir ordenador:', error);
            throw error;
        }
    }
};
