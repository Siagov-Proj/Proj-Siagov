/**
 * Títulos Normativos Service
 * CRUD operations for normative titles (linked to a law)
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ITituloNormativoDB {
    id: string;
    lei_id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
    lei?: {
        id: string;
        nome: string;
    };
}

const TABLE_NAME = 'titulos_normativos';

export const titulosNormativosService = {
    async listar(leiId?: string): Promise<ITituloNormativoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*, lei:leis_normativas(id, nome)')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (leiId) {
            query = query.eq('lei_id', leiId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar títulos:', error);
            throw error;
        }

        return data as ITituloNormativoDB[];
    },

    async listarPorLei(leiId: string): Promise<ITituloNormativoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, lei:leis_normativas(id, nome)')
            .eq('lei_id', leiId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar títulos por lei:', error);
            throw error;
        }

        return data as ITituloNormativoDB[];
    },

    async buscarPorId(id: string): Promise<ITituloNormativoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, lei:leis_normativas(id, nome)')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar título:', error);
            throw error;
        }

        return data as ITituloNormativoDB;
    },

    async criar(titulo: Omit<ITituloNormativoDB, 'id' | 'created_at' | 'updated_at' | 'excluido' | 'lei'>): Promise<ITituloNormativoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...titulo,
                excluido: false,
            })
            .select('*, lei:leis_normativas(id, nome)')
            .single();

        if (error) {
            console.error('Erro ao criar título:', error);
            throw error;
        }

        return data as ITituloNormativoDB;
    },

    async atualizar(id: string, titulo: Partial<ITituloNormativoDB>): Promise<ITituloNormativoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, lei, ...dadosAtualizacao } = titulo;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select('*, lei:leis_normativas(id, nome)')
            .single();

        if (error) {
            console.error('Erro ao atualizar título:', error);
            throw error;
        }

        return data as ITituloNormativoDB;
    },

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir título:', error);
            throw error;
        }
    },

    async buscarOuCriarPorNome(leiId: string, nome: string): Promise<ITituloNormativoDB> {
        const supabase = getSupabaseClient();

        // Primeiro, tenta encontrar um título existente com esse nome para essa lei
        const { data: existente } = await supabase
            .from(TABLE_NAME)
            .select('*, lei:leis_normativas(id, nome)')
            .eq('lei_id', leiId)
            .eq('nome', nome)
            .eq('excluido', false)
            .single();

        if (existente) {
            return existente as ITituloNormativoDB;
        }

        // Se não existe, cria um novo
        return this.criar({
            lei_id: leiId,
            nome,
            ativo: true,
        });
    },
};
