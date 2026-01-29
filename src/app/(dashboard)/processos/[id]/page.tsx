'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    ArrowLeft,
    ArrowRight,
    Calendar,
    User,
    Building,
    Clock,
    History,
    Paperclip,
    Printer
} from 'lucide-react';
import { formatDateBR, formatDateTimeBR } from '@/utils/formatters';
import type { IProcesso, ITramitacao } from '@/types';

// Mock do processo
const processoMock: IProcesso = {
    id: '1',
    numero: '2024/000001',
    ano: 2024,
    assunto: 'Aquisição de materiais de escritório para suprir as necessidades da Secretaria de Administração durante o exercício de 2024',
    tipo: 'Licitação',
    interessado: 'Secretaria de Administração',
    interessadoId: '1',
    status: 'Em Andamento',
    prioridade: 'Normal',
    setorAtual: 'Setor de Compras',
    setorAtualId: '1',
    dataAbertura: new Date('2024-01-15'),
    dataPrazo: new Date('2024-02-15'),
    observacoes: 'Processo iniciado conforme solicitação da Portaria nº 123/2024.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
};

// Mock de tramitações
const tramitacoesMock: ITramitacao[] = [
    {
        id: '1',
        processoId: '1',
        setorOrigemId: '0',
        setorOrigemNome: 'Protocolo Geral',
        setorDestinoId: '1',
        setorDestinoNome: 'Setor de Compras',
        responsavel: 'Maria da Silva',
        despacho: 'Processo autuado e encaminhado conforme legislação vigente.',
        dataTramitacao: new Date('2024-01-15T09:00:00'),
        status: 'Concluído',
        createdAt: new Date('2024-01-15T09:00:00'),
    },
    {
        id: '2',
        processoId: '1',
        setorOrigemId: '1',
        setorOrigemNome: 'Setor de Compras',
        setorDestinoId: '2',
        setorDestinoNome: 'Setor Jurídico',
        responsavel: 'João dos Santos',
        despacho: 'Encaminho para análise jurídica quanto à modalidade licitatória aplicável.',
        dataTramitacao: new Date('2024-01-18T14:30:00'),
        status: 'Concluído',
        createdAt: new Date('2024-01-18T14:30:00'),
    },
    {
        id: '3',
        processoId: '1',
        setorOrigemId: '2',
        setorOrigemNome: 'Setor Jurídico',
        setorDestinoId: '1',
        setorDestinoNome: 'Setor de Compras',
        responsavel: 'Ana Paula Oliveira',
        despacho: 'Parecer favorável. Restituam para elaboração do edital de Pregão Eletrônico.',
        dataTramitacao: new Date('2024-01-20T11:15:00'),
        status: 'Concluído',
        createdAt: new Date('2024-01-20T11:15:00'),
    },
];

const anexosMock = [
    { id: '1', nome: 'Termo de Referência.pdf', tamanho: '256 KB', data: new Date('2024-01-15') },
    { id: '2', nome: 'Pesquisa de Preços.xlsx', tamanho: '48 KB', data: new Date('2024-01-16') },
    { id: '3', nome: 'Parecer Jurídico.pdf', tamanho: '128 KB', data: new Date('2024-01-20') },
];

export default function ProcessoDetalhePage() {
    const params = useParams();
    const [processo] = useState(processoMock);
    const [tramitacoes] = useState(tramitacoesMock);

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Em Andamento':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Aguardando':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Concluído':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/processos">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Processo {processo.numero}
                            </h1>
                            <Badge className={obterCorStatus(processo.status)}>
                                {processo.status}
                            </Badge>
                            <Badge variant="outline">{processo.prioridade}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {processo.assunto}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                    <Button asChild>
                        <Link href={`/processos/${params.id}/tramitar`}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Tramitar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Conteúdo em Abas */}
            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dados" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Dados
                    </TabsTrigger>
                    <TabsTrigger value="tramitacoes" className="gap-2">
                        <History className="h-4 w-4" />
                        Tramitações
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="gap-2">
                        <Paperclip className="h-4 w-4" />
                        Anexos
                    </TabsTrigger>
                </TabsList>

                {/* Aba Dados */}
                <TabsContent value="dados" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Informações Gerais */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informações Gerais</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Número</p>
                                        <p className="font-mono font-medium">{processo.numero}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo</p>
                                        <p className="font-medium">{processo.tipo}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">Assunto</p>
                                    <p className="font-medium">{processo.assunto}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge className={obterCorStatus(processo.status)}>
                                            {processo.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Prioridade</p>
                                        <p className="font-medium">{processo.prioridade}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interessado e Localização */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Interessado e Localização</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Interessado</p>
                                        <p className="font-medium">{processo.interessado}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Setor Atual</p>
                                        <p className="font-medium">{processo.setorAtual}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Datas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Datas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Abertura</p>
                                            <p className="font-medium">{formatDateBR(processo.dataAbertura)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Prazo</p>
                                            <p className="font-medium">{processo.dataPrazo ? formatDateBR(processo.dataPrazo) : '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Última Atualização</p>
                                        <p className="font-medium">{formatDateTimeBR(processo.updatedAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Observações */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Observações</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{processo.observacoes || 'Nenhuma observação registrada.'}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Aba Tramitações */}
                <TabsContent value="tramitacoes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Tramitações</CardTitle>
                            <CardDescription>
                                {tramitacoes.length} tramitação(ões) registrada(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tramitacoes.map((tram, index) => (
                                    <div
                                        key={tram.id}
                                        className={`relative pl-6 pb-4 ${index < tramitacoes.length - 1 ? 'border-l-2 border-border' : ''
                                            }`}
                                    >
                                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />

                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{tram.setorOrigemNome}</span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium text-primary">{tram.setorDestinoNome}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDateTimeBR(tram.dataTramitacao)}
                                                </span>
                                            </div>

                                            <p className="text-sm mb-2">{tram.despacho}</p>

                                            <p className="text-xs text-muted-foreground">
                                                Por: {tram.responsavel}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba Anexos */}
                <TabsContent value="anexos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Anexos do Processo</CardTitle>
                            <CardDescription>
                                {anexosMock.length} arquivo(s) anexado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome do Arquivo</TableHead>
                                            <TableHead className="w-24">Tamanho</TableHead>
                                            <TableHead className="w-32">Data</TableHead>
                                            <TableHead className="w-24 text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {anexosMock.map((anexo) => (
                                            <TableRow key={anexo.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                        {anexo.nome}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{anexo.tamanho}</TableCell>
                                                <TableCell className="text-sm">{formatDateBR(anexo.data)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">Download</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
