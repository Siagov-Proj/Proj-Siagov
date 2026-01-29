'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { ArrowLeft, FolderOpen } from 'lucide-react';

const formVazio = {
    nome: '',
    descricao: '',
};

export default function NovaSubcategoriaPage() {
    const router = useRouter();
    const params = useParams();
    const categoriaId = params.id as string;
    const [formData, setFormData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validar()) return;
        console.log('Salvando nova subcategoria para categoria:', categoriaId, formData);
        router.push('/cadastros/categorias-documentos');
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
                        <FolderOpen className="h-6 w-6" />
                        Nova Subcategoria
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de nova subcategoria de documentos
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Subcategoria</CardTitle>
                    <CardDescription>Preencha as informações da subcategoria</CardDescription>
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
                                placeholder="Ex: Pregão Eletrônico"
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
                                placeholder="Descrição da subcategoria"
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
            />
        </div>
    );
}
