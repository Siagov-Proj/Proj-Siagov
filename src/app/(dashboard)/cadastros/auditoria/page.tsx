'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { auditService, IAuditLog } from '@/services/api';

// Reusing some rendering logic from the modal
function getActionBadge(action: string) {
    switch (action) {
        case 'INSERT':
            return <Badge className="bg-green-500 hover:bg-green-600">Criação</Badge>;
        case 'UPDATE':
            return <Badge className="bg-blue-500 hover:bg-blue-600">Edição</Badge>;
        case 'DELETE':
            return <Badge variant="destructive">Exclusão</Badge>;
        default:
            return <Badge variant="secondary">{action}</Badge>;
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatTableName(name: string) {
    // Basic formatting to make table names readable (e.g. unidades_gestoras -> Unidades Gestoras)
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function AuditoriaPage() {
    const [logs, setLogs] = useState<IAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTable, setFilterTable] = useState('all');
    const [filterAction, setFilterAction] = useState('all');

    // Lista fixa (ou dinâmica se quiser buscar de uma tipagem) das tabelas
    const tables = [
        'agencias', 'bancos', 'cargos', 'categorias_documentos',
        'credores', 'esferas', 'exercicios_financeiros', 'instituicoes',
        'orgaos', 'setores', 'subcategorias_documentos', 'unidades_gestoras', 'usuarios'
    ];

    const carregarLogs = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await auditService.listarTodosLogs(100, 0, {
                tableName: filterTable,
                action: filterAction
            });
            setLogs(dados);
        } catch (err) {
            console.error('Erro ao carregar auditoria:', err);
        } finally {
            setLoading(false);
        }
    }, [filterTable, filterAction]);

    useEffect(() => {
        carregarLogs();
    }, [carregarLogs]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            Auditoria de Sistema
                        </h1>
                        <p className="text-muted-foreground">
                            Registro global de todas as modificações no banco de dados (Últimos 100 registros)
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={carregarLogs} disabled={loading}>
                    Atualizar Registros
                </Button>
            </div>

            {/* Filters & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Histórico Recente</CardTitle>
                            <CardDescription>
                                {loading ? 'Buscando do servidor...' : `${logs.length} log(s) localizado(s)`}
                            </CardDescription>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Select value={filterTable} onValueChange={setFilterTable}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filtrar por Tabela" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Tabelas</SelectItem>
                                    {tables.map(t => (
                                        <SelectItem key={t} value={t}>{formatTableName(t)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filterAction} onValueChange={setFilterAction}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Ação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas Ações</SelectItem>
                                    <SelectItem value="INSERT">Criações (Insert)</SelectItem>
                                    <SelectItem value="UPDATE">Edições (Update)</SelectItem>
                                    <SelectItem value="DELETE">Exclusões (Delete)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Data / Hora</TableHead>
                                        <TableHead className="w-[120px]">Ação</TableHead>
                                        <TableHead>Tabela / Entidade</TableHead>
                                        <TableHead className="w-[300px]">Usuário Responsável</TableHead>
                                        <TableHead className="w-[80px] text-center">Info</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum registro de auditoria corresponde aos filtros atuais.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm font-medium whitespace-nowrap">
                                                    {formatDate(log.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    {getActionBadge(log.action)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{formatTableName(log.table_name)}</span>
                                                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] xl:max-w-xs" title={log.record_id}>
                                                            ID: {log.record_id.split('-')[0]}...
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-muted p-1.5 rounded-full shrink-0">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-sm font-medium">
                                                                {log.usuario?.nome || 'Sistema'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                {log.usuario?.email || log.changed_by || 'Ação Automatizada'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="icon" title="Ver dados alterados">
                                                        <Search className="h-4 w-4 text-muted-foreground" />
                                                        <span className="sr-only">Ver detalhes</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
