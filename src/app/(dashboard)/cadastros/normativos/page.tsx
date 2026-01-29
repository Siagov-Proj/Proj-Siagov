'use client';

import { useState } from 'react';
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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

// Tipos
interface INormativo {
    id: string;
    categoria: string;
    unidadeGestora: string;
    qtdSubcategorias: number;
    status: 'Ativo' | 'Inativo';
}

// Dados mock
const mockNormativos: INormativo[] = [
    {
        id: '1',
        categoria: 'Pareceres Técnicos',
        unidadeGestora: 'Secretaria de Planejamento',
        qtdSubcategorias: 5,
        status: 'Ativo',
    },
    {
        id: '2',
        categoria: 'Contratos e Convênios',
        unidadeGestora: 'Secretaria de Administração',
        qtdSubcategorias: 8,
        status: 'Ativo',
    },
    {
        id: '3',
        categoria: 'Legislação Ambiental',
        unidadeGestora: 'Secretaria do Meio Ambiente',
        qtdSubcategorias: 12,
        status: 'Ativo',
    },
    {
        id: '4',
        categoria: 'Processos Licitatórios',
        unidadeGestora: 'Secretaria de Planejamento',
        qtdSubcategorias: 6,
        status: 'Ativo',
    },
    {
        id: '5',
        categoria: 'Relatórios de Gestão',
        unidadeGestora: 'Controladoria Geral',
        qtdSubcategorias: 4,
        status: 'Inativo',
    },
];

export default function NormativosPage() {
    const [termoBusca, setTermoBusca] = useState('');

    const normativosFiltrados = mockNormativos.filter((n) =>
        n.categoria.toLowerCase().includes(termoBusca.toLowerCase()) ||
        n.unidadeGestora.toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Normativos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os normativos e subcategorias dos documentos
                    </p>
                </div>
                <Button asChild className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg">
                    <Link href="/cadastros/normativos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Incluir Categoria
                    </Link>
                </Button>
            </div>

            {/* Filtros e Tabela */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou unidade gestora..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="pl-9 max-w-lg bg-muted/50"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Categoria</TableHead>
                                    <TableHead className="w-[30%]">Unidade Gestora</TableHead>
                                    <TableHead className="w-[20%] text-center">Subcategorias</TableHead>
                                    <TableHead className="w-[10%] text-center">Status</TableHead>
                                    <TableHead className="w-[10%] text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {normativosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhum normativo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    normativosFiltrados.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {item.categoria}
                                            </TableCell>
                                            <TableCell>{item.unidadeGestora}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {item.qtdSubcategorias} subcategorias
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={item.status === 'Ativo' ? 'default' : 'destructive'}
                                                    className={item.status === 'Ativo' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
                </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
                Exibindo {normativosFiltrados.length} categoria(s)
            </div>
        </div>
    );
}
