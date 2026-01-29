/**
 * Unidades Gestoras Service
 * CRUD operations for management units
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IUnidadeGestoraDB {
    id: string;
    codigo: string;
    orgao_id?: string;
    nome: string;
    nome_abreviado?: string;
    cnpj?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    uf?: string;
    municipio?: string;
    tipo_administracao?: string;
    grupo_indireta?: string;
    normativa_criacao?: string;
    numero_diario_oficial?: string;
    ordenador_despesa?: string;
    email_primario?: string;
    email_secundario?: string;
    telefone?: string;
    ug_siafem_sigef?: string;
    ug_tce?: string;
    ug_siasg?: string;
    tipo_unidade_gestora?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'unidades_gestoras';

export const unidadesService = {
    async listar(termoBusca?: string): Promise<IUnidadeGestoraDB[]> {
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
            console.error('Erro ao listar unidades gestoras:', error);
            throw error;
        }

        return data as IUnidadeGestoraDB[];
    },

    async buscarPorId(id: string): Promise<IUnidadeGestoraDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar unidade gestora:', error);
            throw error;
        }

        return data as IUnidadeGestoraDB;
    },

    async criar(unidade: Omit<IUnidadeGestoraDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IUnidadeGestoraDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...unidade,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar unidade gestora:', error);
            throw error;
        }

        return data as IUnidadeGestoraDB;
    },

    async atualizar(id: string, unidade: Partial<IUnidadeGestoraDB>): Promise<IUnidadeGestoraDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = unidade;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar unidade gestora:', error);
            throw error;
        }

        return data as IUnidadeGestoraDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir unidade gestora:', error);
            throw error;
        }
    },

    async listarPorOrgao(orgaoId: string): Promise<IUnidadeGestoraDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('orgao_id', orgaoId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar unidades por órgão:', error);
            throw error;
        }

        return data as IUnidadeGestoraDB[];
    }
};
