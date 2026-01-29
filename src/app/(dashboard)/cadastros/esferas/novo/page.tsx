'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { ArrowLeft, Globe } from 'lucide-react';
import { esferasService } from '@/services/api';

const formVazio = {
    nome: '',
    sigla: '',
    descricao: '',
};

export default function NovaEsferaPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.sigla.trim()) novosErros.sigla = 'Sigla é obrigatória';
        if (formData.sigla.length > 3) novosErros.sigla = 'Sigla deve ter no máximo 3 caracteres';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            await esferasService.criar({
                nome: formData.nome,
                sigla: formData.sigla,
                descricao: formData.descricao,
                ativo: true,
            });
            router.push('/cadastros/esferas');
        } catch (err) {
            console.error('Erro ao salvar esfera:', err);
            alert('Erro ao salvar esfera. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(formVazio);
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
                        <Globe className="h-6 w-6" />
                        Nova Esfera
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de nova esfera de governo
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Esfera</CardTitle>
                    <CardDescription>Preencha as informações da esfera de governo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-2 sm:col-span-3">
                                <Label htmlFor="nome">
                                    Nome<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Federal"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sigla">
                                    Sigla<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="sigla"
                                    value={formData.sigla}
                                    onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                                    maxLength={3}
                                    placeholder="FED"
                                    className={erros.sigla ? 'border-red-500' : ''}
                                />
                                {erros.sigla && <p className="text-sm text-red-500">{erros.sigla}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Descrição da esfera..."
                                rows={3}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
                isLoading={saving}
            />
        </div>
    );
}
