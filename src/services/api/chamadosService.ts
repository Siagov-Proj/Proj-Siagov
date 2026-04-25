
import { getSupabaseClient } from "@/lib/supabase/client";
import { sanitizeSearchTerm } from "@/utils";

export interface IChamadoDB {
    id: string;
    protocolo: string;
    assunto: string;
    situacao: 'Bug' | 'Dúvida' | 'Melhoria';
    status: 'Aberto' | 'Em Atendimento' | 'Aguardando Resposta' | 'Resolvido' | 'Fechado';
    prioridade: 'Alta' | 'Média' | 'Baixa';
    descricao?: string;
    criado_por: string;
    user_id?: string;
    orgao_id?: string;
    setor_id?: string;
    categoria_documento_id?: string;
    subcategoria_documento_id?: string;
    sla_restante?: string;
    ativo: boolean;
    excluido: boolean;
    data_abertura: string;
    created_at: string;
    updated_at: string;
    // Relations (Not in DB, computed)
    mensagens_count?: number;
    orgao_nome?: string;
    setor_nome?: string;
    categoria_documento_nome?: string;
    subcategoria_documento_nome?: string;
}

export interface IChamadoAnexoDB {
    id: string;
    chamado_id: string;
    nome: string;
    tamanho?: string;
    url?: string;
    tipo_mime?: string;
    created_at: string;
}

interface IChamadoMensagemCount {
    count?: number;
}

interface IChamadoOrgaoJoin {
    nome?: string;
}

interface IChamadoSetorJoin {
    nome?: string;
}

interface IChamadoCategoriaDocJoin {
    nome?: string;
}

interface IChamadoSubcategoriaDocJoin {
    nome?: string;
}

interface IChamadoComRelacoes extends IChamadoDB {
    mensagens?: IChamadoMensagemCount[];
    orgaos?: IChamadoOrgaoJoin | null;
    setores?: IChamadoSetorJoin | null;
    categoria_doc?: IChamadoCategoriaDocJoin | null;
    subcategoria_doc?: IChamadoSubcategoriaDocJoin | null;
}

export interface IChamadoMensagemDB {
    id: string;
    chamado_id: string;
    mensagem: string;
    autor?: string;
    tipo?: string;
    created_at: string;
    updated_at?: string;
}

const TABLE_NAME = 'chamados';

// Tipos de arquivos aceitos para anexos de chamados
const ALLOWED_MIME_TYPES = [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    // Imagens
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Vídeos
    'video/mp4',
    'video/webm',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function sanitizarNomeArquivo(nome: string): string {
    return nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais
        .replace(/_+/g, '_'); // Remove underscores duplicados
}

export const chamadosService = {
    async listar(filtros?: { termo?: string; situacao?: string; status?: string }): Promise<IChamadoDB[]> {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLE_NAME)
            .select(`
                *,
                mensagens:chamado_mensagens(count),
                orgaos(nome),
                setores(nome),
                categoria_doc:categorias_documentos(nome),
                subcategoria_doc:subcategorias_documentos(nome)
            `)
            .eq('excluido', false)
            .order('created_at', { ascending: false });

        const termoSanitizado = filtros?.termo ? sanitizeSearchTerm(filtros.termo) : '';

        if (termoSanitizado) {
            query = query.or(`assunto.ilike.%${termoSanitizado}%,protocolo.ilike.%${termoSanitizado}%`);
        }
        if (filtros?.situacao && filtros.situacao !== 'todos') {
            query = query.eq('situacao', filtros.situacao);
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

        return (data as IChamadoComRelacoes[]).map((d) => ({
            ...d,
            mensagens_count: d.mensagens?.[0]?.count || 0,
            orgao_nome: d.orgaos?.nome || undefined,
            setor_nome: d.setores?.nome || undefined,
            categoria_documento_nome: d.categoria_doc?.nome || undefined,
            subcategoria_documento_nome: d.subcategoria_doc?.nome || undefined,
        }));
    },

    async obterPorId(id: string): Promise<IChamadoDB | null> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`
                *,
                orgaos(nome),
                setores(nome),
                categoria_doc:categorias_documentos(nome),
                subcategoria_doc:subcategorias_documentos(nome)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const row = data as IChamadoComRelacoes;
        return {
            ...row,
            orgao_nome: row.orgaos?.nome || undefined,
            setor_nome: row.setores?.nome || undefined,
            categoria_documento_nome: row.categoria_doc?.nome || undefined,
            subcategoria_documento_nome: row.subcategoria_doc?.nome || undefined,
        };
    },

    async listarMensagens(chamadoId: string): Promise<IChamadoMensagemDB[]> {
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
    },

    // ========== ANEXOS ==========

    validarAnexo(file: File): { valido: boolean; mensagem?: string } {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return {
                valido: false,
                mensagem: `Tipo de arquivo não permitido: ${file.type}. Aceitos: PDF, DOC, DOCX, ODT, TXT, JPG, PNG, GIF, WEBP, MP4, WEBM.`
            };
        }
        if (file.size > MAX_FILE_SIZE) {
            return {
                valido: false,
                mensagem: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 25MB.`
            };
        }
        return { valido: true };
    },

    async uploadAnexo(chamadoId: string, file: File): Promise<string> {
        const supabase = getSupabaseClient();
        const validacao = this.validarAnexo(file);

        if (!validacao.valido) {
            throw new Error(validacao.mensagem || 'Arquivo inválido para upload.');
        }

        const nomeSanitizado = sanitizarNomeArquivo(file.name);
        const fileName = `chamados/${chamadoId}/${Date.now()}_${nomeSanitizado}`;

        const { data, error } = await supabase.storage
            .from('anexos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Erro no upload para o bucket:', error);
            throw error;
        }

        return data.path;
    },

    async salvarAnexoDB(payload: Partial<IChamadoAnexoDB>): Promise<IChamadoAnexoDB> {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('chamado_anexos')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar anexo no banco:', error);
            throw error;
        }

        return data;
    },

    async listarAnexos(chamadoId: string): Promise<IChamadoAnexoDB[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('chamado_anexos')
            .select('*')
            .eq('chamado_id', chamadoId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Erro ao listar anexos do chamado:', error);
            return [];
        }

        return data || [];
    },

    async gerarUrlDownloadAnexo(storagePath: string, expiresIn = 60): Promise<string> {
        const supabase = getSupabaseClient();
        const normalizedPath = storagePath.replace(/\\/g, '/').trim();

        const { data, error } = await supabase.storage
            .from('anexos')
            .createSignedUrl(normalizedPath, expiresIn);

        if (error) {
            console.error('Erro ao gerar URL assinada para anexo:', error);
            throw error;
        }

        return data.signedUrl;
    },
};
