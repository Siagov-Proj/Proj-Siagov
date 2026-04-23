'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface ILotacaoAuthRow {
    id: string;
    orgao_id?: string;
    unidade_gestora_id?: string;
    setor_id?: string;
    cargo_id?: string;
    perfil_acesso: string;
    instituicoes?: {
        id?: string;
        codigo?: string;
        nome?: string;
        nome_abreviado?: string;
    } | null;
}

export async function loginWithCpf(formData: FormData) {
    const rawCpf = formData.get('cpf') as string;
    const password = formData.get('password') as string;

    if (!rawCpf || !password) {
        return { error: 'CPF e senha são obrigatórios' };
    }

    const cleanNumbers = rawCpf.replace(/\D/g, '');
    const cpfMasked = cleanNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    const supabase = await createClient();
    
    // Usamos um admin client exclusivo para esta busca antes do usuário estar logado,
    // pois a política de RLS na tabela usuarios. bloqueia operações SELECT de usuários anônimos
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Lookup Email and User Data by CPF
    // Busca por ambos os formatos (mascarado e sem máscara) pois a criação pode ter
    // salvo em qualquer um dos dois formatos
    const { data: userData, error: userError } = await supabaseAdmin
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
        .or(`cpf.eq.${cpfMasked},cpf.eq.${cleanNumbers}`)
        .eq('ativo', true)
        .eq('excluido', false)
        .maybeSingle();

    if (userError || !userData?.email) {
        console.error('Login Lookup Error:', userError?.message || 'No user found for CPF: ' + cpfMasked);
        return { error: 'Usuário não encontrado ou credenciais inválidas.' };
    }

    const email = userData.email;

    // 2. Sign In (usa client normal para criar sessão pro usuário)
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

    // 3. Buscar lotações do usuário
    const { data: lotacoesData } = await supabase
        .from('usuario_lotacoes')
        .select(`
            id,
            orgao_id,
            unidade_gestora_id,
            setor_id,
            cargo_id,
            perfil_acesso,
            instituicoes (
                id,
                codigo,
                nome,
                nome_abreviado
            )
        `)
        .eq('usuario_id', userData.id)
        .eq('excluido', false)
        .eq('ativo', true);

    const lotacoes = ((lotacoesData || []) as ILotacaoAuthRow[]).map((item) => ({
        lotacaoId: item.id,
        instituicaoId: item.instituicoes?.id || '',
        instituicaoNome: item.instituicoes?.nome || '',
        instituicaoCodigo: item.instituicoes?.codigo || '',
        orgaoId: item.orgao_id,
        unidadeGestoraId: item.unidade_gestora_id,
        setorId: item.setor_id,
        cargoId: item.cargo_id,
        perfilAcesso: item.perfil_acesso,
    }));

    // Return success with lotações
    return {
        success: true,
        user: {
            ...userData,
            lotacoes,
        },
        lotacoesCount: lotacoes.length,
    };
}

export async function recoverPassword(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) return { error: 'Email obrigatório' };

    const supabase = await createClient();

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
