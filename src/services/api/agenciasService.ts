/**
 * Agências Service
 * CRUD operations for bank branches
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IAgenciaDB {
    id: string;
    banco_id?: string;
    codigo_banco?: string;
    codigo: string;
    digito_verificador?: string;
    nome: string;
    nome_abreviado?: string;
    cnpj?: string;
    praca?: string;
    gerente?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    telefone?: string;
    email?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'agencias';

export const agenciasService = {
    async listar(termoBusca?: string): Promise<IAgenciaDB[]> {
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
            console.error('Erro ao listar agências:', error);
            throw error;
        }

        return data as IAgenciaDB[];
    },

    async buscarPorId(id: string): Promise<IAgenciaDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar agência:', error);
            throw error;
        }

        return data as IAgenciaDB;
    },

    async criar(agencia: Omit<IAgenciaDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IAgenciaDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...agencia,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar agência:', error);
            throw error;
        }

        return data as IAgenciaDB;
    },

    async atualizar(id: string, agencia: Partial<IAgenciaDB>): Promise<IAgenciaDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = agencia;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar agência:', error);
            throw error;
        }

        return data as IAgenciaDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir agência:', error);
            throw error;
        }
    },

    async listarPorBanco(bancoId: string): Promise<IAgenciaDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('banco_id', bancoId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar agências por banco:', error);
            throw error;
        }

        return data as IAgenciaDB[];
    }
};
