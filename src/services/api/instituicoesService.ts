/**
 * Instituições Service
 * CRUD operations for institutions
 */

import { getSupabaseClient } from "@/lib/supabase/client";
import { sanitizeSearchTerm } from "@/utils";

export interface IInstituicaoDB {
    id: string;
    codigo: string;
    nome: string;
    nome_abreviado?: string;
    esfera_id?: string;
    cnpj?: string;
    email?: string;
    codigo_siasg?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
    esfera?: {
        id: string;
        nome: string;
        sigla: string;
    };
}

const TABLE_NAME = 'instituicoes';

export const instituicoesService = {
    async listar(termoBusca?: string): Promise<IInstituicaoDB[]> {
        const supabase = getSupabaseClient();
        let query = supabase
            .from(TABLE_NAME)
            .select('*, esfera:esferas(id, nome, sigla)')
            .eq('excluido', false)
            .order('nome', { ascending: true });

        const termoSanitizado = termoBusca ? sanitizeSearchTerm(termoBusca) : '';

        if (termoSanitizado) {
            query = query.or(`nome.ilike.%${termoSanitizado}%,nome_abreviado.ilike.%${termoSanitizado}%,codigo.ilike.%${termoSanitizado}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao listar instituições:', error);
            throw error;
        }

        return data as IInstituicaoDB[];
    },

    async buscarPorId(id: string): Promise<IInstituicaoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, esfera:esferas(id, nome, sigla)')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Erro ao buscar instituição:', error);
            throw error;
        }

        return data as IInstituicaoDB;
    },

    async criar(instituicao: Omit<IInstituicaoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<IInstituicaoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...instituicao,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar instituição:', error);
            throw error;
        }

        return data as IInstituicaoDB;
    },

    async atualizar(id: string, instituicao: Partial<IInstituicaoDB>): Promise<IInstituicaoDB> {
        const supabase = getSupabaseClient();
        const { id: _, created_at, updated_at, excluido, ...dadosAtualizacao } = instituicao;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dadosAtualizacao)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar instituição:', error);
            throw error;
        }

        return data as IInstituicaoDB;
    },

    async verificarDependencias(id: string): Promise<{ podeExcluir: boolean; relatorios: string[] }> {
        const supabase = getSupabaseClient();
        const relatorios: string[] = [];

        // Verifica órgãos
        const { count: countOrgaos } = await supabase
            .from('orgaos')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', id)
            .eq('excluido', false);

        if (countOrgaos && countOrgaos > 0) {
            relatorios.push(`${countOrgaos} órgão(s) vinculado(s)`);
        }

        // Verifica usuários diretos
        const { count: countUsuarios } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', id)
            .eq('excluido', false);

        if (countUsuarios && countUsuarios > 0) {
            relatorios.push(`${countUsuarios} usuário(s) vinculado(s) diretamente`);
        }

        // Verifica lotações
        const { count: countLotacoes } = await supabase
            .from('usuario_lotacoes')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', id)
            .eq('excluido', false);

        if (countLotacoes && countLotacoes > 0) {
            relatorios.push(`${countLotacoes} lotação(ões) vinculada(s)`);
        }

        return {
            podeExcluir: relatorios.length === 0,
            relatorios
        };
    },

    async excluir(id: string): Promise<void> {
        const dependencias = await this.verificarDependencias(id);
        if (!dependencias.podeExcluir) {
            throw new Error(`Não é possível excluir. Dependências ativas: ${dependencias.relatorios.join(', ')}`);
        }

        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir instituição:', error);
            throw error;
        }
    },

    async listarPorEsfera(esferaId: string): Promise<IInstituicaoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*, esfera:esferas(id, nome, sigla)')
            .eq('esfera_id', esferaId)
            .eq('excluido', false)
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao listar instituições por esfera:', error);
            throw error;
        }

        return data as IInstituicaoDB[];
    },

    async contar(): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar instituições:', error);
            throw error;
        }

        return count || 0;
    },

    async contarOrgaos(instituicaoId: string): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from('orgaos')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', instituicaoId)
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar órgãos da instituição:', error);
            throw error;
        }

        return count ?? 0;
    }
};
