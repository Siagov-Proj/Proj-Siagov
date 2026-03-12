'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    User,
    FolderOpen,
    Scale,
    Edit,
    Trash2,
    Clock,
    Eye,
    Info,
    History,
    Loader2,
    Shield,
    RefreshCw,
    PlusCircle,
    Hash
} from 'lucide-react';
import { formatDate, formatDateTimeBR } from '@/utils/formatters';
import '@cyntler/react-doc-viewer/dist/index.css';
import { renderAsync } from 'docx-preview';

// Services
import { documentosService, IDocumentoDB } from '@/services/api/documentosService';
import { usuariosService } from '@/services/api/usuariosService';
import { getSupabaseClient } from '@/lib/supabase/client';

const DocViewer = dynamic(() => import('@cyntler/react-doc-viewer').then((mod) => mod.default), { ssr: false });
const docViewerRenderersPromise = import('@cyntler/react-doc-viewer').then((mod) => mod.DocViewerRenderers);

type IPreviewDocument = {
    uri: string;
    fileType?: string;
    fileName?: string;
    source?: 'anexo' | 'pdf';
};

type IDocViewerRenderers = Awaited<typeof docViewerRenderersPromise>;
const DOCX_PREVIEW_EXTENSIONS = new Set(['docx', 'docm', 'dotx', 'dotm']);
const LEGACY_WORD_EXTENSIONS = new Set(['doc', 'dot', 'rtf']);

