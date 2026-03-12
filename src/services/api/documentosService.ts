import { getSupabaseClient } from "@/lib/supabase/client";
import { usuariosService } from "@/services/api/usuariosService";
import {
    sanitizeSearchTerm,
    sanitizeDocumentFileName,
    validateDocumentFileMetadata,
} from "@/utils";

export interface IDocumentoDB {
    id: string;
    numero: string;
    titulo: string;
    tipo: string;
    categoria_id: string;
    subcategoria_id: string;
    lei?: string;
    processo_id?: string;
    objetivo?: string;
    contexto?: string;
    conteudo?: string;
    tokens_utilizados: number;
    versao: number;
    status: string;
    criado_por?: string;
    active?: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    categoria?: { nome: string; lei?: string };
    subcategoria?: { nome: string; codigo?: string };
    processo?: { numero: string };
    anexos?: IDocumentoAnexoDB[];
    historico?: IDocumentoHistoricoDB[];
    versoes?: IDocumentoVersaoDB[];
}

export interface IDocumentoAnexoDB {
    id: string;
    documento_id: string;
    nome: string;
    tamanho: string;
    url?: string;
    tipo_mime?: string;
    created_at: string;
}

export interface IDocumentoHistoricoDB {
    id: string;
    documento_id: string;
    acao: string;
    usuario_id?: string;
    usuario_nome?: string;
    detalhes?: string;
    created_at: string;
}

export interface IDocumentoVersaoDB {
    id: string;
    documento_id: string;
    versao: number;
    conteudo: string;
    descricao?: string;
    usuario_nome?: string;
    created_at: string;
}

const TABLE_NAME = 'documentos';
interface IDocumentoAnexoCleanup {
    id: string;
    url: string | null;
    nome: string;
}

interface ICategoriaDocumentoLookup {
    id: string;
    nome: string;
    lei?: string;
}

interface ISubcategoriaDocumentoLookup {
    id: string;
    categoria_id: string;
    nome: string;
    codigo?: string;
}

interface IProcessoLookup {
    id: string;
    numero: string;
}

type IDocumentoPayload = Partial<Pick<IDocumentoDB,
    'id' |
    'numero' |
    'titulo' |
    'tipo' |
    'categoria_id' |
    'subcategoria_id' |
    'processo_id' |
    'status' |
    'criado_por' |
    'created_at' |
    'updated_at'
>> & {
    ativo?: boolean;
    excluido?: boolean;
};

function buildDocumentoPayload(dados: IDocumentoPayload): IDocumentoPayload {
    return {
        ...dados,
        ativo: dados.ativo ?? true,
        excluido: dados.excluido ?? false,
    };
}

function isUniqueViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const code = 'code' in error ? error.code : undefined;
    return code === '23505';
}

function getStoragePathFromUrl(url: string): string {
    const normalizedUrl = url.replace(/\\/g, '/');
    const publicSegment = '/storage/v1/object/public/anexos/';

    if (normalizedUrl.includes(publicSegment)) {
        return normalizedUrl.split(publicSegment)[1] || normalizedUrl;
    }

    return normalizedUrl;
}

