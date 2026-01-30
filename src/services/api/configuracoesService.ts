
import { getSupabaseClient } from '@/lib/supabase/client';

export interface IConfiguracaoDB {
    id: string;
    nome_instituicao: string;
    sigla: string;
    cnpj: string;
    email_contato: string;
    telefone: string;
    tema: {
        tema: string;
        corPrimaria: string;
        compacto: boolean;
    };
    notificacoes: {
        emailTramitacao: boolean;
        emailPrazo: boolean;
        emailChamado: boolean;
        pushBrowser: boolean;
        resumoDiario: boolean;
    };
    integracoes: {
        supabaseConectado: boolean;
        iaHabilitada: boolean;
        emailHabilitado: boolean;
    };
    ativo: boolean;
    excluido: boolean;
    created_at?: string;
    updated_at?: string;
}

const TABLE_NAME = 'configuracoes';

export const configuracoesService = {
    async obterAtual(): Promise<IConfiguracaoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    },

    async salvar(dados: Partial<IConfiguracaoDB>): Promise<IConfiguracaoDB> {
        const supabase = getSupabaseClient();

        // Check if there is already an active config
        const atual = await this.obterAtual();

        if (atual) {
            // Update
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update({ ...dados, updated_at: new Date().toISOString() })
                .eq('id', atual.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert({ ...dados, excluido: false, ativo: true })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    async excluirLogico(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) throw error;
    }
};
