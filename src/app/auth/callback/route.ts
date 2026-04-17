import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = next;
    redirectTo.searchParams.delete('token_hash');
    redirectTo.searchParams.delete('type');
    redirectTo.searchParams.delete('code');
    redirectTo.searchParams.delete('next');

    const supabase = await createClient();

    // Flow 1: PKCE (padrão Supabase v2+ SSR) — recebe `code`
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Verifica se o usuário precisa definir senha (invite ou recovery)
            const { data: { user } } = await supabase.auth.getUser();
            const isInviteOrRecovery = user?.app_metadata?.provider === 'email'
                && (!user?.user_metadata?.password_set);

            // Se o type query param indicar invite/recovery, redireciona para definir senha
            if (type === 'invite' || type === 'recovery' || isInviteOrRecovery) {
                redirectTo.pathname = '/definir-senha';
            }
            return NextResponse.redirect(redirectTo);
        }

        console.error('Auth Callback Error (PKCE):', error);
    }

    // Flow 2: Implicit/Magic Link — recebe `token_hash` + `type`
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            if (type === 'invite' || type === 'recovery') {
                redirectTo.pathname = '/definir-senha';
            }
            return NextResponse.redirect(redirectTo);
        }

        console.error('Auth Callback Error (OTP):', error);
    }

    // Nenhum parâmetro válido encontrado — redireciona para erro
    redirectTo.pathname = '/auth/error';
    return NextResponse.redirect(redirectTo);
}
