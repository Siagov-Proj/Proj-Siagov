'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useTheme';
import { useAuthStore } from '@/hooks/useAuth';
import { Moon, Sun, Eye, EyeOff, Loader2, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { maskCpf } from '@/utils/masks';
import { loginWithCpf } from '@/app/auth/actions';

export default function LoginPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useThemeStore();
    const { login: syncStore } = useAuthStore();

    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        const rawCpf = cpf.replace(/\D/g, '');
        formData.set('cpf', rawCpf);
        formData.set('password', senha);

        try {
            const result = await loginWithCpf(formData);

            if (result?.success && result.user) {
                // Sincroniza o estado do Zustand com os dados retornados
                // O token 'authenticated' é apenas um placeholder pois o Supabase usa cookies
                syncStore(result.user, 'authenticated');

                // Redireciona via router do client
                router.push('/dashboard');
                return;
            }

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Login action error:', err);
            setError('Ocorreu um erro ao tentar fazer login.');
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
                    Bem-vindo ao SIAGOV
                </h1>
                <p className="text-muted-foreground text-lg">
                    Sistema Integrado de Administração Governamental
                </p>
            </div>

            <Card className="w-full max-w-[400px] shadow-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-xl font-semibold text-left">Acesse sua conta</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-100 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="cpf"
                                    type="text"
                                    placeholder="Digite seu CPF"
                                    value={cpf}
                                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                                    disabled={isLoading}
                                    required
                                    className="pl-10 h-11"
                                    maxLength={14}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="senha"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Digite sua senha"
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
                            <div className="flex justify-end">
                                <Link
                                    href="/esqueci-senha"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                                >
                                    Esqueci minha senha
                                </Link>
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
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>

                        <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-semibold mb-1">Credenciais de demonstração:</p>
                            <p>Usuário (CPF): 123.456.789-00</p>
                            <p>Senha: 123456</p>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>© 2024 SIAGOV - Todos os direitos reservados</p>
            </div>
        </div>
    );
}
