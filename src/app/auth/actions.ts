
'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginWithCpf(formData: FormData) {
    const cpf = formData.get('cpf') as string;
    const password = formData.get('password') as string;

    if (!cpf || !password) {
        return { error: 'CPF e senha são obrigatórios' };
    }

    const supabase = await createClient();

    // 1. Lookup Email by CPF
    // Note: This query requires permission to read 'usuarios' table.
    // If RLS blocks this for unauthenticated users, this step fails.
    // We assume 'usuarios' table allows reading by anyone OR we need a service bypass.
    // For now, let's assume public.usuarios is readable or we are using a function.

    // Ideally, use: supabase.rpc('get_email_by_cpf', { cpf_input: cpf })
    // But let's try direct query first.
    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('email_institucional')
        .eq('cpf', cpf)
        .single();

    if (userError || !userData?.email_institucional) {
        console.error('Login Lookup Error:', userError?.message);
        return { error: 'Usuário não encontrado ou credenciais inválidas.' };
    }

    const email = userData.email_institucional;

    // 2. Sign In
    const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Login Auth Error:', authError.message);
        return { error: 'Senha incorreta.' }; // Avoid specific messages if strict security needed, but convenient here.
    }

    redirect('/dashboard');
}

export async function recoverPassword(formData: FormData) {
    const cpf = formData.get('cpf') as string;

    if (!cpf) return { error: 'CPF obrigatório' };

    const supabase = await createClient();

    // 1. Lookup Email
    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('email_institucional')
        .eq('cpf', cpf)
        .single();

    if (userError || !userData?.email_institucional) {
        return { error: 'CPF não encontrado.' };
    }

    const email = userData.email_institucional;

    // 2. Send Recovery Email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (resetError) {
        console.error('Reset Error:', resetError.message);
        return { error: 'Erro ao enviar email de recuperação.' };
    }

    return { success: 'Email de recuperação enviado com sucesso!' };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
