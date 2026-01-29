'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { esferasService, IEsferaDB } from '@/services/api';

const formVazio = {
    nome: '',
    sigla: '',
    descricao: '',
};

export default function EditarEsferaPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formVazio);
    const [originalData, setOriginalData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [esferaAtual, setEsferaAtual] = useState<IEsferaDB | null>(null);

    const carregarEsfera = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;
            const esfera = await esferasService.buscarPorId(id);

            if (esfera) {
                const data = {
                    nome: esfera.nome,
                    sigla: esfera.sigla,
                    descricao: esfera.descricao || '',
                };
                setFormData(data);
                setOriginalData(data);
                setEsferaAtual(esfera);
            } else {
                alert('Esfera não encontrada');
                router.push('/cadastros/esferas');
            }
        } catch (err) {
            console.error('Erro ao carregar esfera:', err);
            alert('Erro ao carregar esfera. Tente novamente.');
            router.push('/cadastros/esferas');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarEsfera();
    }, [carregarEsfera]);

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
            await esferasService.atualizar(params.id as string, {
                nome: formData.nome,
                sigla: formData.sigla,
                descricao: formData.descricao,
            });
            router.push('/cadastros/esferas');
        } catch (err) {
            console.error('Erro ao atualizar esfera:', err);
            alert('Erro ao atualizar esfera. Tente novamente.');
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
                        <Globe className="h-6 w-6" />
                        Editar Esfera
                    </h1>
                    <p className="text-muted-foreground">
                        Altere os dados da esfera de governo
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
                mode="edit"
                isLoading={saving}
            />
        </div>
    );
}
