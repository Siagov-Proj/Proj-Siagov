'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
    cargosService,
    instituicoesService,
    orgaosService,
    unidadesService,
    setoresService,
    IInstituicaoDB,
    IOrgaoDB,
    IUnidadeGestoraDB,
    ISetorDB
} from '@/services/api';

const NIVEIS_CARGO = [
    { value: 'Superior', label: 'Nível Superior' },
    { value: 'Médio', label: 'Nível Médio' },
    { value: 'Técnico', label: 'Nível Técnico' },
    { value: 'Fundamental', label: 'Nível Fundamental' },
];

const emptyFormData = {
    codigo: '',
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
    const [saving, setSaving] = useState(false);

    // Listas para selects
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);
    const [setores, setSetores] = useState<ISetorDB[]>([]);

    // Loading states for selects
    const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [loadingSetores, setLoadingSetores] = useState(false);

    useEffect(() => {
        carregarInstituicoes();
    }, []);

    const carregarInstituicoes = async () => {
        try {
            setLoadingInstituicoes(true);
            const data = await instituicoesService.listar();
            setInstituicoes(data);
        } catch (error) {
            console.error('Erro ao carregar instituições:', error);
        } finally {
            setLoadingInstituicoes(false);
        }
    };

    const handleInstituicaoChange = async (instituicaoId: string) => {
        setFormData({
            ...formData,
            instituicaoId,
            orgaoId: '',
            unidadeGestoraId: '',
            setorId: ''
        });
        setOrgaos([]);
        setUnidades([]);
        setSetores([]);

        if (instituicaoId) {
            try {
                setLoadingOrgaos(true);
                const data = await orgaosService.listarPorInstituicao(instituicaoId);
                setOrgaos(data);
            } catch (error) {
                console.error('Erro ao carregar órgãos:', error);
            } finally {
                setLoadingOrgaos(false);
            }
        }
    };

    const handleOrgaoChange = async (orgaoId: string) => {
        setFormData({
            ...formData,
            orgaoId,
            unidadeGestoraId: '',
            setorId: ''
        });
        setUnidades([]);
        setSetores([]);

        if (orgaoId) {
            try {
                setLoadingUnidades(true);
                const data = await unidadesService.listarPorOrgao(orgaoId);
                setUnidades(data);
            } catch (error) {
                console.error('Erro ao carregar unidades:', error);
            } finally {
                setLoadingUnidades(false);
            }
        }
    };

    const handleUnidadeChange = async (unidadeGestoraId: string) => {
        setFormData({
            ...formData,
            unidadeGestoraId,
            setorId: ''
        });
        setSetores([]);

        if (unidadeGestoraId) {
            try {
                setLoadingSetores(true);
                const data = await setoresService.listarPorUnidadeGestora(unidadeGestoraId);
                setSetores(data);
            } catch (error) {
                console.error('Erro ao carregar setores:', error);
            } finally {
                setLoadingSetores(false);
            }
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
        if (formData.codigo.length !== 3) newErrors.codigo = 'Código deve ter 3 dígitos';
        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) newErrors.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) newErrors.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        // Setor opcional ou obrigatório? No mock estava obrigatório. Mantendo obrigatório por consistência visual
        // mas o DB permite nulo. Vamos manter obrigatório para garantir hierarquia completa.
        if (!formData.setorId) newErrors.setorId = 'Setor é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await cargosService.criar({
                codigo: formData.codigo,
                instituicao_id: formData.instituicaoId,
                orgao_id: formData.orgaoId,
                unidade_gestora_id: formData.unidadeGestoraId,
                setor_id: formData.setorId,
                nome: formData.nome,
                descricao: formData.descricao,
                nivel: formData.nivel,
                ativo: true,
            });
            router.push('/cadastros/cargos');
        } catch (error) {
            console.error('Erro ao criar cargo:', error);
            alert('Erro ao criar cargo. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(emptyFormData);
        setErrors({});
        setOrgaos([]);
        setUnidades([]);
        setSetores([]);
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
                                <Label htmlFor="codigo">Código<span className="text-red-500 ml-1">*</span></Label>
                                <FieldTooltip content="Código identificador (3 dígitos)" />
                            </div>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                                maxLength={3}
                                placeholder="001"
                                className={`font-mono w-24 ${errors.codigo ? 'border-red-500' : ''}`}
                            />
                            {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                        </div>

                        {/* Cascata: Instituição → Órgão → UG → Setor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                                    <FieldTooltip content="Primeiro nível da cascata" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={handleInstituicaoChange}
                                >
                                    <SelectTrigger className={errors.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={loadingInstituicoes ? "Carregando..." : "Selecione"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.codigo} - {inst.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.instituicaoId && <p className="text-sm text-red-500">{errors.instituicaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Órgão<span className="text-red-500 ml-1">*</span></Label>
                                {loadingOrgaos ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.orgaoId}
                                        onValueChange={handleOrgaoChange}
                                        disabled={!formData.instituicaoId}
                                    >
                                        <SelectTrigger className={errors.orgaoId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={formData.instituicaoId ? "Selecione" : "Aguardando..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgaos.map((org) => (
                                                <SelectItem key={org.id} value={org.id}>
                                                    {org.codigo} - {org.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.orgaoId && <p className="text-sm text-red-500">{errors.orgaoId}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unidade Gestora<span className="text-red-500 ml-1">*</span></Label>
                                {loadingUnidades ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.unidadeGestoraId}
                                        onValueChange={handleUnidadeChange}
                                        disabled={!formData.orgaoId}
                                    >
                                        <SelectTrigger className={errors.unidadeGestoraId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={formData.orgaoId ? "Selecione" : "Aguardando..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades.map((ug) => (
                                                <SelectItem key={ug.id} value={ug.id}>
                                                    {ug.codigo} - {ug.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.unidadeGestoraId && <p className="text-sm text-red-500">{errors.unidadeGestoraId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Setor<span className="text-red-500 ml-1">*</span></Label>
                                </div>
                                {loadingSetores ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.setorId}
                                        onValueChange={(valor) => setFormData({ ...formData, setorId: valor })}
                                        disabled={!formData.unidadeGestoraId}
                                    >
                                        <SelectTrigger className={errors.setorId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={formData.unidadeGestoraId ? "Selecione" : "Aguardando..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {setores.map((setor) => (
                                                <SelectItem key={setor.id} value={setor.id}>
                                                    {setor.codigo} - {setor.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
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
                isLoading={saving}
            />
        </div>
    );
}
