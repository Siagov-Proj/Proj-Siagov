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
import { Plus, Search, Pencil, Trash2, Building } from 'lucide-react';
import { maskCnpj, maskCodigoComZeros } from '@/utils/masks';
import { PODERES, FIELD_LIMITS } from '@/utils/constants';
import type { IOrgao } from '@/types';

// Mock data
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
    { id: '3', nome: 'Ministério da Saúde', codigo: '003' },
];

const initialOrgaos: IOrgao[] = [
    {
        id: '1',
        codigo: '000001',
        instituicaoId: '1',
        poderVinculado: 'Executivo',
        nome: 'Secretaria de Finanças',
        sigla: 'SEFIN',
        cnpj: '00.000.000/0001-00',
        codigoSiasg: '123456',
        ugTce: '12345',
        ugSiafemSigef: '123456',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        codigo: '000002',
        instituicaoId: '1',
        poderVinculado: 'Executivo',
        nome: 'Secretaria de Administração',
        sigla: 'SEAD',
        cnpj: '00.000.000/0002-00',
        codigoSiasg: '234567',
        ugTce: '23456',
        ugSiafemSigef: '234567',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const emptyFormData = {
    codigo: '',
    instituicaoId: '',
    poderVinculado: '' as IOrgao['poderVinculado'] | '',
    nome: '',
    sigla: '',
    cnpj: '',
    codigoSiasg: '',
    ugTce: '',
    ugSiafemSigef: '',
    nomeAnterior: '',
    nomeAbreviadoAnterior: '',
};

export default function OrgaosPage() {
    const [orgaos, setOrgaos] = useState<IOrgao[]>(initialOrgaos);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredOrgaos = orgaos.filter(
        (org) =>
            org.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.codigo.includes(searchTerm)
    );

    const handleOpenNew = () => {
        const nextCode = maskCodigoComZeros(String(orgaos.length + 1), 6);
        setFormData({ ...emptyFormData, codigo: nextCode });
        setEditingId(null);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleEdit = (orgao: IOrgao) => {
        setFormData({
            codigo: orgao.codigo,
            instituicaoId: orgao.instituicaoId,
            poderVinculado: orgao.poderVinculado,
            nome: orgao.nome,
            sigla: orgao.sigla,
            cnpj: orgao.cnpj,
            codigoSiasg: orgao.codigoSiasg,
            ugTce: orgao.ugTce,
            ugSiafemSigef: orgao.ugSiafemSigef,
            nomeAnterior: orgao.nomeAnterior || '',
            nomeAbreviadoAnterior: orgao.nomeAbreviadoAnterior || '',
        });
        setEditingId(orgao.id);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este órgão?')) {
            setOrgaos(orgaos.filter((o) => o.id !== id));
        }
    };

    const handleLimpar = () => {
        const nextCode = editingId ? formData.codigo : maskCodigoComZeros(String(orgaos.length + 1), 6);
        setFormData({ ...emptyFormData, codigo: nextCode });
        setErrors({});
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.poderVinculado) newErrors.poderVinculado = 'Poder Vinculado é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.sigla) newErrors.sigla = 'Sigla é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = () => {
        if (!validate()) return;

        if (editingId) {
            // Update
            setOrgaos(
                orgaos.map((o) =>
                    o.id === editingId
                        ? {
                            ...o,
                            ...formData,
                            poderVinculado: formData.poderVinculado as IOrgao['poderVinculado'],
                            updatedAt: new Date(),
                        }
                        : o
                )
            );
        } else {
            // Create
            const newOrgao: IOrgao = {
                id: String(Date.now()),
                ...formData,
                poderVinculado: formData.poderVinculado as IOrgao['poderVinculado'],
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setOrgaos([...orgaos, newOrgao]);
        }

        setIsDialogOpen(false);
        setFormData(emptyFormData);
        setEditingId(null);
    };

    const getInstituicaoNome = (id: string) => {
        return mockInstituicoes.find((i) => i.id === id)?.nome || '';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Building className="h-6 w-6" />
                        Órgãos
                    </h1>
                    <p className="text-muted-foreground">
                        Gerenciamento de órgãos vinculados às instituições
                    </p>
                </div>
                <Button onClick={handleOpenNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Órgão
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Órgãos</CardTitle>
                            <CardDescription>
                                {filteredOrgaos.length} órgão(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar órgão..."
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
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-20">Sigla</TableHead>
                                    <TableHead>Instituição</TableHead>
                                    <TableHead>Poder</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrgaos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum órgão encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrgaos.map((orgao) => (
                                        <TableRow key={orgao.id}>
                                            <TableCell className="font-mono">{orgao.codigo}</TableCell>
                                            <TableCell className="font-medium">{orgao.nome}</TableCell>
                                            <TableCell>{orgao.sigla}</TableCell>
                                            <TableCell>{getInstituicaoNome(orgao.instituicaoId)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{orgao.poderVinculado}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(orgao)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(orgao.id)}
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Órgão' : 'Novo Órgão'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo para {editingId ? 'editar o' : 'cadastrar um novo'} órgão
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Código e Instituição */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Código de 6 dígitos do órgão, conforme sistema de orçamento" />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, codigo: maskCodigoComZeros(e.target.value, 6) })
                                    }
                                    maxLength={6}
                                    placeholder="000001"
                                    className={errors.codigo ? 'border-red-500' : ''}
                                />
                                {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="instituicaoId">
                                        Instituição<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Instituição à qual o órgão está vinculado" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(value) => setFormData({ ...formData, instituicaoId: value })}
                                >
                                    <SelectTrigger className={errors.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a instituição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.codigo} - {inst.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.instituicaoId && <p className="text-sm text-red-500">{errors.instituicaoId}</p>}
                            </div>
                        </div>

                        {/* Poder Vinculado - OBRIGATÓRIO */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="poderVinculado">
                                    Poder Vinculado<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Poder ao qual o órgão está vinculado: Executivo, Legislativo ou Judiciário" />
                            </div>
                            <Select
                                value={formData.poderVinculado}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, poderVinculado: value as IOrgao['poderVinculado'] })
                                }
                            >
                                <SelectTrigger className={errors.poderVinculado ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione o poder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PODERES.map((poder) => (
                                        <SelectItem key={poder.value} value={poder.value}>
                                            {poder.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.poderVinculado && <p className="text-sm text-red-500">{errors.poderVinculado}</p>}
                        </div>

                        {/* Nome e Sigla */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
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
                                    placeholder="Nome do órgão"
                                    className={errors.nome ? 'border-red-500' : ''}
                                />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="sigla">
                                        Sigla<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="sigla"
                                    value={formData.sigla}
                                    onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                                    maxLength={FIELD_LIMITS.sigla}
                                    placeholder="SIGLA"
                                    className={errors.sigla ? 'border-red-500' : ''}
                                />
                                {errors.sigla && <p className="text-sm text-red-500">{errors.sigla}</p>}
                            </div>
                        </div>

                        {/* CNPJ e Código SIASG */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <FieldTooltip content="CNPJ do órgão, caso possua" />
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
                                    <FieldTooltip content="Código do órgão no Sistema Integrado de Administração de Serviços Gerais" />
                                </div>
                                <Input
                                    id="codigoSiasg"
                                    value={formData.codigoSiasg}
                                    onChange={(e) =>
                                        setFormData({ ...formData, codigoSiasg: e.target.value.replace(/\D/g, '').substring(0, 6) })
                                    }
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* UG TCE e UG SIAFEM/SIGEF */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ugTce">UG TCE</Label>
                                    <FieldTooltip content="Código da Unidade Gestora no Tribunal de Contas do Estado" />
                                </div>
                                <Input
                                    id="ugTce"
                                    value={formData.ugTce}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ugTce: e.target.value.replace(/\D/g, '').substring(0, 5) })
                                    }
                                    maxLength={5}
                                    placeholder="00000"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ugSiafemSigef">UG SIAFEM/SIGEF</Label>
                                    <FieldTooltip content="Código da Unidade Gestora no SIAFEM ou SIGEF" />
                                </div>
                                <Input
                                    id="ugSiafemSigef"
                                    value={formData.ugSiafemSigef}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ugSiafemSigef: e.target.value.replace(/\D/g, '').substring(0, 6) })
                                    }
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Campos Históricos (Opcionais) */}
                    <div className="border-t pt-4 mt-2">
                        <h4 className="text-sm font-medium mb-4">Dados Históricos (Opcional)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nomeAnterior">Nome Anterior</Label>
                                    <FieldTooltip content="Nome anterior do órgão, caso tenha sofrido alteração" />
                                </div>
                                <Input
                                    id="nomeAnterior"
                                    value={formData.nomeAnterior}
                                    onChange={(e) => setFormData({ ...formData, nomeAnterior: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome antigo"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nomeAbreviadoAnterior">
                                        Nome Abreviado Anterior
                                    </Label>
                                    <FieldTooltip content="Sigla ou nome abreviado anterior" />
                                </div>
                                <Input
                                    id="nomeAbreviadoAnterior"
                                    value={formData.nomeAbreviadoAnterior}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nomeAbreviadoAnterior: e.target.value.toUpperCase(),
                                        })
                                    }
                                    maxLength={FIELD_LIMITS.nomeAbreviado}
                                    placeholder="SIGLA ANTIGA"
                                />
                            </div>
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
        </div >
    );
}
