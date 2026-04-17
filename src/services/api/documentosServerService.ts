import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
    sanitizeDocumentFileName,
    validateDocumentFileSignature,
} from '@/utils';

interface IDocumentoServerPayload {
    titulo: string;
    tipo: string;
    formato?: string;
    categoria_id: string;
    subcategoria_id: string;
    processo_id?: string;
    status: string;
}

export interface ICriarDocumentoComAnexosInput {
    payload: IDocumentoServerPayload;
    anexos: File[];
}

function isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const code = 'code' in error ? error.code : undefined;
    return code === '23505';
}

function formatAttachmentSize(size: number): string {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function isMissingRelationError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const code = 'code' in error ? error.code : undefined;
    const message = 'message' in error && typeof error.message === 'string' ? error.message : '';

    return code === '42P01' || message.toLowerCase().includes('does not exist');
}

async function suportaPersistenciaDeAnexos() {
    const supabase = await createClient();
    const { error } = await supabase.from('documento_anexos').select('id').limit(1);

    if (!error) {
        return true;
    }

    if (isMissingRelationError(error)) {
        return false;
    }

    throw error;
}

async function criarDocumentoBase(payload: IDocumentoServerPayload) {
    const supabase = await createClient();
    const maxTentativas = 3;
    let ultimaFalha: unknown;

    for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
        const { data: numeroGerado, error: numeroError } = await supabase.rpc('gerar_codigo_documento', {
            p_subcategoria_id: payload.subcategoria_id,
        });

        if (numeroError) {
            throw numeroError;
        }

        const { data, error } = await supabase
            .from('documentos')
            .insert({
                ...payload,
                numero: numeroGerado as string,
                ativo: true,
                excluido: false,
            })
            .select('id, numero')
            .single();

        if (!error && data) {
            return data;
        }

        if (!isUniqueViolation(error)) {
            throw error;
        }

        ultimaFalha = error;
    }

    throw ultimaFalha instanceof Error ? ultimaFalha : new Error('Nao foi possivel gerar um numero unico para o documento.');
}

async function registrarHistoricoObrigatorio(documentoId: string) {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    const { error } = await supabase.from('documento_historico').insert({
        documento_id: documentoId,
        acao: 'Criado',
        usuario_id: authData.user?.id || null,
        usuario_nome: authData.user?.email || 'Sistema',
    });

    if (error) {
        throw error;
    }
}

async function removerArquivos(paths: string[]) {
    if (paths.length === 0) return;

    const supabase = await createClient();
    await supabase.storage.from('anexos').remove(paths);
}

async function rollbackDocumento(documentoId: string, uploadedPaths: string[]) {
    const supabase = await createClient();

    await removerArquivos(uploadedPaths);
    await supabase.from('documento_anexos').delete().eq('documento_id', documentoId);
    await supabase.from('documentos').update({ excluido: true }).eq('id', documentoId);
}

export const documentosServerService = {
    async criarDocumentoComAnexos(input: ICriarDocumentoComAnexosInput): Promise<{ documentoId: string; numero: string; warning?: string }> {
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
            throw new Error('Sessao invalida. Faca login novamente para enviar anexos.');
        }

        const temAnexos = input.anexos.length > 0;
        const bufferMap = new Map<File, ArrayBuffer>();

        // Validar assinaturas de todos os arquivos ANTES de qualquer operação
        if (temAnexos) {
            for (const anexo of input.anexos) {
                const buffer = await anexo.arrayBuffer();
                bufferMap.set(anexo, buffer);

                const validacao = await validateDocumentFileSignature(anexo, buffer);
                if (!validacao.valido) {
                    throw new Error(validacao.mensagem || `Arquivo invalido: ${anexo.name}`);
                }
            }
        }

        // Verificar se a infra suporta persistência de anexos
        const infraPronta = await suportaPersistenciaDeAnexos();

        // Se o usuário enviou anexos mas a tabela não existe, BLOQUEAR em vez de salvar sem eles
        if (temAnexos && !infraPronta) {
            throw new Error(
                'Nao foi possivel salvar os anexos porque a tabela de anexos ainda nao foi criada no banco de dados. '
                + 'Entre em contato com o administrador do sistema para aplicar a migration pendente.'
            );
        }

        const documento = await criarDocumentoBase(input.payload);
        const uploadedPaths: string[] = [];

        try {
            await registrarHistoricoObrigatorio(documento.id);

            if (temAnexos && infraPronta) {
                for (const anexo of input.anexos) {
                    const nomeSanitizado = sanitizeDocumentFileName(anexo.name);
                    const storagePath = `${documento.id}/${Date.now()}_${nomeSanitizado}`;
                    const arquivoBuffer = bufferMap.get(anexo) || await anexo.arrayBuffer();

                    const { error: uploadError } = await supabase.storage
                        .from('anexos')
                        .upload(storagePath, arquivoBuffer, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: anexo.type || 'application/octet-stream',
                        });

                    if (uploadError) {
                        throw uploadError;
                    }

                    uploadedPaths.push(storagePath);

                    const { error: anexoError } = await supabase.from('documento_anexos').insert({
                        documento_id: documento.id,
                        nome: anexo.name,
                        tamanho: formatAttachmentSize(anexo.size),
                        tipo_mime: anexo.type || 'application/octet-stream',
                        url: storagePath,
                    });

                    if (anexoError) {
                        throw anexoError;
                    }
                }
            }

            return {
                documentoId: documento.id,
                numero: documento.numero,
            };
        } catch (error) {
            await rollbackDocumento(documento.id, uploadedPaths);
            throw error;
        }
    },
};
