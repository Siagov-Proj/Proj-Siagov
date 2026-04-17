'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { maskCpf } from '@/utils/masks';
import { loginWithCpf } from '@/app/auth/actions';

export default function LoginPage() {
    const router = useRouter();
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
                syncStore(result.user, 'authenticated');

                const lotacoes = result.user.lotacoes || [];

                if (lotacoes.length === 1) {
                    const { setLotacaoAtiva } = useAuthStore.getState();
                    setLotacaoAtiva(lotacoes[0]);
                    router.push('/dashboard');
                } else if (lotacoes.length > 1) {
                    router.push('/selecionar-instituicao');
                } else {
                    router.push('/dashboard');
                }
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
        <div
            className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
            style={{
                backgroundImage: "url('/Tela_de_fundo_Login_SINGRA.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Inner container - two columns */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-8 md:px-16 gap-8 py-12">

                {/* Left Side - SINGRA Logo */}
                <div className="hidden md:flex flex-col items-center justify-center flex-1">
                    <Image
                        src="/Logo_SINGRA_Vertical.png"
                        alt="SINGRA - Sistema Integrado de Gestão Administrativa"
                        width={850}
                        height={750}
                        priority
                        className="object-contain mix-blend-multiply" 
                        style={{ filter: "brightness(1.05) contrast(1.05)" }}
                    />
                </div>

                {/* Right Side - Login Card */}
                <div className="w-full md:w-auto md:min-w-[380px] md:max-w-[420px]">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6">

                        {/* Card Header */}
                        <h1 className="text-xl font-semibold text-gray-800">
                            Acesso ao sistema
                        </h1>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                            {/* Error message */}
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            {/* CPF Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                                    CPF
                                </Label>
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
                                        className="pl-10 h-11 border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400"
                                        maxLength={14}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                                    Senha
                                </Label>
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
                                        className="pl-10 pr-11 h-11 border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Forgot password */}
                                <div className="flex justify-end mt-0.5">
                                    <Link
                                        href="/esqueci-senha"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        Esqueci minha senha
                                    </Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold rounded-lg mt-2 bg-[#1a3a6e] hover:bg-[#152e57] text-white"
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
                        </form>

                        {/* Footer */}
                        <div className="flex flex-col items-center gap-3 pt-2 border-t border-gray-100">
                            <Image
                                src="/Logo_SIAGOV.png"
                                alt="SIAGOV - Assessoria e Consultoria em Gestão Governamental"
                                width={140}
                                height={48}
                                className="object-contain opacity-85 mt-2"
                            />
                            <p className="text-xs text-gray-400">
                                © 2026 SIAGOV - Todos os direitos reservados
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
