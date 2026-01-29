'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Search,
    Globe,
    Building2,
    Loader2,
} from 'lucide-react';
import { esferasService, IEsferaDB } from '@/services/api';

// Interface estendida para UI
interface IEsferaUI extends IEsferaDB {
    instituicoesVinculadas: number;
}

export default function EsferasPage() {
    const router = useRouter();
    const [esferas, setEsferas] = useState<IEsferaUI[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar esferas
    const carregarEsferas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await esferasService.listar(termoBusca || undefined);

            // Carregar contagem de instituições para cada esfera
            const esferasComContagem = await Promise.all(
                data.map(async (esf) => {
                    const count = await esferasService.contarInstituicoes(esf.id);
                    return { ...esf, instituicoesVinculadas: count };
                })
            );

            setEsferas(esferasComContagem);
        } catch (err) {
            console.error('Erro ao carregar esferas:', err);
            setError('Erro ao carregar esferas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        carregarEsferas();
    }, [carregarEsferas]);

    const handleNovo = () => {
        router.push('/cadastros/esferas/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/esferas/${id}`);
    };

    const excluir = async (id: string) => {
        const esfera = esferas.find((e) => e.id === id);
        if (esfera && esfera.instituicoesVinculadas > 0) {
            alert('Não é possível excluir uma esfera com instituições vinculadas.');
            return;
        }

        if (!confirm('Tem certeza que deseja excluir esta esfera?')) {
            return;
        }

        try {
            await esferasService.excluir(id);
            // Recarregar lista após exclusão
            carregarEsferas();
        } catch (err) {
            console.error('Erro ao excluir esfera:', err);
            alert('Erro ao excluir esfera. Tente novamente.');
        }
    };

    const obterCorEsfera = (sigla: string) => {
        switch (sigla) {
            case 'FED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'EST':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'MUN':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'DIS':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Globe className="h-6 w-6" />
                            Esferas de Governo
                        </h1>
                        <p className="text-muted-foreground">
                            Gerenciamento das esferas governamentais
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Esfera
                </Button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {esferas.map((esf) => (
                    <Card key={esf.id}>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${obterCorEsfera(esf.sigla)}`}>
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{esf.nome}</p>
                                    <p className="text-2xl font-bold">{esf.instituicoesVinculadas}</p>
                                    <p className="text-xs text-muted-foreground">instituições</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Busca */}
            <Card>
                <CardContent className="pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar esferas..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4">
                        <p className="text-destructive">{error}</p>
                        <Button variant="outline" onClick={carregarEsferas} className="mt-2">
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Esferas Cadastradas</CardTitle>
                    <CardDescription>
                        {loading ? 'Carregando...' : `${esferas.length} esfera(s) encontrada(s)`}
                    </CardDescription>
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
                                        <TableHead className="w-20">Sigla</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="w-32 text-center">Instituições</TableHead>
                                        <TableHead className="w-24">Status</TableHead>
                                        <TableHead className="w-24">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {esferas.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-muted-foreground"
                                            >
                                                Nenhuma esfera encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        esferas.map((esf) => (
                                            <TableRow key={esf.id}>
                                                <TableCell>
                                                    <Badge className={obterCorEsfera(esf.sigla)}>
                                                        {esf.sigla}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{esf.nome}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                    {esf.descricao}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span>{esf.instituicoesVinculadas}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={esf.ativo ? 'default' : 'secondary'}>
                                                        {esf.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(esf.id)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => excluir(esf.id)}
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
