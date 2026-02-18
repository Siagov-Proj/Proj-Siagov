'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

// Componente interno que usa useSearchParams — deve estar dentro de <Suspense>
function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border-red-100 dark:border-red-900">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-500">Erro de Autenticação</CardTitle>
                    <CardDescription>
                        Não foi possível concluir sua solicitação.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        O link que você acessou pode estar expirado, ser inválido ou já ter sido utilizado.
                    </p>
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-md text-sm font-mono break-all">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="w-full">
                        <Button className="w-full bg-[#003366] hover:bg-[#002244]">
                            Voltar para o Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

// Página principal envolve o conteúdo com Suspense (obrigatório para useSearchParams no Next.js 15)
export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
