'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { maskCnpj, maskCodigoComZeros } from '@/utils/masks';
import { PODERES, FIELD_LIMITS } from '@/utils/constants';
import type { IOrgao } from '@/types';
import { ArrowLeft } from 'lucide-react';

const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
    { id: '3', nome: 'Ministério da Saúde', codigo: '003' },
];

const mockOrgaos: IOrgao[] = [
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

export default function EditarOrgaoPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(emptyFormData);
    const [originalData, setOriginalData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const found = mockOrgaos.find(o => o.id === id);

        if (found) {
            const data = {
                codigo: found.codigo,
                instituicaoId: found.instituicaoId,
                poderVinculado: found.poderVinculado,
                nome: found.nome,
                sigla: found.sigla,
                cnpj: found.cnpj,
                codigoSiasg: found.codigoSiasg,
                ugTce: found.ugTce,
                ugSiafemSigef: found.ugSiafemSigef,
                nomeAnterior: found.nomeAnterior || '',
                nomeAbreviadoAnterior: found.nomeAbreviadoAnterior || '',
            };
            setFormData(data);
            setOriginalData(data);
        }
        setLoading(false);
    }, [params.id]);

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
        console.log('Atualizando órgão:', params.id, formData);
        router.push('/cadastros/orgaos');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setErrors({});
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Órgão</h1>
                    <p className="text-muted-foreground">
                        Edite os dados do órgão
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Órgão</CardTitle>
                    <CardDescription>Informações principais e vinculação</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* Código e Instituição */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Código de 6 dígitos do órgão" />
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
                                <FieldTooltip content="Poder ao qual o órgão está vinculado" />
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
                    <div className="border-t pt-4 mt-8">
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
