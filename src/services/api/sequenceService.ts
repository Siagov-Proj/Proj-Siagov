/**
 * Sequence Service
 * Geração de códigos sequenciais para entidades de cadastro
 */

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Gera o próximo código sequencial para uma entidade.
 * 
 * @param tabela - Nome da tabela no Supabase (ex: 'instituicoes', 'orgaos')
 * @param tamanhoCodigo - Quantidade de dígitos do código (ex: 3, 4, 6)
 * @param campoPai - Nome do campo FK pai (ex: 'instituicao_id', 'orgao_id'). Opcional para entidades raiz.
 * @param idPai - ID do registro pai. Obrigatório quando campoPai é informado.
 * @returns Código sequencial formatado com zeros à esquerda
 */
export async function gerarProximoCodigo(
    tabela: string,
    tamanhoCodigo: number,
    campoPai?: string,
    idPai?: string
): Promise<string> {
    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.rpc('gerar_codigo_sequencial', {
            p_tabela: tabela,
            p_tamanho: tamanhoCodigo,
            p_campo_pai: campoPai || null,
            p_id_pai: idPai || null
        });

        if (error) {
            console.error(`Erro RPC ao gerar código para ${tabela}:`, error);
            throw error;
        }

        return data as string;
    } catch (err) {
        console.error(`Erro inesperado ao gerar código para ${tabela}:`, err);
        throw err;
    }
}

export const sequenceService = {
    gerarProximoCodigo,
};
