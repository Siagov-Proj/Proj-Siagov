/**
 * Base Service Factory for Supabase CRUD operations
 * Provides standard operations with soft delete support
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface BaseEntity {
    id: string;
    excluido?: boolean;
    created_at?: string;
    updated_at?: string;
}

export function createBaseService<T extends BaseEntity>(tableName: string) {
    return {
        /**
         * Lista todos os registros não excluídos
         */
        async listar(filtros?: Record<string, unknown>): Promise<T[]> {
            const supabase = getSupabaseClient();
            let query = supabase
                .from(tableName)
                .select('*')
                .eq('excluido', false)
                .order('created_at', { ascending: false });

            if (filtros) {
                Object.entries(filtros).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (typeof value === 'string' && key.endsWith('_like')) {
                            const field = key.replace('_like', '');
                            query = query.ilike(field, `%${value}%`);
                        } else {
                            query = query.eq(key, value);
                        }
                    }
                });
            }

            const { data, error } = await query;

            if (error) {
                console.error(`Erro ao listar ${tableName}:`, error);
                throw error;
            }

            return data as T[];
        },

        /**
         * Busca um registro por ID
         */
        async buscarPorId(id: string): Promise<T | null> {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', id)
                .eq('excluido', false)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error(`Erro ao buscar ${tableName} por id:`, error);
                throw error;
            }

            return data as T;
        },

        /**
         * Cria um novo registro
         */
        async criar(dados: Omit<T, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<T> {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from(tableName)
                .insert({
                    ...dados,
                    excluido: false,
                })
                .select()
                .single();

            if (error) {
                console.error(`Erro ao criar ${tableName}:`, error);
                throw error;
            }

            return data as T;
        },

        /**
         * Atualiza um registro existente
         */
        async atualizar(id: string, dados: Partial<T>): Promise<T> {
            const supabase = getSupabaseClient();

            // Remove campos que não devem ser atualizados diretamente
            const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = dados as Record<string, unknown>;

            const { data, error } = await supabase
                .from(tableName)
                .update(dadosAtualizacao)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error(`Erro ao atualizar ${tableName}:`, error);
                throw error;
            }

            return data as T;
        },

        /**
         * Exclusão lógica (soft delete)
         */
        async excluir(id: string): Promise<void> {
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from(tableName)
                .update({ excluido: true })
                .eq('id', id);

            if (error) {
                console.error(`Erro ao excluir ${tableName}:`, error);
                throw error;
            }
        },

        /**
         * Conta registros não excluídos
         */
        async contar(filtros?: Record<string, unknown>): Promise<number> {
            const supabase = getSupabaseClient();
            let query = supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true })
                .eq('excluido', false);

            if (filtros) {
                Object.entries(filtros).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        query = query.eq(key, value);
                    }
                });
            }

            const { count, error } = await query;

            if (error) {
                console.error(`Erro ao contar ${tableName}:`, error);
                throw error;
            }

            return count || 0;
        }
    };
}
