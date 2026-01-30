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
import { Plus, Search, Pencil, Trash2, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { instituicoesService, IInstituicaoDB } from '@/services/api';

export default function InstituicoesPage() {
    const router = useRouter();
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const carregarInstituicoes = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await instituicoesService.listar(searchTerm);
            setInstituicoes(dados);
        } catch (err) {
            console.error('Erro ao carregar instituições:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarInstituicoes();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarInstituicoes]);

    const handleNovo = () => {
        router.push('/cadastros/instituicoes/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/instituicoes/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta instituição?')) {
            try {
                setDeleting(id);
                // Check for linked orgaos
                const count = await instituicoesService.contarOrgaos(id);
                if (count > 0) {
                    alert(`Não é possível excluir. Existem ${count} órgão(s) vinculado(s) a esta instituição.`);
                    return;
                }
                await instituicoesService.excluir(id);
                setInstituicoes(instituicoes.filter((i) => i.id !== id));
            } catch (err) {
                console.error('Erro ao excluir instituição:', err);
                alert('Erro ao excluir instituição. Tente novamente.');
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
                            <Building2 className="h-6 w-6" />
                            Instituições
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de instituições governamentais
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Instituição
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Instituições</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${instituicoes.length} instituição(ões) encontrada(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar instituição..."
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
                                        <TableHead className="w-20">Código</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="w-24">Sigla</TableHead>
                                        <TableHead>Esfera</TableHead>
                                        <TableHead>CNPJ</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {instituicoes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Nenhuma instituição encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        instituicoes.map((inst) => (
                                            <TableRow key={inst.id}>
                                                <TableCell className="font-mono">{inst.codigo}</TableCell>
                                                <TableCell className="font-medium">{inst.nome}</TableCell>
                                                <TableCell>{inst.nome_abreviado}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{inst.esfera?.nome || '-'}</Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{inst.cnpj || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(inst.id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(inst.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                            disabled={deleting === inst.id}
                                                        >
                                                            {deleting === inst.id ? (
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
