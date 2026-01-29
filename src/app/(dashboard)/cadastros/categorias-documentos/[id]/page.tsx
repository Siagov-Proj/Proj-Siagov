'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, FolderOpen } from 'lucide-react';

const LEIS = [
    'Lei 14.133/2021',
    'Lei 8.666/93',
    'Lei 13.019/14',
    'Lei 10.520/02',
];

// Mock data
interface ICategoria {
    id: string;
    nome: string;
    descricao: string;
    lei: string;
    cor: string;
    ativo: boolean;
}

const categoriasMock: ICategoria[] = [
    {
        id: '1',
        nome: 'Licitações',
        descricao: 'Documentos relacionados a processos licitatórios',
        lei: 'Lei 14.133/2021',
        cor: '#3b82f6',
        ativo: true,
    },
    {
        id: '2',
        nome: 'Contratos',
        descricao: 'Documentos contratuais e aditivos',
        lei: 'Lei 8.666/93',
        cor: '#10b981',
        ativo: true,
    },
    {
        id: '3',
        nome: 'Recursos Humanos',
        descricao: 'Documentos de pessoal e RH',
        lei: 'Lei 13.019/14',
        cor: '#f59e0b',
        ativo: true,
    },
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

    useEffect(() => {
        const id = params.id as string;
        const found = categoriasMock.find((c) => c.id === id);

        if (found) {
            const data = {
                nome: found.nome,
                descricao: found.descricao,
                lei: found.lei,
            };
            setFormData(data);
            setOriginalData(data);
        }
        setLoading(false);
    }, [params.id]);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.lei) novosErros.lei = 'Lei vinculada é obrigatória';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validar()) return;
        console.log('Atualizando categoria:', params.id, formData);
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
            />
        </div>
    );
}
