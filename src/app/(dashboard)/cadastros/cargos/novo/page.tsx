'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { maskCodigoComZeros } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import { ArrowLeft } from 'lucide-react';

// Mock data
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'Coordenadoria de Orçamento' },
    { id: '2', orgaoId: '1', nome: 'Coordenadoria de Contabilidade' },
    { id: '3', orgaoId: '2', nome: 'Coordenadoria de RH' },
];

const mockSetores = [
    { id: '1', unidadeGestoraId: '1', nome: 'Setor de Licitações' },
    { id: '2', unidadeGestoraId: '1', nome: 'Setor de Contratos' },
    { id: '3', unidadeGestoraId: '3', nome: 'Setor de Pessoal' },
];

const NIVEIS_CARGO = [
    { value: 'Superior', label: 'Nível Superior' },
    { value: 'Médio', label: 'Nível Médio' },
    { value: 'Técnico', label: 'Nível Técnico' },
    { value: 'Fundamental', label: 'Nível Fundamental' },
];

const emptyFormData = {
    codigo: '001', // Mock auto-generated
    instituicaoId: '',
    orgaoId: '',
    unidadeGestoraId: '',
    setorId: '',
    nome: '',
    descricao: '',
    nivel: '',
};

export default function NovoCargoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);
    const setoresFiltrados = mockSetores.filter((s) => s.unidadeGestoraId === formData.unidadeGestoraId);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) newErrors.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) newErrors.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.setorId) newErrors.setorId = 'Setor é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = () => {
        if (!validate()) return;
        console.log('Salvando novo cargo:', formData);
        router.push('/cadastros/cargos');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData({ ...emptyFormData, codigo: formData.codigo });
        setErrors({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Cargo</h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para cadastrar um novo cargo
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Cargo</CardTitle>
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
                                className="bg-muted font-mono w-20"
                            />
                        </div>

                        {/* Cascata: Instituição → Órgão → UG → Setor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição</Label>
                                    <FieldTooltip content="Primeiro nível da cascata" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        instituicaoId: valor,
                                        orgaoId: '',
                                        unidadeGestoraId: '',
                                        setorId: ''
                                    })}
                                >
                                    <SelectTrigger className={errors.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>{inst.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.instituicaoId && <p className="text-sm text-red-500">{errors.instituicaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Órgão</Label>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        orgaoId: valor,
                                        unidadeGestoraId: '',
                                        setorId: ''
                                    })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger className={errors.orgaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>{org.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.orgaoId && <p className="text-sm text-red-500">{errors.orgaoId}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unidade Gestora</Label>
                                <Select
                                    value={formData.unidadeGestoraId}
                                    onValueChange={(valor) => setFormData({ ...formData, unidadeGestoraId: valor, setorId: '' })}
                                    disabled={!formData.orgaoId}
                                >
                                    <SelectTrigger className={errors.unidadeGestoraId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ugsFiltradas.map((ug) => (
                                            <SelectItem key={ug.id} value={ug.id}>{ug.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unidadeGestoraId && <p className="text-sm text-red-500">{errors.unidadeGestoraId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Setor<span className="text-red-500 ml-1">*</span></Label>
                                </div>
                                <Select
                                    value={formData.setorId}
                                    onValueChange={(valor) => setFormData({ ...formData, setorId: valor })}
                                    disabled={!formData.unidadeGestoraId}
                                >
                                    <SelectTrigger className={errors.setorId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.unidadeGestoraId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {setoresFiltrados.map((setor) => (
                                            <SelectItem key={setor.id} value={setor.id}>{setor.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.setorId && <p className="text-sm text-red-500">{errors.setorId}</p>}
                            </div>
                        </div>

                        {/* Nome e Nível */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nome">
                                        Nome do Cargo<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome do cargo"
                                    className={errors.nome ? 'border-red-500' : ''}
                                />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nivel">Nível de Escolaridade</Label>
                                <Select
                                    value={formData.nivel}
                                    onValueChange={(valor) => setFormData({ ...formData, nivel: valor })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NIVEIS_CARGO.map((nivel) => (
                                            <SelectItem key={nivel.value} value={nivel.value}>{nivel.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição do Cargo</Label>
                            <Input
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                maxLength={200}
                                placeholder="Descrição das atribuições do cargo"
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
