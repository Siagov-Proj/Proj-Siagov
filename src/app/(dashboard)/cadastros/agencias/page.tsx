'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListPagination } from '@/components/ui/list-pagination';
import { Plus, Search, Pencil, Trash2, Landmark, ArrowLeft, Loader2 } from 'lucide-react';
import { agenciasService, IAgenciaDB } from '@/services/api';
import { useCadastroDialogs } from '@/components/cadastros/cadastro-dialog-provider';

export default function AgenciasPage() {
    const itensPorPagina = 10;
    const router = useRouter();
    const { showConfirm } = useCadastroDialogs();
    const [agencias, setAgencias] = useState<IAgenciaDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(1);

    const carregarAgencias = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await agenciasService.listar(termoBusca);
            setAgencias(dados);
        } catch (err) {
            console.error('Erro ao carregar agências:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarAgencias();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarAgencias]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [termoBusca]);

    const agenciasPaginadas = agencias.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

    const handleNovo = () => {
        router.push('/cadastros/agencias/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/agencias/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!await showConfirm({
            title: 'Excluir agência',
            description: 'Tem certeza que deseja excluir esta agência?',
            confirmLabel: 'Excluir',
            variant: 'danger',
        })) {
            return;
        }

        try {
            setDeleting(id);
            await agenciasService.excluir(id);
            setAgencias(agencias.filter((a) => a.id !== id));
        } catch (err) {
            console.error('Erro ao excluir agência:', err);
            alert('Erro ao excluir agência. Tente novamente.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Landmark className="h-6 w-6" />
                            Agências Bancárias
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de agências vinculadas aos bancos
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Agência
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Agências</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${agencias.length} agência(s) cadastrada(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar agência..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-28">Agência</TableHead>
                                        <TableHead>Banco</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Município/UF</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agencias.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhuma agência encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        agenciasPaginadas.map((agencia) => (
                                            <TableRow key={agencia.id}>
                                                <TableCell className="font-mono">
                                                    {agencia.codigo}{agencia.digito_verificador ? `-${agencia.digito_verificador}` : ''}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {agencia.banco ? `${agencia.banco.codigo} - ${agencia.banco.nome}` : '-'}
                                                </TableCell>
                                                <TableCell className="font-medium">{agencia.nome}</TableCell>
                                                <TableCell className="text-sm">
                                                    {agencia.municipio}{agencia.uf ? `/${agencia.uf}` : ''}
                                                </TableCell>
                                                <TableCell className="text-sm">{agencia.telefone || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(agencia.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(agencia.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === agencia.id}
                                                        >
                                                            {deleting === agencia.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <ListPagination currentPage={paginaAtual} totalItems={agencias.length} itemsPerPage={itensPorPagina} onPageChange={setPaginaAtual} itemLabel="agências" />
                </CardContent>
            </Card>
        </div>
    );
}
