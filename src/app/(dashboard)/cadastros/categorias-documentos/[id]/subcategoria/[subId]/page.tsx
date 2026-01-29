'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { ArrowLeft, FolderOpen } from 'lucide-react';

// Mock data for subcategories
interface ISubcategoria {
    id: string;
    nome: string;
    descricao: string;
    categoriaId: string;
}

const subcategoriasMock: ISubcategoria[] = [
    { id: 's1', nome: 'Pregão Eletrônico', descricao: 'Modalidade de licitação por pregão eletrônico', categoriaId: '1' },
    { id: 's2', nome: 'Dispensa de Licitação', descricao: 'Contratações com dispensa de licitação', categoriaId: '1' },
    { id: 's3', nome: 'Inexigibilidade', descricao: 'Contratações por inexigibilidade', categoriaId: '1' },
    { id: 's4', nome: 'Contratação Direta', descricao: 'Contratações diretas diversas', categoriaId: '1' },
    { id: 's5', nome: 'Minutas', descricao: 'Minutas de contratos', categoriaId: '2' },
    { id: 's6', nome: 'Atas de Registro', descricao: 'Atas de registro de preços', categoriaId: '2' },
    { id: 's7', nome: 'Aditivos', descricao: 'Termos aditivos de contratos', categoriaId: '2' },
    { id: 's8', nome: 'Relatórios', descricao: 'Relatórios de RH', categoriaId: '3' },
    { id: 's9', nome: 'Portarias', descricao: 'Portarias e atos de pessoal', categoriaId: '3' },
];

const formVazio = {
    nome: '',
    descricao: '',
};

export default function EditarSubcategoriaPage() {
    const router = useRouter();
    const params = useParams();
    const categoriaId = params.id as string;
    const subcategoriaId = params.subId as string;
    const [formData, setFormData] = useState(formVazio);
    const [originalData, setOriginalData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const found = subcategoriasMock.find((s) => s.id === subcategoriaId && s.categoriaId === categoriaId);

        if (found) {
            const data = {
                nome: found.nome,
                descricao: found.descricao,
            };
            setFormData(data);
            setOriginalData(data);
        }
        setLoading(false);
    }, [categoriaId, subcategoriaId]);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validar()) return;
        console.log('Atualizando subcategoria:', subcategoriaId, formData);
        router.push('/cadastros/categorias-documentos');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setErros({});
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FolderOpen className="h-6 w-6" />
                        Editar Subcategoria
                    </h1>
                    <p className="text-muted-foreground">
                        Altere os dados da subcategoria
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
                mode="edit"
            />
        </div>
    );
}
