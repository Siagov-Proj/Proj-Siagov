'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Calendar } from 'lucide-react';

// Ano corrente
const ANO_CORRENTE = new Date().getFullYear();

// Mock de instituições
const mockInstituicoes = [
    { id: '1', nome: 'Prefeitura Municipal de São Paulo' },
    { id: '2', nome: 'Governo do Estado de São Paulo' },
];

const formDataVazio = {
    ano: ANO_CORRENTE,
    instituicaoId: '',
    dataAbertura: new Date().toISOString().split('T')[0],
    dataFechamento: '',
    ativo: true,
};

export default function NovoExercicioPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

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

        // Não permite criar exercícios para anos anteriores
        if (formData.ano < ANO_CORRENTE) {
            novosErros.ano = `Não é permitido criar exercícios para anos anteriores a ${ANO_CORRENTE}`;
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validar()) return;
        console.log('Salvando novo exercício:', formData);
        router.push('/cadastros/exercicios');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Novo Exercício Financeiro
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de novo exercício financeiro
                    </p>
                </div>
            </div>

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
                                >
                                    <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a instituição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.nome}
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
                mode="create"
            />
        </div>
    );
}
