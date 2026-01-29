'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Plus, Search, Eye, FileText, ArrowRight, Filter, Calendar, X, Files, Clock, CheckCircle, Inbox, User } from 'lucide-react';
import { formatDateBR } from '@/utils/formatters';
import type { IProcesso } from '@/types';

// Dados mock de processos
const processosIniciais: (IProcesso & { documentos?: number })[] = [
    {
        id: '1',
        numero: '2024/000001',
        ano: 2024,
        assunto: 'Aquisição de materiais de escritório',
        tipo: 'Licitação',
        interessado: 'Secretaria de Administração',
        interessadoId: '1',
        status: 'Em Andamento',
        prioridade: 'Normal',
        setorAtual: 'Setor de Compras',
        setorAtualId: '1',
        dataAbertura: new Date('2024-01-15'),
        dataPrazo: new Date('2024-02-15'),
        observacoes: '',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        documentos: 5,
    },
    {
        id: '2',
        numero: '2024/000002',
        ano: 2024,
        assunto: 'Contratação de serviços de limpeza',
        tipo: 'Contrato',
        interessado: 'Coordenadoria de Serviços Gerais',
        interessadoId: '2',
        status: 'Aguardando',
        prioridade: 'Alta',
        setorAtual: 'Setor Jurídico',
        setorAtualId: '2',
        dataAbertura: new Date('2024-01-18'),
        dataPrazo: new Date('2024-02-01'),
        observacoes: 'Urgente - contrato atual vence em 30 dias',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-22'),
        documentos: 8,
    },
    {
        id: '3',
        numero: '2024/000003',
        ano: 2024,
        assunto: 'Pagamento de fornecedor - NF 12345',
        tipo: 'Pagamento',
        interessado: 'Empresa ABC LTDA',
        interessadoId: '3',
        status: 'Concluído',
        prioridade: 'Normal',
        setorAtual: 'Setor Financeiro',
        setorAtualId: '3',
        dataAbertura: new Date('2024-01-10'),
        dataPrazo: new Date('2024-01-25'),
        dataEncerramento: new Date('2024-01-23'),
        observacoes: '',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-23'),
        documentos: 12,
    },
    {
        id: '4',
        numero: '2024/000004',
        ano: 2024,
        assunto: 'Solicitação de férias - funcionário João',
        tipo: 'Administrativo',
        interessado: 'João da Silva',
        interessadoId: '4',
        status: 'Arquivado',
        prioridade: 'Baixa',
        setorAtual: 'Arquivo',
        setorAtualId: '4',
        dataAbertura: new Date('2024-01-05'),
        dataPrazo: new Date('2024-01-12'),
        dataEncerramento: new Date('2024-01-08'),
        observacoes: '',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-08'),
        documentos: 3,
    },
    {
        id: '5',
        numero: '2024/000005',
        ano: 2024,
        assunto: 'Pregão Eletrônico - Material de Expediente',
        tipo: 'Licitação',
        interessado: 'Departamento de Compras',
        interessadoId: '5',
        status: 'Em Andamento',
        prioridade: 'Alta',
        setorAtual: 'Setor de Compras',
        setorAtualId: '1',
        dataAbertura: new Date(),
        dataPrazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        observacoes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        documentos: 15,
    },
];

const TIPOS_PROCESSO = [
    { value: 'todos', label: 'Todos os Tipos' },
    { value: 'Licitação', label: 'Licitação' },
    { value: 'Contrato', label: 'Contrato' },
    { value: 'Pagamento', label: 'Pagamento' },
    { value: 'Administrativo', label: 'Administrativo' },
];

const STATUS_PROCESSO = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Aguardando', label: 'Aguardando' },
    { value: 'Concluído', label: 'Concluído' },
    { value: 'Arquivado', label: 'Arquivado' },
];

