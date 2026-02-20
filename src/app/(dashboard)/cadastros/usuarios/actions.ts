'use server'

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface LotacaoParams {
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    setorId: string;
    cargoId?: string;
    ugOrigemId?: string;
    perfilAcesso: string;
}

interface CreateUserParams {
    codigo: string;
    nome: string;
    cpf: string;
    nomeCredor?: string;
    matricula?: string;
    vinculo?: string;
    emailInstitucional: string;
    emailPessoal?: string;
    telefone01?: string;
    telefoneWhatsApp?: string;
    ativo: boolean;
    lotacoes: LotacaoParams[];
}

export async function createUserWithInvite(data: CreateUserParams) {
    const supabaseAdmin = createAdminClient();

    // 1. Check if CPF already exists in public.usuarios
    const { data: existingUser } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('cpf', data.cpf)
        .maybeSingle();

    if (existingUser) {
        return { error: 'CPF já cadastrado no sistema.' };
    }

    // 2. Invite User via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.emailInstitucional,
        {
            data: {
                nome: data.nome,
                cpf: data.cpf,
                perfil: data.lotacoes[0]?.perfilAcesso || 'consulta'
            },
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
        }
    );

    if (authError) {
        console.error('Erro ao convidar usuário (Auth):', authError);
        return { error: `Erro ao criar autenticação: ${authError.message}` };
    }

    if (!authData.user) {
        return { error: 'Erro inesperado: Usuário de autenticação não foi criado.' };
    }

    const authUserId = authData.user.id;

    // 3. Insert into public.usuarios (dados pessoais + primeira lotação para compatibilidade)
    const primeiraLotacao = data.lotacoes[0];
    const { error: dbError } = await supabaseAdmin
        .from('usuarios')
        .insert({
            id: authUserId,
            codigo: data.codigo,
            nome: data.nome,
            cpf: data.cpf,
            nome_credor: data.nomeCredor,
            matricula: data.matricula,
            vinculo: data.vinculo,
            email_institucional: data.emailInstitucional,
            email_pessoal: data.emailPessoal,
            telefone_01: data.telefone01,
            telefone_whatsapp: data.telefoneWhatsApp,
            // Legacy: mantém a primeira lotação na tabela usuarios
            instituicao_id: primeiraLotacao?.instituicaoId,
            orgao_id: primeiraLotacao?.orgaoId,
            unidade_gestora_id: primeiraLotacao?.unidadeGestoraId,
            setor_id: primeiraLotacao?.setorId,
            cargo_id: primeiraLotacao?.cargoId,
            ug_origem_id: primeiraLotacao?.ugOrigemId,
            permissoes: [primeiraLotacao?.perfilAcesso || 'consulta'],
            ativo: data.ativo,
            excluido: false
        });

    if (dbError) {
        console.error('Erro ao inserir usuário (DB):', dbError);
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        return { error: `Erro ao salvar dados do usuário: ${dbError.message}` };
    }

    // 4. Insert all lotações into usuario_lotacoes
    const lotacoesInsert = data.lotacoes.map(lotacao => ({
        usuario_id: authUserId,
        instituicao_id: lotacao.instituicaoId,
        orgao_id: lotacao.orgaoId,
        unidade_gestora_id: lotacao.unidadeGestoraId,
        setor_id: lotacao.setorId,
        cargo_id: lotacao.cargoId,
        ug_origem_id: lotacao.ugOrigemId,
        perfil_acesso: lotacao.perfilAcesso || 'consulta',
        ativo: true,
        excluido: false,
    }));

    const { error: lotacoesError } = await supabaseAdmin
        .from('usuario_lotacoes')
        .insert(lotacoesInsert);

    if (lotacoesError) {
        console.error('Erro ao inserir lotações:', lotacoesError);
        // Continue — user was created, lotações can be added later
    }

    revalidatePath('/cadastros/usuarios');
    return { success: true };
}
