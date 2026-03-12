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
import { Badge } from '@/components/ui/badge';
import { ListPagination } from '@/components/ui/list-pagination';
import { Plus, Search, Pencil, Trash2, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { orgaosService, IOrgaoDB } from '@/services/api';
import { AuditHistoryDialog } from '@/components/ui/audit-history-dialog';
import { SmartDeleteDialog } from '@/components/SmartDeleteDialog';

export default function OrgaosPage() {
    const itensPorPagina = 10;
    const router = useRouter();
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; nome: string } | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(1);

    const carregarOrgaos = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await orgaosService.listar(searchTerm);
            setOrgaos(dados);
        } catch (err) {
            console.error('Erro ao carregar órgãos:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarOrgaos();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarOrgaos]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [searchTerm]);

    const handleNovo = () => {
        router.push('/cadastros/orgaos/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/orgaos/${id}`);
    };

    const handleDeleteClick = (orgao: IOrgaoDB) => {
        setItemToDelete({ id: orgao.id, nome: orgao.nome });
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setDeleting(itemToDelete.id);
            await orgaosService.excluir(itemToDelete.id);
            setOrgaos(orgaos.filter((o) => o.id !== itemToDelete.id));
        } catch (err: unknown) {
            console.error('Erro ao excluir órgão:', err);
            alert(getErrorMessage(err));
        } finally {
            setDeleting(null);
        }
    };

    const orgaosPaginados = orgaos.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Órgãos
                        </h1>
                        <p className="text-muted-foreground">
                            Gerenciamento de órgãos vinculados às instituições
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Órgão
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Órgãos</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${orgaos.length} órgão(s) encontrado(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar órgão..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                        <TableHead className="w-24">Código</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="w-20">Sigla</TableHead>
                                        <TableHead>Instituição</TableHead>
                                        <TableHead>Poder</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orgaos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhum órgão encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orgaosPaginados.map((orgao) => (
                                            <TableRow key={orgao.id}>
                                                <TableCell className="font-mono">{orgao.codigo}</TableCell>
                                                <TableCell className="font-medium">{orgao.nome}</TableCell>
                                                <TableCell>{orgao.sigla}</TableCell>
                                                <TableCell>{orgao.instituicao?.nome || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{orgao.poder_vinculado}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <AuditHistoryDialog
                                                            tableName="orgaos"
                                                            recordId={orgao.id}
                                                            variant="ghost"
                                                            size="icon"
                                                            buttonText=""
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(orgao.id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteClick(orgao)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === orgao.id}
                                                        >
                                                            {deleting === orgao.id ? (
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
                    <ListPagination currentPage={paginaAtual} totalItems={orgaos.length} itemsPerPage={itensPorPagina} onPageChange={setPaginaAtual} itemLabel="órgãos" />
                </CardContent>
            </Card>

            {itemToDelete && (
                <SmartDeleteDialog
                    open={deleteModalOpen}
                    onOpenChange={setDeleteModalOpen}
                    title={`Excluir Órgão: ${itemToDelete.nome}`}
                    onConfirm={handleConfirmDelete}
                    onCheckDependencies={() => orgaosService.verificarDependencias(itemToDelete.id)}
                />
            )}
        </div>
    );
}
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Erro ao excluir órgão. Tente novamente.';
