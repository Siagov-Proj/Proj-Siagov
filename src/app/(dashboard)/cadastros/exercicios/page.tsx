'use client';

import { useState } from 'react';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Pencil,
    Calendar,
    Lock,
    Unlock,
    AlertTriangle,
    ArrowLeft,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import type { IExercicioFinanceiro } from '@/types';

// Ano corrente
const ANO_CORRENTE = new Date().getFullYear();

// Mock de instituições
const mockInstituicoes = [
    { id: '1', nome: 'Prefeitura Municipal de São Paulo' },
    { id: '2', nome: 'Governo do Estado de São Paulo' },
];

// Dados iniciais mock
const exerciciosIniciais: IExercicioFinanceiro[] = [
    {
        id: '1',
        ano: 2024,
        instituicaoId: '1',
        dataAbertura: new Date('2024-01-02'),
        dataFechamento: undefined,
        ativo: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
    {
        id: '2',
        ano: 2023,
        instituicaoId: '1',
        dataAbertura: new Date('2023-01-02'),
        dataFechamento: new Date('2023-12-31'),
        ativo: false,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-12-31'),
    },
    {
        id: '3',
        ano: 2022,
        instituicaoId: '1',
        dataAbertura: new Date('2022-01-03'),
        dataFechamento: new Date('2022-12-30'),
        ativo: false,
        createdAt: new Date('2022-01-03'),
        updatedAt: new Date('2022-12-30'),
    },
];

export default function ExerciciosFinanceirosPage() {
    const router = useRouter();
    const [exercicios, setExercicios] = useState<IExercicioFinanceiro[]>(exerciciosIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const exerciciosFiltrados = exercicios.filter(
        (ex) =>
            String(ex.ano).includes(termoBusca) ||
            mockInstituicoes
                .find((i) => i.id === ex.instituicaoId)
                ?.nome.toLowerCase()
                .includes(termoBusca.toLowerCase())
    );

    // Verifica se o exercício pode ser editado (apenas ano corrente)
    const podeEditar = (ano: number): boolean => {
        return ano >= ANO_CORRENTE;
    };

    const handleNovo = () => {
        router.push('/cadastros/exercicios/novo');
    };

    const handleEdit = (exercicio: IExercicioFinanceiro) => {
        if (!podeEditar(exercicio.ano)) {
            alert(
                `O exercício de ${exercicio.ano} não pode ser editado. Apenas o exercício do ano corrente (${ANO_CORRENTE}) pode ser modificado.`
            );
            return;
        }
        router.push(`/cadastros/exercicios/${exercicio.id}`);
    };

    const obterNomeInstituicao = (id: string) => {
        return mockInstituicoes.find((i) => i.id === id)?.nome || '-';
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
                            <Calendar className="h-6 w-6" />
                            Exercícios Financeiros
                        </h1>
                        <p className="text-muted-foreground">
                            Gerenciamento de exercícios financeiros por instituição
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Exercício
                </Button>
            </div>

            {/* Alerta de Regra */}
            <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Regra de negócio:</strong> Apenas o exercício do ano
                    corrente ({ANO_CORRENTE}) pode ser editado. Anos anteriores
                    ficam bloqueados para alteração.
                </p>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Exercícios</CardTitle>
                            <CardDescription>
                                {exerciciosFiltrados.length} exercício(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por ano..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Ano</TableHead>
                                    <TableHead>Instituição</TableHead>
                                    <TableHead className="w-32">Abertura</TableHead>
                                    <TableHead className="w-32">Fechamento</TableHead>
                                    <TableHead className="w-24">Status</TableHead>
                                    <TableHead className="w-24 text-center">Edição</TableHead>
                                    <TableHead className="w-20 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exerciciosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhum exercício encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exerciciosFiltrados.map((exercicio) => (
                                        <TableRow key={exercicio.id}>
                                            <TableCell className="font-bold text-lg">
                                                {exercicio.ano}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {obterNomeInstituicao(exercicio.instituicaoId)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(exercicio.dataAbertura)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {exercicio.dataFechamento
                                                    ? formatDate(exercicio.dataFechamento)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={exercicio.ativo ? 'default' : 'secondary'}
                                                >
                                                    {exercicio.ativo ? 'Aberto' : 'Fechado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {podeEditar(exercicio.ano) ? (
                                                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                                                        <Unlock className="h-4 w-4" />
                                                        <span className="text-xs">Liberado</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                                                        <Lock className="h-4 w-4" />
                                                        <span className="text-xs">Bloqueado</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(exercicio)}
                                                        disabled={!podeEditar(exercicio.ano)}
                                                        title={
                                                            podeEditar(exercicio.ano)
                                                                ? 'Editar exercício'
                                                                : `Exercício de ${exercicio.ano} bloqueado para edição`
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
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
        </div>
    );
}
