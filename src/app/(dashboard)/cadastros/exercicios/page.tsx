'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import {
    Plus,
    Search,
    Pencil,
    Calendar,
    Lock,
    Unlock,
    AlertTriangle,
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

// Estado vazio do formulário
const formDataVazio = {
    ano: ANO_CORRENTE,
    instituicaoId: '',
    dataAbertura: new Date().toISOString().split('T')[0],
    dataFechamento: '',
    ativo: true,
};

export default function ExerciciosFinanceirosPage() {
    const [exercicios, setExercicios] =
        useState<IExercicioFinanceiro[]>(exerciciosIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

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

    const abrirNovo = () => {
        setFormData(formDataVazio);
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (exercicio: IExercicioFinanceiro) => {
        if (!podeEditar(exercicio.ano)) {
            alert(
                `O exercício de ${exercicio.ano} não pode ser editado. Apenas o exercício do ano corrente (${ANO_CORRENTE}) pode ser modificado.`
            );
            return;
        }

        setFormData({
            ano: exercicio.ano,
            instituicaoId: exercicio.instituicaoId,
            dataAbertura: exercicio.dataAbertura
                ? new Date(exercicio.dataAbertura).toISOString().split('T')[0]
                : '',
            dataFechamento: exercicio.dataFechamento
                ? new Date(exercicio.dataFechamento).toISOString().split('T')[0]
                : '',
            ativo: exercicio.ativo,
        });
        setEditandoId(exercicio.id);
        setErros({});
        setDialogAberto(true);
    };

    const limpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.ano || formData.ano < 2000 || formData.ano > 2100) {
            novosErros.ano = 'Ano inválido (entre 2000 e 2100)';
        }

        if (!formData.instituicaoId) {
            novosErros.instituicaoId = 'Instituição é obrigatória';
        }

        if (!formData.dataAbertura) {
            novosErros.dataAbertura = 'Data de abertura é obrigatória';
        }

        // Verifica se já existe exercício para o ano e instituição
        const existente = exercicios.find(
            (e) =>
                e.ano === formData.ano &&
                e.instituicaoId === formData.instituicaoId &&
                e.id !== editandoId
        );

        if (existente) {
            novosErros.ano =
                'Já existe um exercício para este ano e instituição';
        }

        // Não permite criar exercícios para anos anteriores
        if (!editandoId && formData.ano < ANO_CORRENTE) {
            novosErros.ano = `Não é permitido criar exercícios para anos anteriores a ${ANO_CORRENTE}`;
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setExercicios(
                exercicios.map((e) =>
                    e.id === editandoId
                        ? {
                            ...e,
                            ano: formData.ano,
                            instituicaoId: formData.instituicaoId,
                            dataAbertura: new Date(formData.dataAbertura),
                            dataFechamento: formData.dataFechamento
                                ? new Date(formData.dataFechamento)
                                : undefined,
                            ativo: formData.ativo,
                            updatedAt: new Date(),
                        }
                        : e
                )
            );
        } else {
            const novoExercicio: IExercicioFinanceiro = {
                id: String(Date.now()),
                ano: formData.ano,
                instituicaoId: formData.instituicaoId,
                dataAbertura: new Date(formData.dataAbertura),
                dataFechamento: formData.dataFechamento
                    ? new Date(formData.dataFechamento)
                    : undefined,
                ativo: formData.ativo,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setExercicios([...exercicios, novoExercicio]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeInstituicao = (id: string) => {
        return mockInstituicoes.find((i) => i.id === id)?.nome || '-';
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Exercícios Financeiros
                    </h1>
                    <p className="text-muted-foreground">
                        Gerenciamento de exercícios financeiros por instituição
                    </p>
                </div>
                <Button onClick={abrirNovo}>
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
                                {exerciciosFiltrados.length} exercício(s)
                                encontrado(s)
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
                                    <TableHead className="w-32">
                                        Abertura
                                    </TableHead>
                                    <TableHead className="w-32">
                                        Fechamento
                                    </TableHead>
                                    <TableHead className="w-24">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-24 text-center">
                                        Edição
                                    </TableHead>
                                    <TableHead className="w-20 text-center">
                                        Ações
                                    </TableHead>
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
                                                {obterNomeInstituicao(
                                                    exercicio.instituicaoId
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(
                                                    exercicio.dataAbertura
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {exercicio.dataFechamento
                                                    ? formatDate(
                                                        exercicio.dataFechamento
                                                    )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        exercicio.ativo
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {exercicio.ativo
                                                        ? 'Aberto'
                                                        : 'Fechado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {podeEditar(exercicio.ano) ? (
                                                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                                                        <Unlock className="h-4 w-4" />
                                                        <span className="text-xs">
                                                            Liberado
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                                                        <Lock className="h-4 w-4" />
                                                        <span className="text-xs">
                                                            Bloqueado
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            editar(exercicio)
                                                        }
                                                        disabled={
                                                            !podeEditar(
                                                                exercicio.ano
                                                            )
                                                        }
                                                        title={
                                                            podeEditar(
                                                                exercicio.ano
                                                            )
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

            {/* Dialog de Formulário */}
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId
                                ? 'Editar Exercício Financeiro'
                                : 'Novo Exercício Financeiro'}
                        </DialogTitle>
                        <DialogDescription>
                            {editandoId
                                ? 'Altere os dados do exercício financeiro'
                                : 'Cadastre um novo exercício financeiro'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Ano */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="ano">
                                    Ano
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Ano do exercício financeiro (4 dígitos)" />
                            </div>
                            <Input
                                id="ano"
                                type="number"
                                min={2000}
                                max={2100}
                                value={formData.ano}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ano: parseInt(e.target.value) || 0,
                                    })
                                }
                                className={erros.ano ? 'border-red-500' : ''}
                                disabled={!!editandoId}
                            />
                            {erros.ano && (
                                <p className="text-sm text-red-500">
                                    {erros.ano}
                                </p>
                            )}
                        </div>

                        {/* Instituição */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="instituicaoId">
                                    Instituição
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Instituição vinculada ao exercício" />
                            </div>
                            <Select
                                value={formData.instituicaoId}
                                onValueChange={(valor) =>
                                    setFormData({
                                        ...formData,
                                        instituicaoId: valor,
                                    })
                                }
                                disabled={!!editandoId}
                            >
                                <SelectTrigger
                                    className={
                                        erros.instituicaoId
                                            ? 'border-red-500'
                                            : ''
                                    }
                                >
                                    <SelectValue placeholder="Selecione a instituição" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockInstituicoes.map((inst) => (
                                        <SelectItem
                                            key={inst.id}
                                            value={inst.id}
                                        >
                                            {inst.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {erros.instituicaoId && (
                                <p className="text-sm text-red-500">
                                    {erros.instituicaoId}
                                </p>
                            )}
                        </div>

                        {/* Data de Abertura */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="dataAbertura">
                                    Data de Abertura
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Data em que o exercício foi aberto" />
                            </div>
                            <Input
                                id="dataAbertura"
                                type="date"
                                value={formData.dataAbertura}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dataAbertura: e.target.value,
                                    })
                                }
                                className={
                                    erros.dataAbertura ? 'border-red-500' : ''
                                }
                            />
                            {erros.dataAbertura && (
                                <p className="text-sm text-red-500">
                                    {erros.dataAbertura}
                                </p>
                            )}
                        </div>

                        {/* Data de Fechamento */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="dataFechamento">
                                    Data de Fechamento
                                </Label>
                                <FieldTooltip content="Data em que o exercício foi encerrado (opcional)" />
                            </div>
                            <Input
                                id="dataFechamento"
                                type="date"
                                value={formData.dataFechamento}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dataFechamento: e.target.value,
                                    })
                                }
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="status">Status</Label>
                                <FieldTooltip content="Indica se o exercício está aberto ou fechado" />
                            </div>
                            <Select
                                value={formData.ativo ? 'true' : 'false'}
                                onValueChange={(valor) =>
                                    setFormData({
                                        ...formData,
                                        ativo: valor === 'true',
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Aberto</SelectItem>
                                    <SelectItem value="false">
                                        Fechado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <ActionBar
                        onSalvar={salvar}
                        onCancelar={() => setDialogAberto(false)}
                        onLimpar={limpar}
                        mode={editandoId ? 'edit' : 'create'}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
