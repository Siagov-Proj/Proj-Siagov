'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthUser, IInstituicao, ILotacaoAuth } from '@/types';

interface AuthState {
    user: IAuthUser | null;
    isAuthenticated: boolean;
    token: string | null;
    exercicioCorrente: number;
    instituicaoCorrente: IInstituicao | null;
    lotacaoAtiva: ILotacaoAuth | null;
    lotacoes: ILotacaoAuth[];

    // Actions
    login: (user: IAuthUser, token: string) => void;
    logout: () => void;
    setExercicioCorrente: (ano: number) => void;
    setInstituicaoCorrente: (instituicao: IInstituicao) => void;
    setLotacaoAtiva: (lotacao: ILotacaoAuth) => void;
    setLotacoes: (lotacoes: ILotacaoAuth[]) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            exercicioCorrente: new Date().getFullYear(),
            instituicaoCorrente: null,
            lotacaoAtiva: null,
            lotacoes: [],

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    lotacoes: user.lotacoes || [],
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    lotacaoAtiva: null,
                    lotacoes: [],
                    instituicaoCorrente: null,
                }),

            setExercicioCorrente: (ano) =>
                set({
                    exercicioCorrente: ano,
                }),

            setInstituicaoCorrente: (instituicao) =>
                set({
                    instituicaoCorrente: instituicao,
                }),

            setLotacaoAtiva: (lotacao) =>
                set({
                    lotacaoAtiva: lotacao,
                }),

            setLotacoes: (lotacoes) =>
                set({
                    lotacoes,
                }),
        }),
        {
            name: 'siagov-auth',
        }
    )
);

// Hook simplificado para uso
export const useAuth = () => {
    const store = useAuthStore();

    return {
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        exercicioCorrente: store.exercicioCorrente,
        instituicaoCorrente: store.instituicaoCorrente,
        lotacaoAtiva: store.lotacaoAtiva,
        lotacoes: store.lotacoes,
        login: store.login,
        logout: store.logout,
        setExercicioCorrente: store.setExercicioCorrente,
        setInstituicaoCorrente: store.setInstituicaoCorrente,
        setLotacaoAtiva: store.setLotacaoAtiva,
        setLotacoes: store.setLotacoes,
    };
};

export default useAuth;
