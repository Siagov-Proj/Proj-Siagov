
'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginWithCpf(formData: FormData) {
    const rawCpf = formData.get('cpf') as string;
    const password = formData.get('password') as string;

    if (!rawCpf || !password) {
        return { error: 'CPF e senha são obrigatórios' };
    }

    // Attempt to handle both unmasked (frontend) and masked (backend seed) formats.
    // The previous error was due to frontend sending "12345678900" 
    // but database having "123.456.789-00".

    const cleanNumbers = rawCpf.replace(/\D/g, '');
    const cpfMasked = cleanNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    const supabase = await createClient();

    // 1. Lookup Email and User Data by CPF
    // Use .maybeSingle() to gracefully handle "User Not Found" (PGRST116)
    // We try querying with the MASKED CPF first, as that is the backend standard.
    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select(`
            id,
            nome,
            email:email_institucional,
            cpf,
            instituicaoId:instituicao_id,
            orgaoId:orgao_id,
            unidadeGestoraId:unidade_gestora_id,
            setorId:setor_id,
            cargoId:cargo_id,
            permissoes
        `)
        .eq('cpf', cpfMasked)
        .maybeSingle();

    if (userError || !userData?.email) {
        console.error('Login Lookup Error:', userError?.message || 'No user found for CPF: ' + cpfMasked);
        return { error: 'Usuário não encontrado ou credenciais inválidas.' };
    }

    const email = userData.email;

    // 2. Sign In
    const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Login Auth Error:', authError.message);
        if (authError.message === 'Email not confirmed') {
            return { error: 'Email não confirmado. Por favor cheque sua caixa de entrada.' };
        }
        return { error: 'Senha incorreta.' };
    }

    // Return success and user data to sync client store
    return {
        success: true,
        user: userData
    };
}

export async function recoverPassword(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) return { error: 'Email obrigatório' };

    const supabase = await createClient();

    // 2. Send Recovery Email directly (Supabase handles logic if email exists or not)
    // We should probably check if it exists in our system first, but for now let's trust the email input
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
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

export async function updatePassword(password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        console.error('Update Password Error:', error.message);
        return { error: 'Erro ao atualizar a senha.' };
    }

    return { success: true };
}
