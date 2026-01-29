'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Search, Pencil, Trash2, Wallet, Loader2, ArrowLeft, User, Building2 } from 'lucide-react';
import type { ICredor } from '@/types';
import { credoresService } from '@/services/api/credoresService';

export default function CredoresPage() {
    const router = useRouter();
    const [credores, setCredores] = useState<ICredor[]>([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');

    const carregarCredores = async () => {
        setLoading(true);
        try {
            const dados = await credoresService.listar(termoBusca);
            setCredores(dados || []);
        } catch (error) {
            console.error('Erro ao carregar credores:', error);
            alert('Erro ao carregar lista de credores. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            carregarCredores();
        }, 500);
        return () => clearTimeout(timer);
    }, [termoBusca]);

    const handleNovo = () => {
        router.push('/cadastros/credores/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/credores/${id}`);
    };

    const excluir = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este credor?')) return;

        try {
            await credoresService.excluir(id);
            setCredores(credores.filter((c) => c.id !== id));
            alert('Credor excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir credor.');
        }
    };

    // Contadores
    const totalCredores = credores.length;
    const pessoasFisicas = credores.filter((c) => c.tipoCredor === 'Física').length;
    const pessoasJuridicas = credores.filter((c) => c.tipoCredor === 'Jurídica').length;

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
                            <Wallet className="h-6 w-6" />
                            Credores
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro completo de credores integrado com Supabase
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Credor
                </Button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Credores</p>
                                <p className="text-2xl font-bold">{totalCredores}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pessoas Físicas</p>
                                <p className="text-2xl font-bold">{pessoasFisicas}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pessoas Jurídicas</p>
                                <p className="text-2xl font-bold">{pessoasJuridicas}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Credores</CardTitle>
                            <CardDescription>
                                {totalCredores} credor(es) cadastrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, CPF/CNPJ..."
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
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Carregando...</span>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Tipo</TableHead>
                                        <TableHead className="w-40">CPF/CNPJ</TableHead>
                                        <TableHead>Nome/Razão Social</TableHead>
                                        <TableHead>Nome Fantasia</TableHead>
                                        <TableHead className="w-48">Contato</TableHead>
                                        <TableHead className="w-24">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {credores.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                Nenhum credor encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        credores.map((credor) => (
                                            <TableRow key={credor.id}>
                                                <TableCell>
                                                    <Badge
                                                        variant={credor.tipoCredor === 'Física' ? 'default' : 'secondary'}
                                                    >
                                                        {credor.tipoCredor === 'Física' ? 'PF' : 'PJ'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {credor.identificador}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {credor.nome}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {credor.nomeFantasia || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex flex-col">
                                                        {credor.email && (
                                                            <span className="truncate max-w-[180px]">{credor.email}</span>
                                                        )}
                                                        {credor.telefoneComercial && (
                                                            <span className="text-muted-foreground">
                                                                {credor.telefoneComercial}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(credor.id)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => excluir(credor.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