const PRIORIDADES = [
    { value: 'todos', label: 'Todas as Prioridades' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Baixa', label: 'Baixa' },
];

const PERIODOS = [
    { value: 'todos', label: 'Todos os Períodos' },
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mês' },
];

// Usuário logado (mock)
const usuarioLogado = {
    setor: 'Setor de Compras',
};

export default function ProcessosPage() {
    const [processos] = useState(processosIniciais);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
    const [filtroSetor, setFiltroSetor] = useState('todos');
    const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // Setores únicos para filtro
    const setoresUnicos = Array.from(new Set(processos.map((p) => p.setorAtual || '')));

    // Estatísticas
    const stats = {
        total: processos.length,
        emAndamento: processos.filter((p) => p.status === 'Em Andamento').length,
        aguardando: processos.filter((p) => p.status === 'Aguardando').length,
        concluidos: processos.filter((p) => p.status === 'Concluído').length,
        naMinhaMesa: processos.filter((p) => p.setorAtual === usuarioLogado.setor).length,
    };

    // Filtro de período
    const filtrarPorPeriodo = (dataAbertura: Date): boolean => {
        if (filtroPeriodo === 'todos') return true;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataProc = new Date(dataAbertura);
        dataProc.setHours(0, 0, 0, 0);

        if (filtroPeriodo === 'hoje') {
            return dataProc.getTime() === hoje.getTime();
        } else if (filtroPeriodo === 'semana') {
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            return dataProc >= inicioSemana;
        } else if (filtroPeriodo === 'mes') {
            return dataProc.getMonth() === hoje.getMonth() && dataProc.getFullYear() === hoje.getFullYear();
        }
        return true;
    };

    const processosFiltrados = processos.filter((processo) => {
        const matchBusca =
            processo.numero.includes(termoBusca) ||
            processo.assunto.toLowerCase().includes(termoBusca.toLowerCase()) ||
            processo.interessado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            (processo.setorAtual?.toLowerCase().includes(termoBusca.toLowerCase()) ?? false);

        const matchTipo = filtroTipo === 'todos' || processo.tipo === filtroTipo;
        const matchStatus = filtroStatus === 'todos' || processo.status === filtroStatus;
        const matchPrioridade = filtroPrioridade === 'todos' || processo.prioridade === filtroPrioridade;
        const matchSetor = filtroSetor === 'todos' || processo.setorAtual === filtroSetor;
        const matchPeriodo = filtrarPorPeriodo(processo.dataAbertura);

        return matchBusca && matchTipo && matchStatus && matchPrioridade && matchSetor && matchPeriodo;
    });

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Em Andamento':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Aguardando':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Concluído':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Arquivado':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const obterCorPrioridade = (prioridade: string) => {
        switch (prioridade) {
            case 'Alta':
                return 'text-red-600 dark:text-red-400';
            case 'Normal':
                return 'text-blue-600 dark:text-blue-400';
            case 'Baixa':
                return 'text-gray-600 dark:text-gray-400';
            default:
                return '';
        }
    };

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltroTipo('todos');
        setFiltroStatus('todos');
        setFiltroPrioridade('todos');
        setFiltroSetor('todos');
        setFiltroPeriodo('todos');
    };

    const temFiltrosAtivos =
        filtroTipo !== 'todos' ||
        filtroStatus !== 'todos' ||
        filtroPrioridade !== 'todos' ||
        filtroSetor !== 'todos' ||
        filtroPeriodo !== 'todos' ||
        termoBusca !== '';

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Gestão de Processos
                    </h1>
                    <p className="text-muted-foreground">
                        Gerenciamento e tramitação de processos administrativos
                    </p>
                </div>
                <Button asChild>
                    <Link href="/processos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Processo
                    </Link>
                </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Files className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Em Andamento</p>
                                <p className="text-2xl font-bold">{stats.emAndamento}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <Inbox className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Aguardando</p>
                                <p className="text-2xl font-bold">{stats.aguardando}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Concluídos</p>
                                <p className="text-2xl font-bold">{stats.concluidos}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Na Minha Mesa</p>
                                <p className="text-2xl font-bold">{stats.naMinhaMesa}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>Lista de Processos</CardTitle>
                                <CardDescription>
                                    {processosFiltrados.length} processo(s) encontrado(s)
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por número, assunto..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                    className={mostrarFiltros ? 'bg-accent' : ''}
                                >
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Filtros Avançados */}
                        {mostrarFiltros && (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Filtros Avançados</h4>
                                    {temFiltrosAtivos && (
                                        <Button variant="ghost" size="sm" onClick={limparFiltros}>
                                            <X className="mr-1 h-3 w-3" />
                                            Limpar Filtros
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Tipo</span>
                                        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIPOS_PROCESSO.map((tipo) => (
                                                    <SelectItem key={tipo.value} value={tipo.value}>
                                                        {tipo.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_PROCESSO.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Prioridade</span>
                                        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORIDADES.map((prioridade) => (
                                                    <SelectItem key={prioridade.value} value={prioridade.value}>
                                                        {prioridade.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Setor Atual</span>
                                        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos os Setores</SelectItem>
                                                {setoresUnicos.map((setor) => (
                                                    <SelectItem key={setor} value={setor}>
                                                        {setor}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Período</span>
                                        <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PERIODOS.map((periodo) => (
                                                    <SelectItem key={periodo.value} value={periodo.value}>
                                                        {periodo.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-28">Número</TableHead>
                                    <TableHead>Assunto</TableHead>
                                    <TableHead>Setor Atual</TableHead>
                                    <TableHead className="w-32">Tipo</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-20 text-center">Docs</TableHead>
                                    <TableHead className="w-28">Abertura</TableHead>
                                    <TableHead className="w-32 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Nenhum processo encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    processosFiltrados.map((processo) => (
                                        <TableRow key={processo.id}>
                                            <TableCell className="font-mono font-medium">{processo.numero}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="max-w-xs truncate">{processo.assunto}</span>
                                                    <span className="text-xs text-muted-foreground">{processo.interessado}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{processo.setorAtual}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{processo.tipo}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={obterCorStatus(processo.status)}>
                                                    {processo.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/documentos?processo=${processo.numero}`}
                                                    className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors"
                                                >
                                                    <Files className="h-3 w-3" />
                                                    {processo.documentos || 0}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {formatDateBR(processo.dataAbertura)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/processos/${processo.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/processos/${processo.id}/tramitar`}>
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
