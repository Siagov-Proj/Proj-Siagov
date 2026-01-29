'use client';

import { useCallback } from 'react';
import { masks } from '@/utils/masks';

/**
 * Hook para aplicar máscaras em inputs
 */
export const useMasks = () => {
    const applyCnpjMask = useCallback((value: string) => {
        return masks.cnpj(value);
    }, []);

    const applyCpfMask = useCallback((value: string) => {
        return masks.cpf(value);
    }, []);

    const applyCepMask = useCallback((value: string) => {
        return masks.cep(value);
    }, []);

    const applyTelefoneMask = useCallback((value: string) => {
        return masks.telefone(value);
    }, []);

    const applyCodigoMask = useCallback((value: string, length: number) => {
        return masks.codigoComZeros(value, length);
    }, []);

    const removeMask = useCallback((value: string) => {
        return masks.unmask(value);
    }, []);

    return {
        applyCnpjMask,
        applyCpfMask,
        applyCepMask,
        applyTelefoneMask,
        applyCodigoMask,
        removeMask,
        masks,
    };
};

export default useMasks;
