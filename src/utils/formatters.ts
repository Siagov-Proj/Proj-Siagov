// ============================================
// SIAGOV - Formatters and Validators
// ============================================

import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data para exibição: DD/MM/YYYY
 */
export const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata data e hora para exibição: DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Formata valor monetário para Real Brasileiro
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Formata número com separadores de milhar
 */
export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Valida CNPJ
 */
export const validateCnpj = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return cleaned.charAt(12) === digit1.toString() && cleaned.charAt(13) === digit2.toString();
};

/**
 * Valida CPF
 */
export const validateCpf = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit1 = (sum * 10) % 11;
    if (digit1 === 10) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    let digit2 = (sum * 10) % 11;
    if (digit2 === 10) digit2 = 0;

    return cleaned.charAt(9) === digit1.toString() && cleaned.charAt(10) === digit2.toString();
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Trunca texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza primeira letra de cada palavra
 */
export const capitalizeWords = (text: string): string => {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Converte texto para uppercase
 */
export const toUpperCase = (text: string): string => {
    return text.toUpperCase();
};

/**
 * Gera código sequencial com zeros à esquerda
 * @param currentCount - Número atual de itens
 * @param length - Tamanho do código
 */
export const generateSequentialCode = (currentCount: number, length: number = 3): string => {
    return String(currentCount + 1).padStart(length, '0');
};

export const formatters = {
    date: formatDate,
    dateTime: formatDateTime,
    currency: formatCurrency,
    number: formatNumber,
    truncate: truncateText,
    capitalize: capitalizeWords,
    uppercase: toUpperCase,
    sequentialCode: generateSequentialCode,
};

export const validators = {
    cnpj: validateCnpj,
    cpf: validateCpf,
    email: validateEmail,
};

// Aliases para compatibilidade
export const formatDateBR = formatDate;
export const formatDateTimeBR = formatDateTime;

export default { formatters, validators };
