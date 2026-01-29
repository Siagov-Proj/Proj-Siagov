'use client';

import { useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react';
import { maskCnpj, maskCep, maskCodigoComZeros } from '@/utils/masks';
import { ESFERAS, ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import { generateSequentialCode } from '@/utils/formatters';
import type { IInstituicao } from '@/types';

const initialInstituicoes: IInstituicao[] = [
    {
        id: '1',
        codigo: '001',
        nome: 'Ministério da Fazenda',
        nomeAbreviado: 'MF',
        esfera: 'Federal',
        cnpj: '00.000.000/0001-00',
        email: 'contato@fazenda.gov.br',
        codigoSiasg: '123456',
        cep: '70000-000',
        logradouro: 'Esplanada dos Ministérios, Bloco P',
        numero: 'S/N',
        complemento: '',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        codigo: '002',
        nome: 'Ministério da Educação',
        nomeAbreviado: 'MEC',
        esfera: 'Federal',
        cnpj: '00.000.000/0002-00',
        email: 'contato@mec.gov.br',
        codigoSiasg: '234567',
        cep: '70047-900',
        logradouro: 'Esplanada dos Ministérios, Bloco L',
        numero: 'S/N',
        complemento: '',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const emptyFormData = {
    codigo: '',
    nome: '',
    nomeAbreviado: '',
    esfera: '' as IInstituicao['esfera'] | '',
    cnpj: '',
    email: '',
    codigoSiasg: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
};

export default function InstituicoesPage() {
    const [instituicoes, setInstituicoes] = useState<IInstituicao[]>(initialInstituicoes);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredInstituicoes = instituicoes.filter(
        (inst) =>
            inst.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.nomeAbreviado.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.codigo.includes(searchTerm)
    );

    const handleOpenNew = () => {
        // Código sequencial automático (001, 002...)
        const nextCode = generateSequentialCode(instituicoes.length, 3);
        setFormData({ ...emptyFormData, codigo: nextCode });
        setEditingId(null);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleEdit = (instituicao: IInstituicao) => {
        setFormData({
            codigo: instituicao.codigo,
            nome: instituicao.nome,
            nomeAbreviado: instituicao.nomeAbreviado,
            esfera: instituicao.esfera,
            cnpj: instituicao.cnpj,
            email: instituicao.email,
            codigoSiasg: instituicao.codigoSiasg,
            cep: instituicao.cep,
            logradouro: instituicao.logradouro,
            numero: instituicao.numero,
            complemento: instituicao.complemento,
            bairro: instituicao.bairro,
            municipio: instituicao.municipio,
            uf: instituicao.uf,
        });
        setEditingId(instituicao.id);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta instituição?')) {
            setInstituicoes(instituicoes.filter((i) => i.id !== id));
        }
    };

    const handleLimpar = () => {
        const nextCode = editingId
            ? formData.codigo
            : generateSequentialCode(instituicoes.length, 3);
        setFormData({ ...emptyFormData, codigo: nextCode });
        setErrors({});
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.esfera) newErrors.esfera = 'Esfera é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = () => {
        if (!validate()) return;

        if (editingId) {
            setInstituicoes(
                instituicoes.map((i) =>
                    i.id === editingId
                        ? {
                            ...i,
                            ...formData,
                            esfera: formData.esfera as IInstituicao['esfera'],
                            updatedAt: new Date(),
                        }
                        : i
                )
            );
        } else {
            const newInstituicao: IInstituicao = {
                id: String(Date.now()),
                ...formData,
                esfera: formData.esfera as IInstituicao['esfera'],
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setInstituicoes([...instituicoes, newInstituicao]);
        }

        setIsDialogOpen(false);
        setFormData(emptyFormData);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Instituições
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de instituições governamentais
                    </p>
                </div>
                <Button onClick={handleOpenNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Instituição
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Instituições</CardTitle>
                            <CardDescription>
                                {filteredInstituicoes.length} instituição(ões) encontrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar instituição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-24">Sigla</TableHead>
                                    <TableHead>Esfera</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInstituicoes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma instituição encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInstituicoes.map((inst) => (
                                        <TableRow key={inst.id}>
                                            <TableCell className="font-mono">{inst.codigo}</TableCell>
                                            <TableCell className="font-medium">{inst.nome}</TableCell>
                                            <TableCell>{inst.nomeAbreviado}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{inst.esfera}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{inst.cnpj}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(inst)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(inst.id)}
                                                        className="text-red-500 hover:text-red-600"
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

            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Instituição' : 'Nova Instituição'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo. O código é gerado automaticamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Código (readonly), Nome e Nome Abreviado */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">Código</Label>
                                    <FieldTooltip content="Código sequencial gerado automaticamente (001, 002...)" />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    readOnly
                                    className="bg-muted font-mono"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nome">
                                        Nome<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome da instituição"
                                    className={errors.nome ? 'border-red-500' : ''}
                                />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>
                        </div>

                        {/* Nome Abreviado e Esfera */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nomeAbreviado">Nome Abreviado</Label>
                                    <FieldTooltip content="Sigla ou nome abreviado (máx. 30 caracteres)" />
                                </div>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })
                                    }
                                    maxLength={FIELD_LIMITS.nomeAbreviado}
                                    placeholder="SIGLA"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="esfera">
                                        Esfera<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Esfera de governo: Federal, Estadual, Municipal ou Distrital" />
                                </div>
                                <Select
                                    value={formData.esfera}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, esfera: value as IInstituicao['esfera'] })
                                    }
                                >
                                    <SelectTrigger className={errors.esfera ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a esfera" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ESFERAS.map((esfera) => (
                                            <SelectItem key={esfera.value} value={esfera.value}>
                                                {esfera.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.esfera && <p className="text-sm text-red-500">{errors.esfera}</p>}
                            </div>
                        </div>

                        {/* CNPJ e Código SIASG */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <FieldTooltip content="CNPJ da instituição" />
                                </div>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                    maxLength={18}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigoSiasg">Código SIASG</Label>
                                    <FieldTooltip content="Código no Sistema Integrado de Administração de Serviços Gerais" />
                                </div>
                                <Input
                                    id="codigoSiasg"
                                    value={formData.codigoSiasg}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            codigoSiasg: e.target.value.replace(/\D/g, '').substring(0, 6),
                                        })
                                    }
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Endereço</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                                        maxLength={9}
                                        placeholder="00000-000"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro</Label>
                                    <Input
                                        id="logradouro"
                                        value={formData.logradouro}
                                        onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                                        maxLength={FIELD_LIMITS.logradouro}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        maxLength={FIELD_LIMITS.numero}
                                        placeholder="Nº"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input
                                        id="complemento"
                                        value={formData.complemento}
                                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                        maxLength={FIELD_LIMITS.complemento}
                                        placeholder="Apto, Sala, etc."
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        maxLength={FIELD_LIMITS.bairro}
                                        placeholder="Bairro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="municipio">Município</Label>
                                    <Input
                                        id="municipio"
                                        value={formData.municipio}
                                        onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                                        maxLength={FIELD_LIMITS.municipio}
                                        placeholder="Cidade"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="uf">UF</Label>
                                    <Select
                                        value={formData.uf}
                                        onValueChange={(value) => setFormData({ ...formData, uf: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((estado) => (
                                                <SelectItem key={estado.value} value={estado.value}>
                                                    {estado.value} - {estado.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                maxLength={FIELD_LIMITS.email}
                                placeholder="contato@instituicao.gov.br"
                            />
                        </div>
                    </div>

                    {/* ActionBar */}
                    <ActionBar
                        onSalvar={handleSalvar}
                        onCancelar={() => setIsDialogOpen(false)}
                        onLimpar={handleLimpar}
                        mode={editingId ? 'edit' : 'create'}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
