'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import {
    FileText,
    ArrowLeft,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { formatDateBR } from '@/utils/formatters';
import type { IProcesso } from '@/types';

// Mock do processo
const processoMock: IProcesso = {
    id: '1',
    numero: '2024/000001',
    ano: 2024,
    assunto: 'Aquisição de materiais de escritório para suprir as necessidades da Secretaria de Administração',
    tipo: 'Licitação',
    interessado: 'Secretaria de Administração',
    interessadoId: '1',
    status: 'Em Andamento',
    prioridade: 'Normal',
    setorAtual: 'Setor de Compras',
    setorAtualId: '1',
    dataAbertura: new Date('2024-01-15'),
    dataPrazo: new Date('2024-02-15'),
    observacoes: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
};

// Mock de setores de destino
const mockSetores = [
    { id: '1', nome: 'Setor de Compras' },
    { id: '2', nome: 'Setor Jurídico' },
    { id: '3', nome: 'Setor Financeiro' },
    { id: '4', nome: 'Gabinete' },
    { id: '5', nome: 'Protocolo Geral' },
    { id: '6', nome: 'Arquivo' },
];

const ACOES_TRAMITACAO = [
    { value: 'encaminhar', label: 'Encaminhar para outro setor' },
    { value: 'devolver', label: 'Devolver ao setor anterior' },
    { value: 'concluir', label: 'Concluir processo' },
    { value: 'arquivar', label: 'Arquivar processo' },
];

const formDataVazio = {
    acao: '',
    setorDestinoId: '',
    despacho: '',
    prioridadeAtualizada: '',
};

export default function TramitarProcessoPage() {
    const router = useRouter();
    const params = useParams();
    const [processo] = useState(processoMock);
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    const limpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.acao) novosErros.acao = 'Selecione uma ação';
        if (!formData.despacho) novosErros.despacho = 'Despacho é obrigatório';

        if (formData.acao === 'encaminhar' && !formData.setorDestinoId) {
            novosErros.setorDestinoId = 'Selecione o setor de destino';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = async () => {
        if (!validar()) return;

        setSalvando(true);

        // Simula salvamento
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redireciona para detalhes do processo
        router.push(`/processos/${params.id}`);
    };

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Em Andamento':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Aguardando':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const mostrarSeletorSetor = formData.acao === 'encaminhar';
    const mostrarPrioridade = formData.acao === 'encaminhar' || formData.acao === 'devolver';

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/processos/${params.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ArrowRight className="h-6 w-6" />
                        Tramitar Processo
                    </h1>
                    <p className="text-muted-foreground">
                        Registre o despacho e encaminhe o processo
                    </p>
                </div>
            </div>

            {/* Card do Processo */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base font-mono">{processo.numero}</CardTitle>
                            <Badge className={obterCorStatus(processo.status)}>{processo.status}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Aberto em {formatDateBR(processo.dataAbertura)}
                        </span>
                    </div>
                    <CardDescription className="mt-2">{processo.assunto}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Interessado</p>
                            <p className="font-medium">{processo.interessado}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Setor Atual</p>
                            <p className="font-medium">{processo.setorAtual}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Tipo</p>
                            <p className="font-medium">{processo.tipo}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulário de Tramitação */}
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Tramitação</CardTitle>
                    <CardDescription>
                        Preencha os campos para registrar a movimentação do processo
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Ação */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label>
                                Ação<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <FieldTooltip content="Selecione o tipo de movimentação" />
                        </div>
                        <Select
                            value={formData.acao}
                            onValueChange={(valor) => setFormData({ ...formData, acao: valor, setorDestinoId: '' })}
                        >
                            <SelectTrigger className={erros.acao ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecione a ação" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACOES_TRAMITACAO.map((acao) => (
                                    <SelectItem key={acao.value} value={acao.value}>{acao.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {erros.acao && <p className="text-sm text-red-500">{erros.acao}</p>}
                    </div>

                    {/* Setor de Destino (condicional) */}
                    {mostrarSeletorSetor && (
                        <div className="space-y-2">
                            <Label>
                                Setor de Destino<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Select
                                value={formData.setorDestinoId}
                                onValueChange={(valor) => setFormData({ ...formData, setorDestinoId: valor })}
                            >
                                <SelectTrigger className={erros.setorDestinoId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione o setor de destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockSetores
                                        .filter((s) => s.id !== processo.setorAtualId)
                                        .map((setor) => (
                                            <SelectItem key={setor.id} value={setor.id}>{setor.nome}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {erros.setorDestinoId && <p className="text-sm text-red-500">{erros.setorDestinoId}</p>}
                        </div>
                    )}

                    {/* Prioridade (condicional) */}
                    {mostrarPrioridade && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label>Atualizar Prioridade</Label>
                                <FieldTooltip content="Deixe em branco para manter a prioridade atual" />
                            </div>
                            <Select
                                value={formData.prioridadeAtualizada}
                                onValueChange={(valor) => setFormData({ ...formData, prioridadeAtualizada: valor })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Manter prioridade atual" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alta">Alta - Urgente</SelectItem>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Baixa">Baixa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Despacho - Editor Rich Text */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="despacho">
                                Despacho<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <FieldTooltip content="Texto do despacho que ficará registrado no histórico. Use a barra de ferramentas para formatar." />
                        </div>
                        <RichTextEditor
                            content={formData.despacho}
                            onChange={(content) => setFormData({ ...formData, despacho: content })}
                            placeholder="Digite o texto do despacho..."
                            className={erros.despacho ? 'border-red-500' : ''}
                        />
                        {erros.despacho && <p className="text-sm text-red-500">{erros.despacho}</p>}
                    </div>

                    {/* Alerta para ações finais */}
                    {(formData.acao === 'concluir' || formData.acao === 'arquivar') && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Atenção
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    {formData.acao === 'concluir'
                                        ? 'Ao concluir o processo, ele será marcado como finalizado e não poderá mais ser tramitado.'
                                        : 'Ao arquivar o processo, ele será movido para o arquivo e não poderá mais ser tramitado.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ActionBar */}
                    <ActionBar
                        onSalvar={salvar}
                        onCancelar={() => router.push(`/processos/${params.id}`)}
                        onLimpar={limpar}
                        mode="create"
                        loading={salvando}
                        salvarLabel={
                            formData.acao === 'concluir' ? 'Concluir Processo' :
                                formData.acao === 'arquivar' ? 'Arquivar Processo' :
                                    'Tramitar'
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}
