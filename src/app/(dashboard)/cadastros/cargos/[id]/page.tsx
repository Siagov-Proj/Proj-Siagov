'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function EditarCargoPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(emptyFormData);
    const [originalData, setOriginalData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Listas para selects
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);
    const [setores, setSetores] = useState<ISetorDB[]>([]);

    // Loading states for selects
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [loadingSetores, setLoadingSetores] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            const [cargo, listaInstituicoes] = await Promise.all([
                cargosService.buscarPorId(id),
                instituicoesService.listar(),
            ]);

            setInstituicoes(listaInstituicoes);

            if (cargo) {
                // Carregar dependências em cascata
                if (cargo.instituicao_id) {
                    const listaOrgaos = await orgaosService.listarPorInstituicao(cargo.instituicao_id);
                    setOrgaos(listaOrgaos);
                }

                if (cargo.orgao_id) {
                    const listaUnidades = await unidadesService.listarPorOrgao(cargo.orgao_id);
                    setUnidades(listaUnidades);
                }

                if (cargo.unidade_gestora_id) {
                    const listaSetores = await setoresService.listarPorUnidadeGestora(cargo.unidade_gestora_id);
                    setSetores(listaSetores);
                }

                const data = {
                    codigo: cargo.codigo,
                    instituicaoId: cargo.instituicao_id || '',
                    orgaoId: cargo.orgao_id || '',
                    unidadeGestoraId: cargo.unidade_gestora_id || '',
                    setorId: cargo.setor_id || '',
                    nome: cargo.nome,
                    descricao: cargo.descricao || '',
                    nivel: cargo.nivel || '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                alert('Cargo não encontrado');
                router.push('/cadastros/cargos');
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            alert('Erro ao carregar dados. Tente novamente.');
            router.push('/cadastros/cargos');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

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
            } catch (err) {
                console.error('Erro ao carregar órgãos:', err);
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
            } catch (err) {
                console.error('Erro ao carregar unidades:', err);
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
            } catch (err) {
                console.error('Erro ao carregar setores:', err);
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
        if (!formData.setorId) newErrors.setorId = 'Setor é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await cargosService.atualizar(params.id as string, {
                codigo: formData.codigo,
                instituicao_id: formData.instituicaoId,
                orgao_id: formData.orgaoId,
                unidade_gestora_id: formData.unidadeGestoraId,
                setor_id: formData.setorId,
                nome: formData.nome,
                descricao: formData.descricao,
                nivel: formData.nivel,
            });
            router.push('/cadastros/cargos');
        } catch (err) {
            console.error('Erro ao atualizar cargo:', err);
            alert('Erro ao atualizar cargo. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        // Recarregar os dados originais
        carregarDados();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Cargo</h1>
                    <p className="text-muted-foreground">
                        Edite os dados do cargo
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
                                        <SelectValue placeholder="Selecione" />
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
                mode="edit"
                isLoading={saving}
            />
        </div>
    );
}
