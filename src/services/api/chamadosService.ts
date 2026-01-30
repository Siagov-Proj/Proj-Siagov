
import { getSupabaseClient } from "@/lib/supabase/client";

export interface IChamadoDB {
    id: string;
    protocolo: string;
    assunto: string;
    categoria: 'Bug' | 'Dúvida' | 'Melhoria';
    status: 'Aberto' | 'Em Atendimento' | 'Aguardando Resposta' | 'Resolvido' | 'Fechado';
    prioridade: 'Alta' | 'Média' | 'Baixa';
    descricao?: string;
    criado_por: string;
    user_id?: string;
    sla_restante?: string;
    ativo: boolean;
    excluido: boolean;
    data_abertura: string;
    created_at: string;
    updated_at: string;
    // Relations (Not in DB, computed)
    mensagens_count?: number;
}

const TABLE_NAME = 'chamados';

export const chamadosService = {
    async listar(filtros?: { termo?: string; categoria?: string; status?: string }): Promise<IChamadoDB[]> {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLE_NAME)
            .select('*, mensagens:chamado_mensagens(count)')
            .eq('excluido', false)
            .order('created_at', { ascending: false });

        if (filtros?.termo) {
            query = query.or(`assunto.ilike.%${filtros.termo}%,protocolo.ilike.%${filtros.termo}%`);
        }
        if (filtros?.categoria && filtros.categoria !== 'todos') {
            query = query.eq('categoria', filtros.categoria);
        }
        if (filtros?.status && filtros.status !== 'todos') {
            query = query.eq('status', filtros.status);
        }

        const { data, error } = await query;
        if (error) {
            // Fallback if table doesn't exist yet to avoid crash
            console.error('Chamados List Error:', error.message);
            return [];
        }

        return data.map((d: any) => ({
            ...d,
            mensagens_count: d.mensagens?.[0]?.count || 0
        }));
    },

    async obterPorId(id: string): Promise<IChamadoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async listarMensagens(chamadoId: string): Promise<any[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('chamado_mensagens')
            .select('*')
            .eq('chamado_id', chamadoId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async enviarMensagem(chamadoId: string, mensagem: string, autor: string = 'Usuario'): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('chamado_mensagens')
            .insert({
                chamado_id: chamadoId,
                mensagem: mensagem,
                autor: autor,
                tipo: 'usuario'
            });

        if (error) throw error;
    },

    async criar(dados: Partial<IChamadoDB>): Promise<IChamadoDB> {
        const supabase = getSupabaseClient();

        const payload = { ...dados };

        // Auto-generate Protocolo if missing
        if (!payload.protocolo) {
            const year = new Date().getFullYear();
            const seq = Math.floor(Math.random() * 9000) + 1000;
            payload.protocolo = `${year}-${seq}`;
        }

        payload.ativo = true;
        payload.excluido = false;
        if (!payload.data_abertura) payload.data_abertura = new Date().toISOString();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async atualizar(id: string, dados: Partial<IChamadoDB>): Promise<IChamadoDB> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dados)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
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
