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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Search, Pencil, Trash2, UserCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { cargosService, ICargoDB, permissoesService, IPermissaoDB } from '@/services/api';

export default function CargosPage() {
    const router = useRouter();
    const [cargos, setCargos] = useState<ICargoDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [permissoesPorCargo, setPermissoesPorCargo] = useState<Record<string, IPermissaoDB[]>>({});

    const carregarCargos = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await cargosService.listar(termoBusca);
            setCargos(dados);

            // Batch-fetch permissões para todos os cargos
            if (dados.length > 0) {
                const ids = dados.map((c) => c.id);
                const perms = await permissoesService.listarPermissoesPorCargos(ids);
                setPermissoesPorCargo(perms);
            } else {
                setPermissoesPorCargo({});
            }
        } catch (err) {
            console.error('Erro ao carregar cargos:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarCargos();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarCargos]);

    const handleNovo = () => {
        router.push('/cadastros/cargos/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/cargos/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            try {
                setDeleting(id);
                await cargosService.excluir(id);
                setCargos(cargos.filter((c) => c.id !== id));
            } catch (err) {
                console.error('Erro ao excluir cargo:', err);
                alert('Erro ao excluir cargo. Tente novamente.');
            } finally {
                setDeleting(null);
            }
        }
    };

    // Agrupa permissões por módulo para exibição
    const agruparPermissoes = (permissoes: IPermissaoDB[]): Record<string, IPermissaoDB[]> => {
        const grupos: Record<string, IPermissaoDB[]> = {};
        permissoes.forEach((p) => {
            const modulo = p.modulo || 'Outros';
            if (!grupos[modulo]) grupos[modulo] = [];
            grupos[modulo].push(p);
        });
        return grupos;
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
                            <UserCheck className="h-6 w-6" />
                            Cargos
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de cargos administrativos vinculados aos setores
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cargo
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Cargos</CardTitle>
                            <CardDescription>
                                {loading ? 'Carregando...' : `${cargos.length} cargo(s) encontrado(s)`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cargo..."
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
                                        <TableHead>Nível</TableHead>
                                        <TableHead>Permissões</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cargos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum cargo encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TooltipProvider delayDuration={200}>
                                            {cargos.map((cargo) => {
                                                const permissoes = permissoesPorCargo[cargo.id] || [];
                                                const grupos = agruparPermissoes(permissoes);

                                                return (
                                                    <TableRow key={cargo.id}>
                                                        <TableCell className="font-mono">{cargo.codigo}</TableCell>
                                                        <TableCell className="font-medium">{cargo.nome}</TableCell>
                                                        <TableCell className="text-sm">{cargo.nivel || '-'}</TableCell>
                                                        <TableCell>
                                                            {permissoes.length === 0 ? (
                                                                <span className="text-xs text-muted-foreground italic">Nenhuma</span>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {Object.entries(grupos).map(([modulo, perms]) => (
                                                                        <Tooltip key={modulo}>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 cursor-default">
                                                                                    {modulo}
                                                                                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full px-1.5 text-[10px] font-bold">
                                                                                        {perms.length}
                                                                                    </span>
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="bottom" className="max-w-xs">
                                                                                <p className="font-semibold text-xs mb-1">{modulo}</p>
                                                                                <ul className="text-xs space-y-0.5">
                                                                                    {perms.map((p) => (
                                                                                        <li key={p.id}>• {p.descricao || p.acao}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(cargo.id)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(cargo.id)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                    disabled={deleting === cargo.id}
                                                                >
                                                                    {deleting === cargo.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TooltipProvider>
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
