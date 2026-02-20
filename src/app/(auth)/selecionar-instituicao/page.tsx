'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/hooks/useTheme';
import { Building2, Moon, Sun, LogOut, ChevronRight } from 'lucide-react';
import { logout as logoutAction } from '@/app/auth/actions';
import type { ILotacaoAuth } from '@/types';

export default function SelecionarInstituicaoPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useThemeStore();
    const { user, lotacoes, setLotacaoAtiva, logout: logoutStore } = useAuthStore();

    const handleSelecionarInstituicao = (lotacao: ILotacaoAuth) => {
        setLotacaoAtiva(lotacao);
        router.push('/dashboard');
    };

    const handleLogout = async () => {
        logoutStore();
        await logoutAction();
    };

    // Se não há lotações ou user, redirecionar
    if (!user || lotacoes.length === 0) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="absolute top-4 right-4"
            >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="text-center mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Selecione a Instituição
                </h1>
                <p className="text-muted-foreground text-lg">
                    Olá, <span className="font-medium">{user.nome}</span>! Você está vinculado a mais de uma instituição.
                </p>
                <p className="text-muted-foreground">
                    Escolha qual deseja acessar agora:
                </p>
            </div>

            <div className="w-full max-w-2xl space-y-4">
                {lotacoes.map((lotacao) => (
                    <Card
                        key={lotacao.lotacaoId}
                        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-700 border-2 border-transparent"
                        onClick={() => handleSelecionarInstituicao(lotacao)}
                    >
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {lotacao.instituicaoNome}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm font-mono text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {lotacao.instituicaoCodigo}
                                    </span>
                                    <span className="text-sm text-muted-foreground capitalize">
                                        Perfil: {lotacao.perfilAcesso}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair e usar outra conta
                </Button>

                <p className="text-sm text-muted-foreground">
                    © 2024 SIAGOV - Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}
