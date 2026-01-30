'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { ArrowLeft, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { exerciciosService, instituicoesService, IInstituicaoDB } from '@/services/api';

// Ano corrente
const ANO_CORRENTE = new Date().getFullYear();

const formDataVazio = {
    ano: ANO_CORRENTE,
    instituicaoId: '',
    dataAbertura: '',
    dataFechamento: '',
    ativo: true,
};

export default function EditarExercicioPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formDataVazio);
    const [originalData, setOriginalData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [bloqueado, setBloqueado] = useState(false);
    const [saving, setSaving] = useState(false);
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            const [exercicio, listaInstituicoes] = await Promise.all([
                exerciciosService.buscarPorId(id),
                instituicoesService.listar()
            ]);

            setInstituicoes(listaInstituicoes);

            if (exercicio) {
                const data = {
                    ano: exercicio.ano,
                    instituicaoId: exercicio.instituicao_id || '',
                    dataAbertura: exercicio.data_abertura
                        ? new Date(exercicio.data_abertura).toISOString().split('T')[0]
                        : '',
                    dataFechamento: exercicio.data_fechamento
                        ? new Date(exercicio.data_fechamento).toISOString().split('T')[0]
                        : '',
                    ativo: exercicio.ativo,
                };
                setFormData(data);
                setOriginalData(data);
                setBloqueado(exercicio.ano < ANO_CORRENTE);
            } else {
                alert('Exercício não encontrado');
                router.push('/cadastros/exercicios');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar dados do exercício. Tente novamente.');
            router.push('/cadastros/exercicios');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

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

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            await exerciciosService.atualizar(params.id as string, {
                ano: formData.ano,
                instituicao_id: formData.instituicaoId,
                data_abertura: formData.dataAbertura,
                data_fechamento: formData.dataFechamento || undefined,
                ativo: formData.ativo,
            });
            router.push('/cadastros/exercicios');
        } catch (error) {
            console.error('Erro ao atualizar exercício:', error);
            alert('Erro ao atualizar exercício. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setErros({});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Editar Exercício Financeiro
                    </h1>
                    <p className="text-muted-foreground">
                        Altere os dados do exercício financeiro
                    </p>
                </div>
            </div>

            {bloqueado && (
                <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Atenção:</strong> Este exercício é de um ano anterior ({formData.ano}) e está parcialmente bloqueado para edição.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Exercício</CardTitle>
                    <CardDescription>Preencha as informações do exercício financeiro</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ano">
                                        Ano<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Ano do exercício financeiro (4 dígitos)" />
                                </div>
                                <Input
                                    id="ano"
                                    type="number"
                                    min={2000}
                                    max={2100}
                                    value={formData.ano}
                                    onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 0 })}
                                    className={erros.ano ? 'border-red-500' : ''}
                                    disabled={true}
                                />
                                {erros.ano && <p className="text-sm text-red-500">{erros.ano}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="instituicaoId">
                                        Instituição<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Instituição vinculada ao exercício" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, instituicaoId: valor })}
                                    disabled={true}
                                >
                                    <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a instituição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.codigo} - {inst.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.instituicaoId && <p className="text-sm text-red-500">{erros.instituicaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="dataAbertura">
                                        Data de Abertura<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Data em que o exercício foi aberto" />
                                </div>
                                <Input
                                    id="dataAbertura"
                                    type="date"
                                    value={formData.dataAbertura}
                                    onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                                    className={erros.dataAbertura ? 'border-red-500' : ''}
                                    disabled={bloqueado}
                                />
                                {erros.dataAbertura && <p className="text-sm text-red-500">{erros.dataAbertura}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="dataFechamento">Data de Fechamento</Label>
                                    <FieldTooltip content="Data em que o exercício foi encerrado (opcional)" />
                                </div>
                                <Input
                                    id="dataFechamento"
                                    type="date"
                                    value={formData.dataFechamento}
                                    onChange={(e) => setFormData({ ...formData, dataFechamento: e.target.value })}
                                    disabled={bloqueado}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="status">Status</Label>
                                    <FieldTooltip content="Indica se o exercício está aberto ou fechado" />
                                </div>
                                <Select
                                    value={formData.ativo ? 'true' : 'false'}
                                    onValueChange={(valor) => setFormData({ ...formData, ativo: valor === 'true' })}
                                    disabled={bloqueado}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Aberto</SelectItem>
                                        <SelectItem value="false">Fechado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="edit"
                isLoading={saving}
            />
        </div>
    );
}
