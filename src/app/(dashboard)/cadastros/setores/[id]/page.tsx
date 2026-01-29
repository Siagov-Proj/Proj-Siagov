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
import { maskCodigoComZeros, maskTelefone } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { ISetor } from '@/types';
import { ArrowLeft } from 'lucide-react';

// Mock data
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças', codigo: '000001' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração', codigo: '000002' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino', codigo: '000003' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'Coordenadoria de Orçamento', codigo: '00001' },
    { id: '2', orgaoId: '1', nome: 'Coordenadoria de Contabilidade', codigo: '00002' },
    { id: '3', orgaoId: '2', nome: 'Coordenadoria de RH', codigo: '00003' },
];

const mockSetores: ISetor[] = [
    {
        id: '1',
        codigo: '0001',
        instituicaoId: '1',
        orgaoId: '1',
        unidadeGestoraId: '1',
        nome: 'Setor de Licitações',
        nomeAbreviado: 'SELIC',
        responsavel: 'Maria da Silva',
        ramal: '1234',
        emailPrimario: 'maria@setor.gov.br',
        telefone01: '(00) 1234-5678',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const emptyFormData = {
    codigo: '',
    instituicaoId: '',
    orgaoId: '',
    unidadeGestoraId: '',
    nome: '',
    nomeAbreviado: '',
    responsavel: '',
    telefone01: '',
    emailPrimario: '',
    emailSecundario: '',
    ramal: '',
};

export default function EditarSetorPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(emptyFormData);
    const [originalData, setOriginalData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const found = mockSetores.find(s => s.id === id);

        if (found) {
            const data = {
                codigo: found.codigo,
                instituicaoId: found.instituicaoId,
                orgaoId: found.orgaoId,
                unidadeGestoraId: found.unidadeGestoraId,
                nome: found.nome,
                nomeAbreviado: found.nomeAbreviado,
                responsavel: found.responsavel || '',
                telefone01: found.telefone01 || '',
                emailPrimario: found.emailPrimario || '',
                emailSecundario: found.emailSecundario || '',
                ramal: found.ramal || '',
            };
            setFormData(data);
            setOriginalData(data);
        }
        setLoading(false);
    }, [params.id]);

    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) newErrors.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) newErrors.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.nomeAbreviado) newErrors.nomeAbreviado = 'Sigla é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = () => {
        if (!validate()) return;
        console.log('Atualizando setor:', params.id, formData);
        router.push('/cadastros/setores');
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
                    <h1 className="text-2xl font-bold tracking-tight">Editar Setor</h1>
                    <p className="text-muted-foreground">
                        Edite os dados do setor
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Setor</CardTitle>
                    <CardDescription>Informações principais e vinculação hierárquica</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* Código */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="codigo">Código</Label>
                                <FieldTooltip content="Código gerado automaticamente" />
                            </div>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                readOnly
                                className="bg-muted font-mono w-24"
                            />
                        </div>

                        {/* Cascata: Instituição → Órgão → UG */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição</Label>
                                    <FieldTooltip content="Selecione para filtrar órgãos" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, instituicaoId: valor, orgaoId: '', unidadeGestoraId: '' })}
                                >
                                    <SelectTrigger className={errors.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione" />
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

                            <div className="space-y-2">
                                <Label>Órgão</Label>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, orgaoId: valor, unidadeGestoraId: '' })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger className={errors.orgaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguardando...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((orgao) => (
                                            <SelectItem key={orgao.id} value={orgao.id}>
                                                {orgao.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.orgaoId && <p className="text-sm text-red-500">{errors.orgaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>
                                        Unidade Gestora<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Select
                                    value={formData.unidadeGestoraId}
                                    onValueChange={(valor) => setFormData({ ...formData, unidadeGestoraId: valor })}
                                    disabled={!formData.orgaoId}
                                >
                                    <SelectTrigger className={errors.unidadeGestoraId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguardando...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ugsFiltradas.map((ug) => (
                                            <SelectItem key={ug.id} value={ug.id}>
                                                {ug.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unidadeGestoraId && <p className="text-sm text-red-500">{errors.unidadeGestoraId}</p>}
                            </div>
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
                                    placeholder="Nome do setor"
                                    className={errors.nome ? 'border-red-500' : ''}
                                />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nomeAbreviado">
                                        Sigla<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })}
                                    maxLength={FIELD_LIMITS.sigla} // Using sigla limit for consistency
                                    placeholder="SIGLA"
                                    className={errors.nomeAbreviado ? 'border-red-500' : ''}
                                />
                                {errors.nomeAbreviado && <p className="text-sm text-red-500">{errors.nomeAbreviado}</p>}
                            </div>
                        </div>

                        {/* Responsável */}
                        <div className="space-y-2">
                            <Label htmlFor="responsavel">Responsável</Label>
                            <Input
                                id="responsavel"
                                value={formData.responsavel}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                maxLength={FIELD_LIMITS.nome}
                                placeholder="Nome do responsável"
                            />
                        </div>

                        {/* Contato */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emailPrimario">Email Primário</Label>
                                <Input
                                    id="emailPrimario"
                                    type="email"
                                    value={formData.emailPrimario}
                                    onChange={(e) => setFormData({ ...formData, emailPrimario: e.target.value })}
                                    maxLength={100}
                                    placeholder="email@setor.gov.br"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailSecundario">Email Secundário</Label>
                                <Input
                                    id="emailSecundario"
                                    type="email"
                                    value={formData.emailSecundario}
                                    onChange={(e) => setFormData({ ...formData, emailSecundario: e.target.value })}
                                    maxLength={100}
                                    placeholder="alternativo@setor.gov.br"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone01}
                                    onChange={(e) => setFormData({ ...formData, telefone01: maskTelefone(e.target.value) })}
                                    maxLength={15}
                                    placeholder="(00) 0000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ramal">Ramal</Label>
                                <Input
                                    id="ramal"
                                    value={formData.ramal}
                                    onChange={(e) => setFormData({ ...formData, ramal: e.target.value })}
                                    maxLength={10}
                                    placeholder="0000"
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
