/**
 * Lotações Service
 * CRUD operations for user-institution assignments (múltipla lotação)
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface ILotacaoDB {
    id: string;
    usuario_id: string;
    instituicao_id: string;
    orgao_id?: string;
    unidade_gestora_id?: string;
    setor_id?: string;
    cargo_id?: string;
    ug_origem_id?: string;
    perfil_acesso: string;
    ativo: boolean;
    excluido: boolean;
    created_at: string;
    updated_at: string;
}

export interface ILotacaoComInstituicao extends ILotacaoDB {
    instituicoes?: {
        id: string;
        codigo: string;
        nome: string;
        nome_abreviado: string;
    };
}

const TABLE_NAME = 'usuario_lotacoes';

export const lotacoesService = {
    /**
     * Lista todas as lotações de um usuário com dados da instituição
     */
    async listarPorUsuario(usuarioId: string): Promise<ILotacaoComInstituicao[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                instituicoes (
                    id,
                    codigo,
                    nome,
                    nome_abreviado
                )
            `)
            .eq('usuario_id', usuarioId)
            .eq('excluido', false)
            .eq('ativo', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Erro ao listar lotações:', error);
            throw error;
        }

        return data as ILotacaoComInstituicao[];
    },

    /**
     * Lista instituições vinculadas a um usuário (para tela de seleção pós-login)
     */
    async listarInstituicoesPorUsuario(usuarioId: string): Promise<{
        lotacaoId: string;
        instituicao: {
            id: string;
            codigo: string;
            nome: string;
            nome_abreviado: string;
        };
        orgao_id?: string;
        unidade_gestora_id?: string;
        setor_id?: string;
        cargo_id?: string;
        perfil_acesso: string;
    }[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                id,
                orgao_id,
                unidade_gestora_id,
                setor_id,
                cargo_id,
                perfil_acesso,
                instituicoes (
                    id,
                    codigo,
                    nome,
                    nome_abreviado
                )
            `)
            .eq('usuario_id', usuarioId)
            .eq('excluido', false)
            .eq('ativo', true);

        if (error) {
            console.error('Erro ao listar instituições do usuário:', error);
            throw error;
        }

        return (data || []).map((item: any) => ({
            lotacaoId: item.id,
            instituicao: item.instituicoes,
            orgao_id: item.orgao_id,
            unidade_gestora_id: item.unidade_gestora_id,
            setor_id: item.setor_id,
            cargo_id: item.cargo_id,
            perfil_acesso: item.perfil_acesso,
        }));
    },

    /**
     * Cria uma nova lotação para um usuário
     */
    async criar(lotacao: Omit<ILotacaoDB, 'id' | 'created_at' | 'updated_at' | 'excluido'>): Promise<ILotacaoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                ...lotacao,
                excluido: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar lotação:', error);
            throw error;
        }

        return data as ILotacaoDB;
    },

    /**
     * Remove uma lotação (soft delete)
     */
    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir lotação:', error);
            throw error;
        }
    },
};
