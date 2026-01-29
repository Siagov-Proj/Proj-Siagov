/**
 * Categorias de Documentos Service
 * CRUD operations for document categories and subcategories
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ICategoriaDocumentoDB {
    id: string;
    nome: string;
    descricao?: string;
    lei?: string;
    cor?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

export interface ISubcategoriaDocumentoDB {
    id: string;
    categoria_id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

const TABLE_CATEGORIAS = 'categorias_documentos';
const TABLE_SUBCATEGORIAS = 'subcategorias_documentos';

export const categoriasDocService = {
    // ========== CATEGORIAS ==========
    async listarCategorias(termoBusca?: string): Promise<ICategoriaDocumentoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_CATEGORIAS)
            .select('*')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (termoBusca) {
            query = query.or(`nome.ilike.%${termoBusca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar categorias:', error);
            throw error;
        }

        return data as ICategoriaDocumentoDB[];
    },

    async buscarCategoriaPorId(id: string): Promise<ICategoriaDocumentoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_CATEGORIAS)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar categoria:', error);
            throw error;
        }

        return data as ICategoriaDocumentoDB;
    },

    async criarCategoria(categoria: Omit<ICategoriaDocumentoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ICategoriaDocumentoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_CATEGORIAS)
            .insert({
                ...categoria,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }

        return data as ICategoriaDocumentoDB;
    },

    async atualizarCategoria(id: string, categoria: Partial<ICategoriaDocumentoDB>): Promise<ICategoriaDocumentoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = categoria;

        const { data, error } = await supabase
            .from(TABLE_CATEGORIAS)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }

        return data as ICategoriaDocumentoDB;
    },

    async excluirCategoria(id: string): Promise<void> {
        const supabase = getSupabaseClient();

        // Primeiro exclui as subcategorias
        await supabase
            .from(TABLE_SUBCATEGORIAS)
            .update({ excluido: true })
            .eq('categoria_id', id);

        // Depois exclui a categoria
        const { error } = await supabase
            .from(TABLE_CATEGORIAS)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir categoria:', error);
            throw error;
        }
    },

    // ========== SUBCATEGORIAS ==========
    async listarSubcategorias(categoriaId: string): Promise<ISubcategoriaDocumentoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .select('*')
            .eq('categoria_id', categoriaId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar subcategorias:', error);
            throw error;
        }

        return data as ISubcategoriaDocumentoDB[];
    },

    async buscarSubcategoriaPorId(id: string): Promise<ISubcategoriaDocumentoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar subcategoria:', error);
            throw error;
        }

        return data as ISubcategoriaDocumentoDB;
    },

    async criarSubcategoria(subcategoria: Omit<ISubcategoriaDocumentoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ISubcategoriaDocumentoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .insert({
                ...subcategoria,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar subcategoria:', error);
            throw error;
        }

        return data as ISubcategoriaDocumentoDB;
    },

    async atualizarSubcategoria(id: string, subcategoria: Partial<ISubcategoriaDocumentoDB>): Promise<ISubcategoriaDocumentoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = subcategoria;

        const { data, error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar subcategoria:', error);
            throw error;
        }

        return data as ISubcategoriaDocumentoDB;
    },

    async excluirSubcategoria(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir subcategoria:', error);
            throw error;
        }
    },

    async contarSubcategorias(categoriaId: string): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from(TABLE_SUBCATEGORIAS)
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoriaId)
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar subcategorias:', error);
            return 0;
        }

        return count || 0;
    }
};
