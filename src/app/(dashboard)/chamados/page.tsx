'use client';

import { useState, useEffect, useCallback } from 'react';
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, MessageSquare, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { formatDateBR } from '@/utils/formatters';
import { chamadosService, IChamadoDB } from '@/services/api/chamadosService';

const CATEGORIAS = [
    { value: 'todos', label: 'Todas as Categorias' },
    { value: 'Bug', label: 'Bug/Erro' },
    { value: 'Dúvida', label: 'Dúvida' },
    { value: 'Melhoria', label: 'Sugestão de Melhoria' },
];

const STATUS = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Aberto', label: 'Aberto' },
    { value: 'Em Atendimento', label: 'Em Atendimento' },
    { value: 'Aguardando Resposta', label: 'Aguardando Resposta' },
    { value: 'Resolvido', label: 'Resolvido' },
    { value: 'Fechado', label: 'Fechado' },
];

export default function ChamadosPage() {
    const [chamados, setChamados] = useState<IChamadoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const carregarChamados = useCallback(async () => {
        setLoading(true);
        try {
            const data = await chamadosService.listar({
                termo: termoBusca,
                categoria: filtroCategoria,
                status: filtroStatus
            });
            setChamados(data);
        } catch (error) {
            console.error('Erro ao carregar chamados:', error);
        } finally {
            setLoading(false);
        }
    }, [termoBusca, filtroCategoria, filtroStatus]);

    useEffect(() => {
        carregarChamados();
    }, [carregarChamados]);

    // Estatísticas
    const stats = {
        total: chamados.length,
        abertos: chamados.filter((c) => c.status === 'Aberto').length,
        emAtendimento: chamados.filter((c) => c.status === 'Em Atendimento').length,
        resolvidos: chamados.filter((c) => c.status === 'Resolvido' || c.status === 'Fechado').length,
    };

    // (Helper functions remain)

    // Filtrar chamados
    // const chamadosFiltrados = mockChamados.filter((chamado) => { ... });
    // Note: Filtering is now handled by the backend service.
    // 'chamados' state already contains filtered data.
    const chamadosFiltrados = chamados;

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Aberto': return 'destructive';
            case 'Em Atendimento': return 'default';
            case 'Aguardando Resposta': return 'secondary';
            case 'Resolvido': return 'outline';
            case 'Fechado': return 'outline';
            default: return 'outline'; // Fallback
        }
    };

    const obterCorCategoria = (categoria: string) => {
        switch (categoria) {
            case 'Bug': return 'destructive';
            case 'Dúvida': return 'secondary';
            case 'Melhoria': return 'default';
            default: return 'outline';
        }
    };

    const obterIconeCategoria = (categoria: string) => {
        switch (categoria) {
            case 'Bug': return <AlertCircle className="h-4 w-4" />;
            case 'Dúvida': return <HelpCircle className="h-4 w-4" />;
            case 'Melhoria': return <MessageSquare className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        Chamados de Suporte
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie solicitações de suporte e acompanhe o andamento
                    </p>
                </div>
                <Button asChild>
                    <Link href="/chamados/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Chamado
                    </Link>
                </Button>
            </div>

            {/* ... (Rest of UI) ... */}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total de Chamados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Abertos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.abertos}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Em Atendimento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.emAtendimento}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Resolvidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.resolvidos}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por assunto ou protocolo..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Chamados</CardTitle>
                    <CardDescription>
                        {chamadosFiltrados.length} chamado(s) encontrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-28">Protocolo</TableHead>
                                    <TableHead>Assunto</TableHead>
                                    <TableHead className="w-28">Categoria</TableHead>
                                    <TableHead className="w-36">Status</TableHead>
                                    <TableHead className="w-28">SLA</TableHead>
                                    <TableHead className="w-24 text-center">Mensagens</TableHead>
                                    <TableHead className="w-20 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chamadosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Nenhum chamado encontrado com os filtros aplicados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    chamadosFiltrados.map((chamado) => (
                                        <TableRow key={chamado.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell className="font-mono text-sm">
                                                #{chamado.protocolo}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{chamado.assunto}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Por {chamado.criado_por} • {formatDateBR(chamado.data_abertura)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={obterCorCategoria(chamado.categoria)}>
                                                    <span className="flex items-center gap-1">
                                                        {obterIconeCategoria(chamado.categoria)}
                                                        {chamado.categoria}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={obterCorStatus(chamado.status)}>
                                                    {chamado.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {chamado.sla_restante ? (
                                                    <span className="flex items-center gap-1 text-orange-600">
                                                        <Clock className="h-4 w-4" />
                                                        {chamado.sla_restante}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                    {chamado.mensagens_count || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/chamados/${chamado.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
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
