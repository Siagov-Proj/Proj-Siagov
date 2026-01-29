/**
 * Usuários Service
 * CRUD operations for system users
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IUsuarioDB {
    id: string;
    codigo: string;
    instituicao_id?: string;
    orgao_id?: string;
    unidade_gestora_id?: string;
    setor_id?: string;
    cargo_id?: string;
    cpf: string;
    nome: string;
    nome_credor?: string;
    matricula?: string;
    vinculo?: string;
    ug_origem_id?: string;
    email_institucional?: string;
    email_pessoal?: string;
    telefone_01?: string;
    telefone_whatsapp?: string;
    permissoes?: string[];
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'usuarios';

export const usuariosService = {
    async listar(termoBusca?: string): Promise<IUsuarioDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%,cpf.ilike.%${termoBusca}%,email_institucional.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }

        return data as IUsuarioDB[];
    },

    async buscarPorId(id: string): Promise<IUsuarioDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }

        return data as IUsuarioDB;
    },

    async buscarPorCpf(cpf: string): Promise<IUsuarioDB | null> {
        const supabase = getSupabaseClient();
        // Remove formatação do CPF
        const cpfLimpo = cpf.replace(/\D/g, '');

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('cpf', cpfLimpo)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar usuário por CPF:', error);
            throw error;
        }

        return data as IUsuarioDB;
    },

    async criar(usuario: Omit<IUsuarioDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IUsuarioDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...usuario,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }

        return data as IUsuarioDB;
    },

    async atualizar(id: string, usuario: Partial<IUsuarioDB>): Promise<IUsuarioDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = usuario;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }

        return data as IUsuarioDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir usuário:', error);
            throw error;
        }
    },

    async listarPorSetor(setorId: string): Promise<IUsuarioDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('setor_id', setorId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar usuários por setor:', error);
            throw error;
        }

        return data as IUsuarioDB[];
    }
};
