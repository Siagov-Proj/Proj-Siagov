'use server'

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    ugOrigemId?: string;
    setorId: string;
    cargoId?: string;
    perfilAcesso: string;
    ativo: boolean;
}

export async function createUserWithInvite(data: CreateUserParams) {
    const supabaseAdmin = createAdminClient();
    const supabase = await createClient(); // Client for public db checks (optional) or use admin for everything

    // 1. Check if CPF already exists in public.usuarios
    const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('cpf', data.cpf)
        .maybeSingle();

    if (existingUser) {
        return { error: 'CPF já cadastrado no sistema.' };
    }

    // 2. Invite User via Supabase Auth (This sends the email)
    // We use inviteUserByEmail which creates the user and sends a magic link
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.emailInstitucional,
        {
            data: {
                nome: data.nome,
                cpf: data.cpf,
                perfil: data.perfilAcesso // Store role in metadata
            }
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

    // 3. Insert into public.usuarios linked to auth.users
    const { error: dbError } = await supabaseAdmin
        .from('usuarios')
        .insert({
            id: authUserId, // LINK CRUCIAL: Same ID
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
            instituicao_id: data.instituicaoId,
            orgao_id: data.orgaoId,
            unidade_gestora_id: data.unidadeGestoraId,
            ug_origem_id: data.ugOrigemId,
            setor_id: data.setorId,
            cargo_id: data.cargoId,
            permissoes: [data.perfilAcesso], // Array
            ativo: data.ativo,
            excluido: false
        });

    if (dbError) {
        console.error('Erro ao inserir usuário (DB):', dbError);
        // Rollback? Deleting auth user is risky but cleaner.
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        return { error: `Erro ao salvar dados do usuário: ${dbError.message}` };
    }

    revalidatePath('/cadastros/usuarios');
    return { success: true };
}
