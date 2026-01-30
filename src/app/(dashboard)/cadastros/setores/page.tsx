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
import { Plus, Search, Pencil, Trash2, BriefcaseBusiness, ArrowLeft, Loader2 } from 'lucide-react';
import { setoresService, ISetorDB } from '@/services/api';

export default function SetoresPage() {
    const router = useRouter();
    const [setores, setSetores] = useState<ISetorDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const carregarSetores = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await setoresService.listar(termoBusca);
            setSetores(dados);
        } catch (err) {
            console.error('Erro ao carregar setores:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarSetores();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarSetores]);

    const handleNovo = () => {
        router.push('/cadastros/setores/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/setores/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este setor?')) {
            try {
                setDeleting(id);
                await setoresService.excluir(id);
                setSetores(setores.filter((s) => s.id !== id));
            } catch (err) {
                console.error('Erro ao excluir setor:', err);
                alert('Erro ao excluir setor. Tente novamente.');
            } finally {
                setDeleting(null);
            }
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
                            <BriefcaseBusiness className="h-6 w-6" />
                            Setores
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de setores administrativos das unidades gestoras
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Setor
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Setores</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${setores.length} setor(es) encontrado(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar setor..."
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
                                        <TableHead>Responsável</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {setores.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum setor encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        setores.map((setor) => (
                                            <TableRow key={setor.id}>
                                                <TableCell className="font-mono">{setor.codigo}</TableCell>
                                                <TableCell className="font-medium">{setor.nome}</TableCell>
                                                <TableCell>{setor.nome_abreviado || '-'}</TableCell>
                                                <TableCell className="text-sm">{setor.responsavel || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(setor.id)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(setor.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === setor.id}
                                                        >
                                                            {deleting === setor.id ? (
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
