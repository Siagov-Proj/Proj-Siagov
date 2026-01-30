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
import { ArrowLeft, FolderOpen, Loader2 } from 'lucide-react';
import { categoriasDocService } from '@/services/api';

const LEIS = [
    'Lei 14.133/2021',
    'Lei 8.666/93',
    'Lei 13.019/14',
    'Lei 10.520/02',
];

const formVazio = {
    nome: '',
    descricao: '',
    lei: '',
};

export default function EditarCategoriaPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formVazio);
    const [originalData, setOriginalData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const carregarCategoria = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;
            const categoria = await categoriasDocService.buscarCategoriaPorId(id);

            if (categoria) {
                const data = {
                    nome: categoria.nome,
                    descricao: categoria.descricao || '',
                    lei: categoria.lei || '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                alert('Categoria não encontrada');
                router.push('/cadastros/categorias-documentos');
            }
        } catch (err) {
            console.error('Erro ao carregar categoria:', err);
            alert('Erro ao carregar categoria. Tente novamente.');
            router.push('/cadastros/categorias-documentos');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarCategoria();
    }, [carregarCategoria]);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.lei) novosErros.lei = 'Lei vinculada é obrigatória';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            await categoriasDocService.atualizarCategoria(params.id as string, {
                nome: formData.nome,
                descricao: formData.descricao,
                lei: formData.lei,
            });
            router.push('/cadastros/categorias-documentos');
        } catch (err) {
            console.error('Erro ao atualizar categoria:', err);
            alert('Erro ao atualizar categoria. Tente novamente.');
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
                        <FolderOpen className="h-6 w-6" />
                        Editar Categoria
                    </h1>
                    <p className="text-muted-foreground">
                        Altere os dados da categoria de documentos
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Categoria</CardTitle>
                    <CardDescription>Preencha as informações da categoria de documentos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Ex: Licitações"
                                className={erros.nome ? 'border-red-500' : ''}
                            />
                            {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Descrição da categoria"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Lei Vinculada<span className="text-red-500 ml-1">*</span></Label>
                            <Select
                                value={formData.lei}
                                onValueChange={(valor) => setFormData({ ...formData, lei: valor })}
                            >
                                <SelectTrigger className={erros.lei ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione a lei" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEIS.map((lei) => (
                                        <SelectItem key={lei} value={lei}>
                                            {lei}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {erros.lei && <p className="text-sm text-red-500">{erros.lei}</p>}
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

