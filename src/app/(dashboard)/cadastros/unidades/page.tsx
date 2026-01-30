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
import { Plus, Search, Pencil, Trash2, Landmark, ArrowLeft, Loader2 } from 'lucide-react';
import { unidadesService, IUnidadeGestoraDB } from '@/services/api';

export default function UnidadesGestorasPage() {
    const router = useRouter();
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const carregarUnidades = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await unidadesService.listar(termoBusca);
            setUnidades(dados);
        } catch (err) {
            console.error('Erro ao carregar unidades gestoras:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarUnidades();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarUnidades]);

    const handleNovo = () => {
        router.push('/cadastros/unidades/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/unidades/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta unidade gestora?')) {
            try {
                setDeleting(id);
                await unidadesService.excluir(id);
                setUnidades(unidades.filter((u) => u.id !== id));
            } catch (err) {
                console.error('Erro ao excluir unidade gestora:', err);
                alert('Erro ao excluir unidade gestora. Tente novamente.');
            } finally {
                setDeleting(null);
            }
        }
    };

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
                            <Landmark className="h-6 w-6" />
                            Unidades Gestoras
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de unidades de gestão administrativa
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Unidades Gestoras</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${unidades.length} unidade(s) encontrada(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar unidade..."
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
                                        <TableHead className="w-20">Código</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="w-20">Sigla</TableHead>
                                        <TableHead>Ordenador</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unidades.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhuma unidade gestora encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        unidades.map((ug) => (
                                            <TableRow key={ug.id}>
                                                <TableCell className="font-mono">{ug.codigo}</TableCell>
                                                <TableCell className="font-medium">{ug.nome}</TableCell>
                                                <TableCell>{ug.nome_abreviado || '-'}</TableCell>
                                                <TableCell className="text-sm">{ug.ordenador_despesa || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(ug.id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(ug.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === ug.id}
                                                        >
                                                            {deleting === ug.id ? (
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
                </CardContent>
            </Card>
        </div>
    );
}
