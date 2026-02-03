/**
 * Órgãos Service
 * CRUD operations for government organs
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IOrgaoDB {
    id: string;
    codigo: string;
    instituicao_id?: string;
    poder_vinculado?: string;
    nome: string;
    sigla?: string;
    cnpj?: string;
    codigo_siasg?: string;
    ug_tce?: string;
    ug_siafem_sigef?: string;
    nome_anterior?: string;
    nome_abreviado_anterior?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
    instituicao?: {
        id: string;
        nome: string;
        codigo: string;
    };
}

const TABLE_NAME = 'orgaos';

export const orgaosService = {
    async listar(termoBusca?: string): Promise<IOrgaoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*, instituicao:instituicoes(id, nome, codigo)')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,sigla.ilike.%${termoBusca}%,codigo.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar órgãos:', error);
            throw error;
        }

        return data as IOrgaoDB[];
    },

    async buscarPorId(id: string): Promise<IOrgaoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, instituicao:instituicoes(id, nome, codigo)')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar órgão:', error);
            throw error;
        }

        return data as IOrgaoDB;
    },

    async criar(orgao: Omit<IOrgaoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IOrgaoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...orgao,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar órgão:', error);
            throw error;
        }

        return data as IOrgaoDB;
    },

    async atualizar(id: string, orgao: Partial<IOrgaoDB>): Promise<IOrgaoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = orgao;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar órgão:', error);
            throw error;
        }

        return data as IOrgaoDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir órgão:', error);
            throw error;
        }
    },

    async listarPorInstituicao(instituicaoId: string): Promise<IOrgaoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, instituicao:instituicoes(id, nome, codigo)')
            .eq('instituicao_id', instituicaoId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar órgãos por instituição:', error);
            throw error;
        }

        return data as IOrgaoDB[];
    }
};
