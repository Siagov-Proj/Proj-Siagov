'use client';

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
    FileDown,
    Zap,
} from 'lucide-react';
import { formatDate, formatDateTimeBR } from '@/utils/formatters';

// Dados mock expandidos
const mockDocumento = {
    id: 'd1',
    numero: '2024-001',
    titulo: 'Parecer Técnico - Pregão 15/2024',
    tipo: 'Parecer',
    categoria: 'Licitações',
    subcategoria: 'Pregão Eletrônico',
    lei: 'Lei 14.133/2021',
    processoId: '1',
    processoNumero: '001/2024',
    status: 'Concluído' as const,
    criadoEm: new Date('2025-01-18'),
    atualizadoEm: new Date('2025-01-20'),
    criadoPor: 'João Silva',
    especialista: 'Licitações Públicas',
    tokensUtilizados: 2345,
    versao: 3,
    conteudo: `
## 1. INTRODUÇÃO

Este parecer técnico tem por objetivo analisar os aspectos legais e técnicos relacionados ao Pregão Eletrônico nº 15/2024, cujo objeto é a aquisição de materiais de escritório para atender às necessidades da Secretaria de Administração.

## 2. FUNDAMENTAÇÃO LEGAL

O presente procedimento licitatório fundamenta-se na Lei nº 14.133/2021 (Nova Lei de Licitações), que estabelece normas gerais de licitação e contratação para as Administrações Públicas diretas, autárquicas e fundacionais da União, dos Estados, do Distrito Federal e dos Municípios.

## 3. ANÁLISE TÉCNICA

Após análise criteriosa da documentação apresentada, verificou-se que:
- O Termo de Referência encontra-se adequadamente elaborado;
- As especificações técnicas estão claras e objetivas;
- O valor estimado está compatível com os preços de mercado;
- Os prazos estabelecidos são exequíveis.

## 4. CONCLUSÃO

Diante do exposto, este setor técnico manifesta-se FAVORÁVEL à continuidade do procedimento licitatório, uma vez que foram atendidos todos os requisitos legais e técnicos aplicáveis.
    `,
    anexos: [
        { id: '1', nome: 'Parecer_Tecnico_2024-001.pdf', tamanho: '156 KB' },
        { id: '2', nome: 'Anexo_Planilha_Precos.xlsx', tamanho: '42 KB' },
    ],
    historico: [
        {
            id: '1',
            acao: 'Documento criado',
            usuario: 'João Silva',
            data: new Date('2025-01-18T09:30:00'),
        },
        {
            id: '2',
            acao: 'Documento enviado para revisão',
            usuario: 'João Silva',
            data: new Date('2025-01-18T14:15:00'),
        },
        {
            id: '3',
            acao: 'Documento revisado',
            usuario: 'Maria Santos',
            data: new Date('2025-01-19T11:00:00'),
        },
        {
            id: '4',
            acao: 'Documento aprovado e concluído',
            usuario: 'Carlos Oliveira',
            data: new Date('2025-01-20T16:45:00'),
        },
    ],
    versoes: [
        {
            id: 'v3',
            versao: 3,
            data: new Date('2025-01-20T16:45:00'),
            usuario: 'Carlos Oliveira',
            descricao: 'Versão final aprovada',
        },
        {
            id: 'v2',
            versao: 2,
            data: new Date('2025-01-19T11:00:00'),
            usuario: 'Maria Santos',
            descricao: 'Correções após revisão',
        },
        {
            id: 'v1',
            versao: 1,
            data: new Date('2025-01-18T09:30:00'),
            usuario: 'João Silva',
            descricao: 'Versão inicial',
        },
    ],
};

export default function DetalheDocumentoPage() {
    const params = useParams();
    const documento = mockDocumento; // Em produção, buscar pelo ID

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Concluído':
                return 'default';
            case 'Em Revisão':
                return 'secondary';
            case 'Rascunho':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const exportarDocx = () => {
        // Simula exportação
        console.log('Exportando documento para DOCX...');
        alert('Documento exportado com sucesso!');
    };

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
                    <Button variant="outline">
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
                                <p className="font-medium">{documento.categoria}</p>
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
                                <p className="font-medium">{documento.lei}</p>
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
                                <p className="font-medium">{formatDate(documento.criadoEm)}</p>
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
                                <p className="font-medium">{documento.tokensUtilizados.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Badge variant={obterCorStatus(documento.status)} className="text-base px-4 py-2">
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
                        Anexos ({documento.anexos.length})
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
                                Visualização do conteúdo gerado - Vinculado ao Processo {documento.processoNumero}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none bg-muted/30 p-6 rounded-lg border">
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                    {documento.conteudo}
                                </pre>
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
                                        <p className="font-medium">{documento.categoria}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Subcategoria</p>
                                        <p className="font-medium">{documento.subcategoria}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Legislação</p>
                                        <p className="font-medium">{documento.lei}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Especialista IA</p>
                                        <p className="font-medium">{documento.especialista}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tokens Utilizados</p>
                                        <p className="font-medium">{documento.tokensUtilizados.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Versão Atual</p>
                                        <p className="font-medium">v{documento.versao}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Criado por</p>
                                        <p className="font-medium">{documento.criadoPor}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Última Atualização</p>
                                        <p className="font-medium">{formatDateTimeBR(documento.atualizadoEm)}</p>
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
                                {documento.anexos.map((anexo) => (
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
                                ))}
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
                                        {documento.versoes.map((versao) => (
                                            <TableRow key={versao.id}>
                                                <TableCell>
                                                    <Badge variant={versao.versao === documento.versao ? 'default' : 'outline'}>
                                                        v{versao.versao}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{versao.descricao}</TableCell>
                                                <TableCell>{versao.usuario}</TableCell>
                                                <TableCell>{formatDateTimeBR(versao.data)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                    {documento.historico.map((item) => (
                                        <div key={item.id} className="relative pl-10">
                                            <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.acao}</span>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {item.usuario}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTimeBR(item.data)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
