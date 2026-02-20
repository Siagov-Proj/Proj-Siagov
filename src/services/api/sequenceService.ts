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

        let query = supabase
            .from(tabela)
            .select('codigo')
            .eq('excluido', false)
            .order('codigo', { ascending: false })
            .limit(1);

        // Filtra pelo pai quando a relação é hierárquica
        if (campoPai && idPai) {
            query = query.eq(campoPai, idPai);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Erro ao buscar último código de ${tabela}:`, error);
            return '1'.padStart(tamanhoCodigo, '0');
        }

        if (!data || data.length === 0) {
            // Nenhum registro encontrado, começa do 1
            return '1'.padStart(tamanhoCodigo, '0');
        }

        // Pega o maior código, incrementa +1
        const ultimoCodigo = data[0].codigo;
        const numero = parseInt(ultimoCodigo, 10);

        if (isNaN(numero)) {
            return '1'.padStart(tamanhoCodigo, '0');
        }

        const proximoNumero = numero + 1;
        return String(proximoNumero).padStart(tamanhoCodigo, '0');
    } catch (err) {
        console.error(`Erro inesperado ao gerar código para ${tabela}:`, err);
        return '1'.padStart(tamanhoCodigo, '0');
    }
}

export const sequenceService = {
    gerarProximoCodigo,
};
