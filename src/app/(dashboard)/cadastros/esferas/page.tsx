'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Search,
    Globe,
    Building2,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

// Tipos
interface IEsfera {
    id: string;
    nome: string;
    sigla: string;
    descricao: string;
    ativo: boolean;
    instituicoesVinculadas: number;
    criadoEm: Date;
}

// Dados mock
const esferasIniciais: IEsfera[] = [
    {
        id: '1',
        nome: 'Federal',
        sigla: 'FED',
        descricao: 'Órgãos e entidades da administração pública federal',
        ativo: true,
        instituicoesVinculadas: 12,
        criadoEm: new Date('2024-01-01'),
    },
    {
        id: '2',
        nome: 'Estadual',
        sigla: 'EST',
        descricao: 'Órgãos e entidades da administração pública estadual',
        ativo: true,
        instituicoesVinculadas: 8,
        criadoEm: new Date('2024-01-01'),
    },
    {
        id: '3',
        nome: 'Municipal',
        sigla: 'MUN',
        descricao: 'Órgãos e entidades da administração pública municipal',
        ativo: true,
        instituicoesVinculadas: 25,
        criadoEm: new Date('2024-01-01'),
    },
    {
        id: '4',
        nome: 'Distrital',
        sigla: 'DIS',
        descricao: 'Órgãos e entidades do Distrito Federal',
        ativo: true,
        instituicoesVinculadas: 3,
        criadoEm: new Date('2024-01-01'),
    },
];

const formVazio = {
    nome: '',
    sigla: '',
    descricao: '',
};

export default function EsferasPage() {
    const [esferas, setEsferas] = useState<IEsfera[]>(esferasIniciais);
    const [termoBusca, setTermoBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [formData, setFormData] = useState(formVazio);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [erros, setErros] = useState<Record<string, string>>({});

    // Filtrar esferas
    const esferasFiltradas = esferas.filter(
        (esf) =>
            esf.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            esf.sigla.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const abrirModal = (esfera?: IEsfera) => {
        if (esfera) {
            setFormData({
                nome: esfera.nome,
                sigla: esfera.sigla,
                descricao: esfera.descricao,
            });
            setEditandoId(esfera.id);
        } else {
            setFormData(formVazio);
            setEditandoId(null);
        }
        setErros({});
        setModalAberto(true);
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.sigla.trim()) novosErros.sigla = 'Sigla é obrigatória';
        if (formData.sigla.length > 3) novosErros.sigla = 'Sigla deve ter no máximo 3 caracteres';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setEsferas((prev) =>
                prev.map((esf) =>
                    esf.id === editandoId ? { ...esf, ...formData } : esf
                )
            );
        } else {
            const novaEsfera: IEsfera = {
                id: Date.now().toString(),
                nome: formData.nome,
                sigla: formData.sigla.toUpperCase(),
                descricao: formData.descricao,
                ativo: true,
                instituicoesVinculadas: 0,
                criadoEm: new Date(),
            };
            setEsferas((prev) => [...prev, novaEsfera]);
        }
        setModalAberto(false);
        setFormData(formVazio);
    };

    const excluir = (id: string) => {
        const esfera = esferas.find((e) => e.id === id);
        if (esfera && esfera.instituicoesVinculadas > 0) {
            alert('Não é possível excluir uma esfera com instituições vinculadas.');
            return;
        }
        setEsferas((prev) => prev.filter((esf) => esf.id !== id));
    };

    const obterCorEsfera = (sigla: string) => {
        switch (sigla) {
            case 'FED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'EST':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'MUN':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'DIS':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Globe className="h-6 w-6" />
                            Esferas de Governo
                        </h1>
                        <p className="text-muted-foreground">
                            Gerenciamento das esferas governamentais
                        </p>
                    </div>
                </div>
                <Button onClick={() => abrirModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Esfera
                </Button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {esferasIniciais.map((esf) => (
                    <Card key={esf.id}>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${obterCorEsfera(esf.sigla)}`}>
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{esf.nome}</p>
                                    <p className="text-2xl font-bold">{esf.instituicoesVinculadas}</p>
                                    <p className="text-xs text-muted-foreground">instituições</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Busca */}
            <Card>
                <CardContent className="pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar esferas..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardHeader>
                    <CardTitle>Esferas Cadastradas</CardTitle>
                    <CardDescription>
                        {esferasFiltradas.length} esfera(s) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Sigla</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-32 text-center">Instituições</TableHead>
                                    <TableHead className="w-24">Status</TableHead>
                                    <TableHead className="w-24">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {esferasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhuma esfera encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    esferasFiltradas.map((esf) => (
                                        <TableRow key={esf.id}>
                                            <TableCell>
                                                <Badge className={obterCorEsfera(esf.sigla)}>
                                                    {esf.sigla}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{esf.nome}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                {esf.descricao}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{esf.instituicoesVinculadas}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={esf.ativo ? 'default' : 'secondary'}>
                                                    {esf.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => abrirModal(esf)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => excluir(esf.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

            {/* Modal */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId ? 'Editar Esfera' : 'Nova Esfera'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da esfera de governo
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="nomeEsfera">
                                    Nome<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nomeEsfera"
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nome: e.target.value })
                                    }
                                    placeholder="Ex: Federal"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && (
                                    <p className="text-sm text-red-500">{erros.nome}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="siglaEsfera">
                                    Sigla<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="siglaEsfera"
                                    value={formData.sigla}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sigla: e.target.value.toUpperCase(),
                                        })
                                    }
                                    maxLength={3}
                                    placeholder="FED"
                                    className={erros.sigla ? 'border-red-500' : ''}
                                />
                                {erros.sigla && (
                                    <p className="text-sm text-red-500">{erros.sigla}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricaoEsfera">Descrição</Label>
                            <Textarea
                                id="descricaoEsfera"
                                value={formData.descricao}
                                onChange={(e) =>
                                    setFormData({ ...formData, descricao: e.target.value })
                                }
                                placeholder="Descrição da esfera..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalAberto(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={salvar}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