export const documentosService = {

    /**
     * Gera o próximo código de documento para uma subcategoria.
     * Ex: subcategoria "4.1. Dispensa" com 2 docs existentes -> retorna "4.1.3."
     */
    async gerarProximoCodigo(subcategoriaId: string): Promise<string> {
        try {
            const supabase = getSupabaseClient();

            const { data, error } = await supabase.rpc('gerar_codigo_documento', {
                p_subcategoria_id: subcategoriaId
            });

            if (error) {
                console.error('Erro RPC ao gerar código de documento:', error);
                throw error;
            }

            return data as string;
        } catch (err) {
            console.error('Erro inesperado ao gerar código de documento:', err);
            throw err;
        }
    },

    async listar(filtros?: { termo?: string; categoria?: string; status?: string }): Promise<IDocumentoDB[]> {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('excluido', false)
            .order('created_at', { ascending: false });

        const termoSanitizado = filtros?.termo ? sanitizeSearchTerm(filtros.termo) : '';

        if (termoSanitizado) {
            query = query.or(`titulo.ilike.%${termoSanitizado}%,numero.ilike.%${termoSanitizado}%`);
        }
        if (filtros?.status && filtros.status !== 'todos') {
            query = query.eq('status', filtros.status);
        }

        const { data: docs, error } = await query;
        if (error) throw error;
        if (!docs || docs.length === 0) return [];

        // Manual Join
        const categoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.categoria_id).filter(Boolean))];
        const subcategoriaIds = [...new Set((docs as IDocumentoDB[]).map(d => d.subcategoria_id).filter(Boolean))];
        const processoIds = [...new Set((docs as IDocumentoDB[]).map(d => d.processo_id).filter(Boolean))];

        let cats: ICategoriaDocumentoLookup[] = [];
        let subs: ISubcategoriaDocumentoLookup[] = [];
        let procs: IProcessoLookup[] = [];

        if (categoriaIds.length > 0) {
            const { data } = await supabase.from('categorias_documentos').select('id, nome, lei').in('id', categoriaIds);
            cats = data || [];
        }
        if (subcategoriaIds.length > 0) {
            const { data } = await supabase.from('subcategorias_documentos').select('id, categoria_id, nome, codigo').in('id', subcategoriaIds);
            subs = data || [];
        }
        if (processoIds.length > 0) {
            const { data } = await supabase.from('processos').select('id, numero').in('id', processoIds);
            procs = data || [];
        }

        const catsMap = new Map(cats.map(c => [c.id, c]));
        const subsMap = new Map(subs.map(s => [s.id, s]));
        const procsMap = new Map(procs.map(p => [p.id, p]));

        return (docs as IDocumentoDB[]).map(doc => {
            const subcategoria = doc.subcategoria_id ? subsMap.get(doc.subcategoria_id) : undefined;
            const categoriaIdRelacionada = doc.categoria_id || subcategoria?.categoria_id;

            return {
                ...doc,
                categoria: categoriaIdRelacionada ? catsMap.get(categoriaIdRelacionada) : undefined,
                subcategoria,
                processo: doc.processo_id ? procsMap.get(doc.processo_id) : undefined,
            };
        });
    },

    async obterPorId(id: string): Promise<IDocumentoDB | null> {
        const supabase = getSupabaseClient();
        const { data: authData } = await supabase.auth.getUser();
        const isAdmin = usuariosService.isGlobalAdminUser(authData.user);

        const { data: doc, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (error) throw error;
        if (!doc) return null;

        let historicoQuery = supabase
            .from('documento_historico')
            .select('*')
            .eq('documento_id', id)
            .order('created_at', { ascending: false });

        if (!isAdmin) {
            historicoQuery = historicoQuery.neq('acao', 'Download');
        }

        const promises = [
            supabase.from('documento_anexos').select('*').eq('documento_id', id),
            historicoQuery,
            supabase.from('documento_versoes').select('*').eq('documento_id', id).order('versao', { ascending: false })
        ];

        if (doc.categoria_id) promises.push(supabase.from('categorias_documentos').select('nome, lei, codigo').eq('id', doc.categoria_id).single());
        if (doc.subcategoria_id) promises.push(supabase.from('subcategorias_documentos').select('nome, codigo').eq('id', doc.subcategoria_id).single());
        if (doc.processo_id) promises.push(supabase.from('processos').select('numero').eq('id', doc.processo_id).single());

        const results = await Promise.all(promises);

        const anexos = results[0].data || [];
        const historico = results[1].data || [];
        const versoes = results[2].data || [];

        let offset = 3;
        const categoria = doc.categoria_id ? results[offset++]?.data : undefined;
        const subcategoria = doc.subcategoria_id ? results[offset++]?.data : undefined;
        const processo = doc.processo_id ? results[offset++]?.data : undefined;

        return {
            ...doc,
            anexos,
            historico,
            versoes,
            categoria,
            subcategoria,
            processo
        };
    },

    async criar(dados: Partial<IDocumentoDB>): Promise<IDocumentoDB> {
        const supabase = getSupabaseClient();

        const payloadBase = buildDocumentoPayload(dados);
        const maxTentativas = payloadBase.subcategoria_id ? 3 : 1;
        let ultimaFalha: unknown;

        for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
            const payload = { ...payloadBase };

            if (!payload.numero && payload.subcategoria_id) {
                payload.numero = await this.gerarProximoCodigo(payload.subcategoria_id);
            } else if (!payload.numero) {
                throw new Error('Subcategoria do documento e obrigatoria para gerar numeracao segura.');
            }

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert(payload)
                .select()
                .single();

            if (!error && data) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const { error: logError } = await supabase.from('documento_historico').insert({
                        documento_id: data.id,
                        acao: 'Criado',
                        usuario_id: user?.id || null,
                        usuario_nome: user?.email || 'Sistema',
                    });

                    if (logError) {
                        await supabase.from(TABLE_NAME).update({ excluido: true }).eq('id', data.id);
                        throw logError;
                    }
                } catch (logError) {
                    console.error('Falha obrigatoria ao registrar log de criacao do documento:', logError);
                    throw new Error('Nao foi possivel concluir a criacao do documento porque a auditoria falhou.');
                }

                return data;
            }

            if (!isUniqueViolation(error) || !payload.subcategoria_id) {
                throw error;
            }

            ultimaFalha = error;
        }

        throw ultimaFalha instanceof Error ? ultimaFalha : new Error('Nao foi possivel criar o documento com codigo unico.');
    },

    async atualizar(id: string, dados: Partial<IDocumentoDB>): Promise<IDocumentoDB> {
        const supabase = getSupabaseClient();

        const payload = buildDocumentoPayload(dados);
        delete payload.ativo;
        delete payload.excluido;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Registrar log de atualização
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('documento_historico').insert({
                documento_id: id,
                acao: 'Atualizado',
                usuario_id: user?.id || null,
                usuario_nome: user?.email || 'Sistema',
            });
        } catch (logError) {
            console.warn('Aviso: Não foi possível registrar log de atualização:', logError);
        }

        return data;
    },

    /**
     * Validacoes client-side preliminares para anexos.
     */
    validarAnexo(file: File): { valido: boolean; mensagem?: string } {
        return validateDocumentFileMetadata(file);
    },

    /**
     * Remove caracteres especiais para evitar falhas no path traversal / encoding no Supabase Storage.
     */
    sanitizarNomeArquivo(nome: string): string {
        return sanitizeDocumentFileName(nome);
    },

    /**
     * Faz upload do arquivo fisico pro bucket do Supabase
     */
    async uploadAnexo(documentoId: string, file: File): Promise<string> {
        const supabase = getSupabaseClient();
        const validacao = this.validarAnexo(file);

        if (!validacao.valido) {
            throw new Error(validacao.mensagem || 'Arquivo invalido para upload.');
        }

        const nomeSanitizado = this.sanitizarNomeArquivo(file.name);
        const fileName = `${documentoId}/${Date.now()}_${nomeSanitizado}`;

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

    async removerAnexosPorDocumento(documentoId: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { data: anexos, error } = await supabase
            .from('documento_anexos')
            .select('id, url, nome')
            .eq('documento_id', documentoId);

        if (error) {
            console.error('Erro ao carregar anexos para limpeza:', error);
            throw error;
        }

        if (!anexos || anexos.length === 0) {
            return;
        }

        const anexosComArquivo = anexos.filter(
            (anexo: IDocumentoAnexoCleanup | { id: string; url: string | null; nome: string }): anexo is IDocumentoAnexoCleanup => Boolean(anexo.url)
        );
        const pathsParaRemover = anexosComArquivo.map((anexo: IDocumentoAnexoCleanup) => getStoragePathFromUrl(anexo.url || ''));

        if (pathsParaRemover.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('anexos')
                .remove(pathsParaRemover);

            if (storageError) {
                console.error('Erro ao remover arquivos anexos do Storage:', storageError);
                throw storageError;
            }
        }

        const anexoIds = anexos.map((anexo: { id: string }) => anexo.id);
        const { error: deleteError } = await supabase
            .from('documento_anexos')
            .delete()
            .in('id', anexoIds);

        if (deleteError) {
            console.error('Erro ao remover registros de anexos:', deleteError);
            throw deleteError;
        }
    },

    /**
     * Salva o registro da URL no BD relacional local
     */
    async salvarAnexoDB(payload: Partial<IDocumentoAnexoDB>): Promise<IDocumentoAnexoDB> {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('documento_anexos')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Erro ao salvar anexo no banco:', error);
            throw error;
        }

        return data;
    },

    /**
     * Registra um download do documento no histórico.
     * Deve ser chamado quando o usuário clica em "Baixar PDF".
     */
    async registrarDownload(documentoId: string): Promise<void> {
        const supabase = getSupabaseClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('documento_historico').insert({
                documento_id: documentoId,
                acao: 'Download',
                usuario_id: user?.id || null,
                usuario_nome: user?.email || 'Desconhecido',
            });

            if (error) {
                console.error('Erro ao registrar download:', error);
                throw error; // Throw to allow upstream components to catch it if needed, although currently we just logged it
            }
        } catch (err) {
            console.error('Erro ao registrar download:', err);
            throw err;
        }
    },

    /**
     * Gera uma URL assinada com expiração de 60 segundos para o PDF do documento
     */
    async gerarUrlDownloadPDF(documentoId: string, expiresIn = 60): Promise<string> {
        const supabase = getSupabaseClient();
        
        // Assumindo que os PDFs compilados ficam no bucket 'documentos' 
        // com o nome igual ao ID do documento.
        const { data, error } = await supabase.storage
            .from('documentos')
            .createSignedUrl(`${documentoId}.pdf`, expiresIn);

        if (error) {
            console.error('Erro ao gerar URL assinada para o PDF:', error);
            throw error;
        }

        return data.signedUrl;
    },

    /**
     * Gera uma URL assinada para um anexo salvo no bucket `anexos`.
     */
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

    async excluir(id: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ excluido: true })
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Remove do Storage e do banco os anexos de documentos que sofreram soft-delete há mais de 30 dias.
     * Retorna um resumo da operação.
     */
    async limparAnexosExcluidos(): Promise<{ documentosProcessados: number; anexosRemovidos: number }> {
        const supabase = getSupabaseClient();
        
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        
        // Buscar documentos excluídos há mais de 30 dias
        const { data: documentos, error: docError } = await supabase
            .from(TABLE_NAME)
            .select('id')
            .eq('excluido', true)
            .lt('updated_at', trintaDiasAtras.toISOString());
            
        if (docError) {
            console.error('Erro ao buscar documentos para limpeza:', docError);
            throw docError;
        }

        if (!documentos || documentos.length === 0) {
            return { documentosProcessados: 0, anexosRemovidos: 0 };
        }

        let anexosRemovidosTotal = 0;
        let documentosProcessados = 0;

        for (const doc of documentos) {
            // Buscar anexos do documento
            const { data: anexos, error: anexosError } = await supabase
                .from('documento_anexos')
                .select('id, url, nome')
                .eq('documento_id', doc.id);
                
            if (anexosError) {
                console.error(`Erro ao buscar anexos do documento ${doc.id}:`, anexosError);
                continue; // Pula para o próximo documento em caso de erro
            }

            if (anexos && anexos.length > 0) {
                // Extrair o caminho correto do bucket a partir da URL pública
                const pathsParaRemover = anexos.map((anexo: IDocumentoAnexoCleanup) => {
                    if (!anexo.url) return null;
                    return getStoragePathFromUrl(anexo.url);
                }).filter(Boolean) as string[];

                if (pathsParaRemover.length > 0) {
                    const { error: storageError } = await supabase.storage
                        .from('anexos')
                        .remove(pathsParaRemover);
                        
                    if (storageError) {
                         console.error(`Erro ao remover arquivos do Storage para o documento ${doc.id}:`, storageError);
                         continue; // Não tenta deletar do banco se falhou no storage
                    }
                }
                
                const anexoIds = anexos.map((anexo: IDocumentoAnexoCleanup) => anexo.id);
                const { error: deleteError } = await supabase
                    .from('documento_anexos')
                    .delete()
                    .in('id', anexoIds);
                    
                if (deleteError) {
                    console.error(`Erro ao deletar registros de anexos do documento ${doc.id}:`, deleteError);
                } else {
                    anexosRemovidosTotal += anexos.length;
                }
            }
            documentosProcessados++;
        }
        
        return { documentosProcessados, anexosRemovidos: anexosRemovidosTotal };
    }
};

