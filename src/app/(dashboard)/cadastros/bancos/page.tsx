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
import { Plus, Search, Pencil, Trash2, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { bancosService, IBancoDB } from '@/services/api';

export default function BancosPage() {
    const router = useRouter();
    const [bancos, setBancos] = useState<IBancoDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const carregarBancos = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await bancosService.listar(termoBusca);
            setBancos(dados);
        } catch (err) {
            console.error('Erro ao carregar bancos:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarBancos();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarBancos]);

    const handleNovo = () => {
        router.push('/cadastros/bancos/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/bancos/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este banco?')) {
            try {
                setDeleting(id);
                // Check for linked agencias
                const count = await bancosService.contarAgencias(id);
                if (count > 0) {
                    alert(`Não é possível excluir. Existem ${count} agência(s) vinculada(s) a este banco.`);
                    return;
                }
                await bancosService.excluir(id);
                setBancos(bancos.filter((b) => b.id !== id));
            } catch (err) {
                console.error('Erro ao excluir banco:', err);
                alert('Erro ao excluir banco. Tente novamente.');
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
                            <CreditCard className="h-6 w-6" />
                            Rede Bancária
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de bancos para vinculação de agências e contas
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Banco
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Bancos</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${bancos.length} banco(s) cadastrado(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar banco..."
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
                                        <TableHead className="w-24">Código</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="w-24">Sigla</TableHead>
                                        <TableHead>CNPJ</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bancos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum banco encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bancos.map((banco) => (
                                            <TableRow key={banco.id}>
                                                <TableCell className="font-mono">{banco.codigo}</TableCell>
                                                <TableCell className="font-medium">{banco.nome}</TableCell>
                                                <TableCell>{banco.nome_abreviado}</TableCell>
                                                <TableCell className="text-sm font-mono">{banco.cnpj || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(banco.id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(banco.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === banco.id}
                                                        >
                                                            {deleting === banco.id ? (
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
