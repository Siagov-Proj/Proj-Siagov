/**
 * Exercícios Financeiros Service
 * CRUD operations for financial years
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IExercicioFinanceiroDB {
    id: string;
    ano: number;
    instituicao_id?: string;
    data_abertura?: string;
    data_fechamento?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_NAME = 'exercicios_financeiros';

export const exerciciosService = {
    async listar(termoBusca?: string): Promise<IExercicioFinanceiroDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('ano', { ascending: false });

        if (termoBusca) {
            const ano = parseInt(termoBusca);
            if (!isNaN(ano)) {
                query = query.eq('ano', ano);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar exercícios financeiros:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB[];
    },

    async buscarPorId(id: string): Promise<IExercicioFinanceiroDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar exercício financeiro:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB;
    },

    async buscarPorAno(ano: number, instituicaoId?: string): Promise<IExercicioFinanceiroDB | null> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('ano', ano)
            .eq('excluido', false);

        if (instituicaoId) {
            query = query.eq('instituicao_id', instituicaoId);
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar exercício por ano:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB;
    },

    async criar(exercicio: Omit<IExercicioFinanceiroDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IExercicioFinanceiroDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...exercicio,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar exercício financeiro:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB;
    },

    async atualizar(id: string, exercicio: Partial<IExercicioFinanceiroDB>): Promise<IExercicioFinanceiroDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = exercicio;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar exercício financeiro:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir exercício financeiro:', error);
            throw error;
        }
    },

    async fecharExercicio(id: string): Promise<IExercicioFinanceiroDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update({
                ativo: false,
                data_fechamento: new Date().toISOString().split('T')[0]
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao fechar exercício financeiro:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB;
    },

    async listarPorInstituicao(instituicaoId: string): Promise<IExercicioFinanceiroDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('instituicao_id', instituicaoId)
            .eq('excluido', false)
            .order('ano', { ascending: false });

        if (error) {
            console.error('Erro ao listar exercícios por instituição:', error);
            throw error;
        }

        return data as IExercicioFinanceiroDB[];
    }
};
