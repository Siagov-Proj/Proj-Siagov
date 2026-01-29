// ============================================
// SIAGOV - Mask Utilities
// ============================================

/**
 * Aplica máscara de CNPJ: 00.000.000/0001-00
 */
export const maskCnpj = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 18);
};

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const maskCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .substring(0, 14);
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const maskCep = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

/**
 * Aplica máscara de telefone
 * 10 dígitos: (00) 0000-0000
 * 11 dígitos: (00) 00000-0000
 */
export const maskTelefone = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
        return numbers
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .substring(0, 14);
    }
    return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
};

/**
 * Formata código com zeros à esquerda
 * @param value - Valor a ser formatado
 * @param length - Tamanho esperado (ex: 3 para 001, 6 para 000001)
 */
export const maskCodigoComZeros = (value: string, length: number): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers.padStart(length, "0").substring(0, length);
};

/**
 * Aplica máscara de NIT/PIS/PASEP: 000.00000.00-0
 */
export const maskNitPisPasep = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{5})(\d)/, "$1.$2")
        .replace(/(\d{2})(\d{1})/, "$1-$2")
        .substring(0, 14);
};

/**
 * Aplica máscara de Inscrição Estadual (genérica)
 */
export const maskInscricaoEstadual = (value: string): string => {
    return value.replace(/[^0-9a-zA-Z]/g, "").substring(0, 20);
};

/**
 * Remove todos os caracteres não numéricos
 */
export const removeNonDigits = (value: string): string => {
    return value.replace(/\D/g, "");
};

/**
 * Remove máscara e retorna apenas números
 */
export const unmask = (value: string): string => {
    return value.replace(/\D/g, "");
};

// Objeto agrupando todas as máscaras para uso conveniente
export const masks = {
    cnpj: maskCnpj,
    cpf: maskCpf,
    cep: maskCep,
    telefone: maskTelefone,
    codigoComZeros: maskCodigoComZeros,
    nitPisPasep: maskNitPisPasep,
    inscricaoEstadual: maskInscricaoEstadual,
    removeNonDigits,
    unmask,
};

export default masks;
