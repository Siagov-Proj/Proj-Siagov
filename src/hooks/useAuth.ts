'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthUser, IInstituicao } from '@/types';

interface AuthState {
    user: IAuthUser | null;
    isAuthenticated: boolean;
    token: string | null;
    exercicioCorrente: number;
    instituicaoCorrente: IInstituicao | null;

    // Actions
    login: (user: IAuthUser, token: string) => void;
    logout: () => void;
    setExercicioCorrente: (ano: number) => void;
    setInstituicaoCorrente: (instituicao: IInstituicao) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            exercicioCorrente: new Date().getFullYear(),
            instituicaoCorrente: null,

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),

            setExercicioCorrente: (ano) =>
                set({
                    exercicioCorrente: ano,
                }),

            setInstituicaoCorrente: (instituicao) =>
                set({
                    instituicaoCorrente: instituicao,
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
        login: store.login,
        logout: store.logout,
        setExercicioCorrente: store.setExercicioCorrente,
        setInstituicaoCorrente: store.setInstituicaoCorrente,
    };
};

export default useAuth;
