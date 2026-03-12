/**
 * Órgãos Service
 * CRUD operations for government organs
 */

import { getSupabaseClient } from "@/lib/supabase/client";
import { sanitizeSearchTerm } from "@/utils";

export interface IOrgaoDB {
    id: string;
    codigo: string;
    instituicao_id?: string;
    poder_vinculado?: string;
    nome: string;
    sigla?: string;
    cnpj?: string;
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

        const termoSanitizado = termoBusca ? sanitizeSearchTerm(termoBusca) : '';

        if (termoSanitizado) {
            query = query.or(`nome.ilike.%${termoSanitizado}%,sigla.ilike.%${termoSanitizado}%,codigo.ilike.%${termoSanitizado}%`);
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

    async verificarDependencias(id: string): Promise<{ podeExcluir: boolean; relatorios: string[] }> {
        const supabase = getSupabaseClient();
        const relatorios: string[] = [];

        // Verifica UGs
        const { count: countUgs } = await supabase
            .from('unidades_gestoras')
            .select('*', { count: 'exact', head: true })
            .eq('orgao_id', id)
            .eq('excluido', false);

        if (countUgs && countUgs > 0) {
            relatorios.push(`${countUgs} unidade(s) gestora(s) vinculada(s)`);
        }

        // Verifica Setores
        const { count: countSetores } = await supabase
            .from('setores')
            .select('*', { count: 'exact', head: true })
            .eq('orgao_id', id)
            .eq('excluido', false);

        if (countSetores && countSetores > 0) {
            relatorios.push(`${countSetores} setor(es) vinculado(s)`);
        }

        // Verifica usuários
        const { count: countUsuarios } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('orgao_id', id)
            .eq('excluido', false);

        if (countUsuarios && countUsuarios > 0) {
            relatorios.push(`${countUsuarios} usuário(s) vinculado(s)`);
        }

        // Verifica lotações
        const { count: countLotacoes } = await supabase
            .from('usuario_lotacoes')
            .select('*', { count: 'exact', head: true })
            .eq('orgao_id', id)
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
    },

    async contarUnidadesGestoras(orgaoId: string): Promise<number> {
        const supabase = getSupabaseClient();
        const { count, error } = await supabase
            .from('unidades_gestoras')
            .select('*', { count: 'exact', head: true })
            .eq('orgao_id', orgaoId)
            .eq('excluido', false);

        if (error) {
            console.error('Erro ao contar unidades gestoras do órgão:', error);
            throw error;
        }

        return count ?? 0;
    }
};
