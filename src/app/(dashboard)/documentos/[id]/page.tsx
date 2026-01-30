'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    FileDown,
    Zap,
    Loader2
} from 'lucide-react';
import { formatDate, formatDateTimeBR } from '@/utils/formatters';

// Services
import { documentosService, IDocumentoDB } from '@/services/api/documentosService';

export default function DetalheDocumentoPage() {
    const params = useParams();
    const router = useRouter();
    const [documento, setDocumento] = useState<IDocumentoDB | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadDocumento(params.id as string);
        }
    }, [params.id]);

    const loadDocumento = async (id: string) => {
        try {
            setLoading(true);
            const doc = await documentosService.obterPorId(id);
            if (!doc) {
                // handle not found
                return;
            }
            setDocumento(doc);
        } catch (error) {
            console.error('Erro ao carregar documento:', error);
        } finally {
            setLoading(false);
        }
    };

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Concluído': return 'default';
            case 'Em Revisão': return 'secondary';
            case 'Rascunho': return 'outline';
            default: return 'outline';
        }
    };

    const exportarDocx = () => {
        alert('Exportação não implementada');
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
                    <Button variant="outline" disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button variant="outline" onClick={exportarDocx}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar DOCX
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </Button>
                </div>
            </div>

            {/* Cards de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Categoria</p>
                                <p className="font-medium truncate" title={documento.categoria?.nome}>{documento.categoria?.nome || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Scale className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Lei</p>
                                <p className="font-medium truncate" title={documento.lei || documento.categoria?.lei || '-'}>{documento.lei || documento.categoria?.lei || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Criado em</p>
                                <p className="font-medium">{formatDate(new Date(documento.created_at))}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Zap className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tokens</p>
                                <p className="font-medium">{documento.tokens_utilizados?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Badge variant={obterCorStatus(documento.status)} className="text-base px-4 py-2 w-full justify-center">
                                {documento.status}
                            </Badge>
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
                                Visualização do conteúdo gerado - Vinculado ao Processo {documento.processo?.numero || 'N/A'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none bg-muted/30 p-6 rounded-lg border">
                                {documento.conteudo ? (
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                        {documento.conteudo}
                                    </pre>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">Conteúdo não disponível.</p>
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
                                        <p className="text-sm text-muted-foreground">Especialista IA</p>
                                        <p className="font-medium">{documento.especialista_id || '-'}</p>
                                    </div>
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
                                                <Button variant="outline" size="sm">
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
                            <CardDescription>Registro de todas as ações realizadas no documento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                                <div className="space-y-6">
                                    {documento.historico && documento.historico.length > 0 ? (
                                        documento.historico.map((item) => (
                                            <div key={item.id} className="relative pl-10">
                                                <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.acao}</span>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {item.usuario_nome || 'Sistema'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDateTimeBR(new Date(item.created_at))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
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
