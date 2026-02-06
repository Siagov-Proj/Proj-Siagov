'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useTheme';
import { Moon, Sun, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { updatePassword } from '@/app/auth/actions';

export default function DefinirSenhaPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useThemeStore();

    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updatePassword(senha);

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            } else {
                // Sucesso
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Update password error:', err);
            setError('Ocorreu um erro ao definir a senha.');
            setIsLoading(false);
        }
    };

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
                    Definir Senha
                </h1>
                <p className="text-muted-foreground text-lg">
                    Crie sua senha de acesso ao sistema
                </p>
            </div>

            <Card className="w-full max-w-[400px] shadow-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-xl font-semibold text-left">Nova Senha</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-100 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua nova senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="pl-10 h-11"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmarSenha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirme sua nova senha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="pl-10 h-11"
                                />
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-6">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold bg-[#003366] hover:bg-[#002244] text-white shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Definir Senha'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
