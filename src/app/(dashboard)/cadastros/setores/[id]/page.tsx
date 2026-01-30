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
import { maskCodigoComZeros, maskTelefone } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { ISetor } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { setoresService, instituicoesService, orgaosService, unidadesService, IInstituicaoDB, IOrgaoDB, IUnidadeGestoraDB } from '@/services/api';

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
    const [saving, setSaving] = useState(false);

    // Listas para selects
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);

    // Loading states for selects
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);
    const [loadingUnidades, setLoadingUnidades] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            // Carrega setor e instituições em paralelo
            const [setor, listaInstituicoes] = await Promise.all([
                setoresService.buscarPorId(id),
                instituicoesService.listar(),
            ]);

            setInstituicoes(listaInstituicoes);

            if (setor) {
                // Carrega órgãos e unidades se houver IDs
                if (setor.instituicao_id) {
                    const listaOrgaos = await orgaosService.listarPorInstituicao(setor.instituicao_id);
                    setOrgaos(listaOrgaos);
                }

                if (setor.orgao_id) {
                    const listaUnidades = await unidadesService.listarPorOrgao(setor.orgao_id);
                    setUnidades(listaUnidades);
                }

                const data = {
                    codigo: setor.codigo,
                    instituicaoId: setor.instituicao_id || '',
                    orgaoId: setor.orgao_id || '',
                    unidadeGestoraId: setor.unidade_gestora_id || '',
                    nome: setor.nome,
                    nomeAbreviado: setor.nome_abreviado || '',
                    responsavel: setor.responsavel || '',
                    telefone01: setor.telefone_01 || '',
                    emailPrimario: setor.email_primario || '',
                    emailSecundario: setor.email_secundario || '',
                    ramal: setor.ramal || '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                alert('Setor não encontrado');
                router.push('/cadastros/setores');
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            alert('Erro ao carregar dados. Tente novamente.');
            router.push('/cadastros/setores');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Handle Institution Change
    const handleInstituicaoChange = async (instituicaoId: string) => {
        setFormData({ ...formData, instituicaoId, orgaoId: '', unidadeGestoraId: '' });
        setOrgaos([]);
        setUnidades([]);

        if (!instituicaoId) return;

        try {
            setLoadingOrgaos(true);
            const dados = await orgaosService.listarPorInstituicao(instituicaoId);
            setOrgaos(dados);
        } catch (err) {
            console.error('Erro ao carregar órgãos:', err);
        } finally {
            setLoadingOrgaos(false);
        }
    };

    // Handle Organ Change
    const handleOrgaoChange = async (orgaoId: string) => {
        setFormData({ ...formData, orgaoId, unidadeGestoraId: '' });
        setUnidades([]);

        if (!orgaoId) return;

        try {
            setLoadingUnidades(true);
            const dados = await unidadesService.listarPorOrgao(orgaoId);
            setUnidades(dados);
        } catch (err) {
            console.error('Erro ao carregar unidades:', err);
        } finally {
            setLoadingUnidades(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
        if (formData.codigo.length !== 4) newErrors.codigo = 'Código deve ter 4 dígitos';
        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) newErrors.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) newErrors.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.nomeAbreviado) newErrors.nomeAbreviado = 'Sigla é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await setoresService.atualizar(params.id as string, {
                codigo: formData.codigo,
                instituicao_id: formData.instituicaoId,
                orgao_id: formData.orgaoId,
                unidade_gestora_id: formData.unidadeGestoraId,
                nome: formData.nome,
                nome_abreviado: formData.nomeAbreviado,
                responsavel: formData.responsavel,
                telefone_01: formData.telefone01,
                email_primario: formData.emailPrimario,
                email_secundario: formData.emailSecundario,
                ramal: formData.ramal,
            });
            router.push('/cadastros/setores');
        } catch (err) {
            console.error('Erro ao atualizar setor:', err);
            alert('Erro ao atualizar setor. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setErrors({});
        // Re-carregar dependências se necessário - mas como o formulário volta ao estado original,
        // os useEffects ou chamadas manuais deveriam lidar com isso?
        // Na verdade, ao resetar o ID, precisaria garantir que as listas estejam lá.
        // Como 'orgaos' e 'unidades' são carregados no início, e só limpos ao TROCAR instituicao/orgao,
        // se voltarmos para o original, precisamos garantir que as listas batam com o original.
        // O ideal seria re-executar 'carregarDados' ou ter lógica mais robusta.
        // Simplificação: reload da página ou re-chamada de carregarDados.
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
                                <Label htmlFor="codigo">Código<span className="text-red-500 ml-1">*</span></Label>
                                <FieldTooltip content="Código gerado manualmente (4 dígitos)" />
                            </div>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                                maxLength={4}
                                placeholder="0000"
                                className={`font-mono w-24 ${errors.codigo ? 'border-red-500' : ''}`}
                            />
                            {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                        </div>

                        {/* Cascata: Instituição → Órgão → UG */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                                    <FieldTooltip content="Selecione para filtrar órgãos" />
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
                                            <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguardando...'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgaos.map((orgao) => (
                                                <SelectItem key={orgao.id} value={orgao.id}>
                                                    {orgao.codigo} - {orgao.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.orgaoId && <p className="text-sm text-red-500">{errors.orgaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>
                                        Unidade Gestora<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                {loadingUnidades ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.unidadeGestoraId}
                                        onValueChange={(valor) => setFormData({ ...formData, unidadeGestoraId: valor })}
                                        disabled={!formData.orgaoId}
                                    >
                                        <SelectTrigger className={errors.unidadeGestoraId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguardando...'} />
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
                isLoading={saving}
            />
        </div>
    );
}
