/**
 * Permissões Service
 * CRUD for permissões and cargo_permissao
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface IPermissaoDB {
    id: string;
    modulo: string;
    acao: string;
    descricao: string | null;
    created_at: string;
}

export interface ICargoPermissaoDB {
    id: string;
    cargo_id: string;
    permissao_id: string;
    created_at: string;
}

export const permissoesService = {
    /**
     * Lista todas as permissões disponíveis ordenadas por módulo
     */
    async listar(): Promise<IPermissaoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('permissoes')
            .select('*')
            .order('modulo', { ascending: true })
            .order('acao', { ascending: true });

        if (error) {
            console.error('Erro ao listar permissões:', error);
            throw error;
        }

        return data as IPermissaoDB[];
    },

    /**
     * Lista IDs de permissões de um cargo
     */
    async listarPorCargo(cargoId: string): Promise<string[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('cargo_permissao')
            .select('permissao_id')
            .eq('cargo_id', cargoId);

        if (error) {
            console.error('Erro ao listar permissões do cargo:', error);
            throw error;
        }

        return (data || []).map((item: any) => item.permissao_id);
    },

    /**
     * Salva as permissões de um cargo (delete + insert)
     */
    async salvarPermissoesCargo(cargoId: string, permissaoIds: string[]): Promise<void> {
        const supabase = getSupabaseClient();

        // Remove todas as permissões atuais
        const { error: deleteError } = await supabase
            .from('cargo_permissao')
            .delete()
            .eq('cargo_id', cargoId);

        if (deleteError) {
            console.error('Erro ao remover permissões:', deleteError);
            throw deleteError;
        }

        // Insere as novas
        if (permissaoIds.length > 0) {
            const inserts = permissaoIds.map(permissao_id => ({
                cargo_id: cargoId,
                permissao_id,
            }));

            const { error: insertError } = await supabase
                .from('cargo_permissao')
                .insert(inserts);

            if (insertError) {
                console.error('Erro ao inserir permissões:', insertError);
                throw insertError;
            }
        }
    },
};