export default function DetalheDocumentoPage() {
    const params = useParams();
    const docxPreviewContainerRef = useRef<HTMLDivElement | null>(null);
    const [documento, setDocumento] = useState<IDocumentoDB | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [previewDocumento, setPreviewDocumento] = useState<IPreviewDocument | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [docViewerRenderers, setDocViewerRenderers] = useState<IDocViewerRenderers | null>(null);
    const [docxPreviewReady, setDocxPreviewReady] = useState(false);

    const checkAdmin = useCallback(async () => {
        try {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            // Verifica se o usuário tem role de admin ou metadado de administrador de forma segura
            if (user) {
                const isAdminUser = usuariosService.isGlobalAdminUser(user);
                setIsAdmin(!!isAdminUser);
            }
        } catch (err) {
            console.warn('Não foi possível verificar permissões de admin:', err);
        }
    }, []);

    const obterExtensaoArquivo = (nome: string) => {
        const partes = nome.split('.');
        return partes.length > 1 ? partes.at(-1)?.toLowerCase() : undefined;
    };

    const isDocxPreviewDocument = (fileType?: string) => {
        if (!fileType) return false;
        return DOCX_PREVIEW_EXTENSIONS.has(fileType.toLowerCase());
    };

    const isLegacyWordDocument = (fileType?: string) => {
        if (!fileType) return false;
        return LEGACY_WORD_EXTENSIONS.has(fileType.toLowerCase());
    };

    const carregarPreviewDocumento = useCallback(async (doc: IDocumentoDB) => {
        try {
            setPreviewLoading(true);
            setPreviewError(null);

            const primeiroAnexo = doc.anexos?.find((anexo) => Boolean(anexo.url));

            if (primeiroAnexo?.url) {
                const signedUrl = await documentosService.gerarUrlDownloadAnexo(primeiroAnexo.url, 3600);
                setPreviewDocumento({
                    uri: signedUrl,
                    fileName: primeiroAnexo.nome,
                    fileType: obterExtensaoArquivo(primeiroAnexo.nome),
                    source: 'anexo',
                });
                return;
            }

            try {
                const signedUrl = await documentosService.gerarUrlDownloadPDF(doc.id, 3600);
                setPreviewDocumento({
                    uri: signedUrl,
                    fileName: `${doc.numero || doc.id}.pdf`,
                    fileType: 'pdf',
                    source: 'pdf',
                });
                return;
            } catch {
                if (doc.conteudo?.trim()) {
                    setPreviewDocumento(null);
                    return;
                }
            }

            setPreviewDocumento(null);
            setPreviewError('Nenhum arquivo disponivel para pre-visualizacao.');
        } catch (error) {
            console.error('Erro ao carregar preview do documento:', error);
            setPreviewDocumento(null);
            setPreviewError('Nao foi possivel carregar a pre-visualizacao do arquivo.');
        } finally {
            setPreviewLoading(false);
        }
    }, []);

    const loadDocumento = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setPreviewError(null);
            const doc = await documentosService.obterPorId(id);
            if (!doc) {
                // handle not found
                return;
            }
            setDocumento(doc);
            await carregarPreviewDocumento(doc);
        } catch (error) {
            console.error('Erro ao carregar documento:', error);
        } finally {
            setLoading(false);
        }
    }, [carregarPreviewDocumento]);

    useEffect(() => {
        if (params.id) {
            loadDocumento(params.id as string);
        }
        checkAdmin();
    }, [checkAdmin, loadDocumento, params.id]);

    useEffect(() => {
        docViewerRenderersPromise.then((renderers) => setDocViewerRenderers(renderers));
    }, []);

    useEffect(() => {
        const renderDocxPreview = async () => {
            if (!previewDocumento || !isDocxPreviewDocument(previewDocumento.fileType) || !docxPreviewContainerRef.current) {
                setDocxPreviewReady(false);
                return;
            }

            try {
                setDocxPreviewReady(false);
                docxPreviewContainerRef.current.innerHTML = '';

                const response = await fetch(previewDocumento.uri);
                if (!response.ok) {
                    throw new Error('Nao foi possivel baixar o arquivo para preview.');
                }

                const arrayBuffer = await response.arrayBuffer();
                await renderAsync(arrayBuffer, docxPreviewContainerRef.current, undefined, {
                    className: 'docx-preview-render',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: true,
                    useBase64URL: true,
                    breakPages: true,
                });

                setDocxPreviewReady(true);
            } catch (error) {
                console.error('Erro ao renderizar preview DOCX/DOCM:', error);
                setDocxPreviewReady(false);
                setPreviewError('Nao foi possivel renderizar a pre-visualizacao deste documento Word.');
            }
        };

        renderDocxPreview();
    }, [previewDocumento]);

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Concluído': return 'default';
            case 'Em Revisão': return 'secondary';
            case 'Rascunho': return 'outline';
            default: return 'outline';
        }
    };

    const escapeHtml = (value: string) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const abrirImpressaoPdf = (doc: IDocumentoDB) => {
        const popup = window.open('', '_blank', 'noopener,noreferrer');

        if (!popup) {
            throw new Error('Nao foi possivel abrir a janela de impressao do PDF.');
        }

        const titulo = escapeHtml(doc.titulo || `Documento ${doc.numero || ''}`.trim());
        const conteudo = escapeHtml(doc.conteudo || 'Conteudo nao disponivel.');

        popup.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #111827; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p.meta { margin: 0 0 24px; color: #6b7280; font-size: 14px; }
    pre { white-space: pre-wrap; word-break: break-word; font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
  <p class="meta">Documento ${escapeHtml(doc.numero || '-')}</p>
  <pre>${conteudo}</pre>
</body>
</html>`);
        popup.document.close();
        popup.focus();

        window.setTimeout(() => {
            popup.print();
        }, 250);
    };

    const abrirDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const baixarArquivo = async () => {
        if (!documento) return;

        try {
            let signedUrl: string | null = null;

            try {
                const primeiroAnexo = documento.anexos?.find((anexo) => Boolean(anexo.url));

                if (primeiroAnexo?.url) {
                    signedUrl = await documentosService.gerarUrlDownloadAnexo(primeiroAnexo.url);
                } else {
                    signedUrl = await documentosService.gerarUrlDownloadPDF(documento.id);
                }
            } catch {
                if (documento.conteudo?.trim()) {
                    abrirImpressaoPdf(documento);
                } else {
                    throw new Error('Nenhum arquivo ou conteudo disponivel para exportacao.');
                }
            }

            if (signedUrl) {
                abrirDownload(signedUrl);
            }

            try {
                await documentosService.registrarDownload(documento.id);
                loadDocumento(documento.id);
            } catch (logError) {
                console.warn('Falha ao registrar log de download:', logError);
            }
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            alert('Não foi possível baixar o arquivo deste documento.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!documento) {
        return (
            <div className="flex flax-col items-center justify-center h-96">
                <p className="text-muted-foreground mb-4">Documento não encontrado</p>
                <Button variant="outline" asChild><Link href="/documentos">Voltar</Link></Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/documentos">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Documento Nº {documento.numero}
                            </h1>
                            <Badge variant={obterCorStatus(documento.status)}>
                                {documento.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{documento.titulo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/documentos/${documento.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button onClick={baixarArquivo}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Arquivo
                    </Button>
                </div>
            </div>

            {/* Cards de Informações */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-sky-500/15 p-2">
                                <Hash className="h-5 w-5 text-sky-300" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">Código</p>
                                <p className="font-mono text-lg font-bold tracking-wide text-sky-200">{documento.numero || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-muted-foreground">Categoria</p>
                                <p className="break-words text-sm font-semibold leading-6 text-foreground" title={documento.categoria?.nome}>
                                    {documento.categoria?.nome || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2">
                                <Scale className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-muted-foreground">Lei</p>
                                <p className="break-words text-sm font-semibold leading-6 text-foreground" title={documento.lei || documento.categoria?.lei || '-'}>
                                    {documento.lei || documento.categoria?.lei || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-500/10 p-2">
                                <Calendar className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Criado em</p>
                                <p className="font-medium">{formatDate(new Date(documento.created_at))}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Abas */}
            <Tabs defaultValue="preview">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                    </TabsTrigger>
                    <TabsTrigger value="metadados" className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Metadados
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Anexos ({documento.anexos?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="versoes" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Versões
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Histórico
                    </TabsTrigger>
                </TabsList>

                {/* Aba Preview */}
                <TabsContent value="preview" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview do Documento</CardTitle>
                            <CardDescription>
                                Pre-visualizacao do arquivo anexado ou do documento gerado - Vinculado ao Processo {documento.processo?.numero || 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                {previewLoading ? (
                                    <div className="flex min-h-[420px] items-center justify-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : previewDocumento && isDocxPreviewDocument(previewDocumento.fileType) ? (
                                    <div className="overflow-hidden rounded-md border bg-background">
                                        <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                                            Preview Word local otimizado para arquivos DOCX, DOCM e formatos OOXML relacionados.
                                        </div>
                                        <div className="max-h-[720px] overflow-auto bg-neutral-100 p-6 dark:bg-slate-950">
                                            <div
                                                ref={docxPreviewContainerRef}
                                                className="docx-preview-host mx-auto min-h-[600px] max-w-4xl bg-white shadow-sm"
                                            />
                                            {!docxPreviewReady && !previewError && (
                                                <div className="flex min-h-[120px] items-center justify-center text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : previewDocumento && isLegacyWordDocument(previewDocumento.fileType) ? (
                                    <div className="rounded-md border bg-background p-6 text-sm text-muted-foreground">
                                        Este arquivo esta em formato Word legado (`.{previewDocumento.fileType}`), que nao possui renderizacao local confiavel no navegador.
                                        Use `Baixar Arquivo` para abrir no Word ou salve como `.docx`/`.docm` para habilitar preview completo no sistema.
                                    </div>
                                ) : previewDocumento && docViewerRenderers ? (
                                    <div className="min-h-[420px] overflow-hidden rounded-md border bg-background">
                                        <DocViewer
                                            documents={[previewDocumento]}
                                            initialActiveDocument={previewDocumento}
                                            pluginRenderers={docViewerRenderers}
                                            config={{
                                                header: {
                                                    disableHeader: true,
                                                    disableFileName: true,
                                                    retainURLParams: true,
                                                },
                                                pdfVerticalScrollByDefault: true,
                                            }}
                                            style={{ minHeight: '420px' }}
                                        />
                                    </div>
                                ) : documento.conteudo ? (
                                    <div className="prose dark:prose-invert max-w-none rounded-lg border bg-background p-6">
                                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                            {documento.conteudo}
                                        </pre>
                                    </div>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">{previewError || 'Conteúdo não disponível.'}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba Metadados */}
                <TabsContent value="metadados" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados do Documento</CardTitle>
                            <CardDescription>Informações detalhadas sobre o documento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Número</p>
                                        <p className="font-medium font-mono">{documento.numero}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo</p>
                                        <p className="font-medium">{documento.tipo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Categoria</p>
                                        <p className="font-medium">{documento.categoria?.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Subcategoria</p>
                                        <p className="font-medium">{documento.subcategoria?.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Legislação</p>
                                        <p className="font-medium">{documento.lei || documento.categoria?.lei || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tokens Utilizados</p>
                                        <p className="font-medium">{documento.tokens_utilizados?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Versão Atual</p>
                                        <p className="font-medium">v{documento.versao}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Última Atualização</p>
                                        <p className="font-medium">{formatDateTimeBR(new Date(documento.updated_at))}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba Anexos */}
                <TabsContent value="anexos" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Arquivos Anexados</CardTitle>
                            <CardDescription>Documentos e arquivos relacionados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {documento.anexos && documento.anexos.length > 0 ? (
                                    documento.anexos.map((anexo) => (
                                        <div
                                            key={anexo.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{anexo.nome}</p>
                                                    <p className="text-sm text-muted-foreground">{anexo.tamanho}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            if (!anexo.url) {
                                                                throw new Error('Anexo sem caminho de storage.');
                                                            }
                                                            const signedUrl = await documentosService.gerarUrlDownloadAnexo(anexo.url);
                                                            abrirDownload(signedUrl);
                                                        } catch (error) {
                                                            console.error('Erro ao baixar anexo:', error);
                                                            alert('Nao foi possivel baixar o anexo.');
                                                        }
                                                    }}
                                                >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Baixar
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">Nenhum anexo encontrado.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba Versões */}
                <TabsContent value="versoes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Versões</CardTitle>
                            <CardDescription>Versões anteriores do documento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">Versão</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead className="w-20">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documento.versoes && documento.versoes.length > 0 ? (
                                            documento.versoes.map((versao) => (
                                                <TableRow key={versao.id}>
                                                    <TableCell>
                                                        <Badge variant={versao.versao === documento.versao ? 'default' : 'outline'}>
                                                            v{versao.versao}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{versao.descricao || '-'}</TableCell>
                                                    <TableCell>{versao.usuario_nome || '-'}</TableCell>
                                                    <TableCell>{formatDateTimeBR(new Date(versao.created_at))}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma versão anterior.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba Histórico */}
                <TabsContent value="historico" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Alterações</CardTitle>
                            <CardDescription>
                                Registro de todas as ações realizadas no documento
                                {isAdmin && <span className="ml-2 text-xs text-primary">(Administrador: todos os logs visíveis)</span>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                                <div className="space-y-6">
                                    {documento.historico && documento.historico.length > 0 ? (
                                        documento.historico
                                            // Se não for admin, ocultar logs de 'Download'
                                            .filter(item => isAdmin || item.acao !== 'Download')
                                            .map((item) => {
                                                const isDownload = item.acao === 'Download';
                                                const isCriado = item.acao === 'Criado';
                                                return (
                                                    <div key={item.id} className="relative pl-10">
                                                        <div className={`absolute left-2 w-4 h-4 rounded-full border-4 border-background ${isDownload ? 'bg-blue-500' :
                                                            isCriado ? 'bg-green-500' :
                                                                'bg-primary'
                                                            }`} />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                {isDownload && <Download className="h-3 w-3 text-blue-500" />}
                                                                {isCriado && <PlusCircle className="h-3 w-3 text-green-500" />}
                                                                {!isDownload && !isCriado && <RefreshCw className="h-3 w-3 text-primary" />}
                                                                <span className="font-medium">{item.acao}</span>
                                                                {isDownload && isAdmin && (
                                                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                                                        <Shield className="h-2 w-2 mr-1" />
                                                                        Admin
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <User className="h-3 w-3" />
                                                                    {item.usuario_nome || 'Sistema'}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDateTimeBR(new Date(item.created_at))}
                                                                </span>
                                                                {item.detalhes && (
                                                                    <span className="text-xs italic">{item.detalhes}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <p className="text-muted-foreground pl-10">Nenhum histórico registrado.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
