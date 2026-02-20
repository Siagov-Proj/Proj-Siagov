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
import { maskCodigoComZeros, maskTelefone } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { setoresService, instituicoesService, orgaosService, unidadesService, IInstituicaoDB, IOrgaoDB, IUnidadeGestoraDB, gerarProximoCodigo } from '@/services/api';

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

export default function NovoSetorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Listas para selects
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);

    // Loading states
    const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [loadingCodigo, setLoadingCodigo] = useState(false);

    // Carregar instituições ao iniciar
    useEffect(() => {
        const carregarInstituicoes = async () => {
            try {
                setLoadingInstituicoes(true);
                const dados = await instituicoesService.listar();
                setInstituicoes(dados);
            } catch (err) {
                console.error('Erro ao carregar instituições:', err);
            } finally {
                setLoadingInstituicoes(false);
            }
        };
        carregarInstituicoes();
    }, []);

    // Carregar órgãos quando a instituição mudar
    useEffect(() => {
        const carregarOrgaos = async () => {
            if (!formData.instituicaoId) {
                setOrgaos([]);
                return;
            }

            try {
                setLoadingOrgaos(true);
                const dados = await orgaosService.listarPorInstituicao(formData.instituicaoId);
                setOrgaos(dados);
            } catch (err) {
                console.error('Erro ao carregar órgãos:', err);
                setOrgaos([]);
            } finally {
                setLoadingOrgaos(false);
            }
        };
        carregarOrgaos();
    }, [formData.instituicaoId]);

    // Carregar unidades quando o órgão mudar
    useEffect(() => {
        const carregarUnidades = async () => {
            if (!formData.orgaoId) {
                setUnidades([]);
                return;
            }

            try {
                setLoadingUnidades(true);
                const dados = await unidadesService.listarPorOrgao(formData.orgaoId);
                setUnidades(dados);
            } catch (err) {
                console.error('Erro ao carregar unidades:', err);
                setUnidades([]);
            } finally {
                setLoadingUnidades(false);
            }
        };
        carregarUnidades();
    }, [formData.orgaoId]);

    // Gerar código quando a Unidade Gestora mudar
    useEffect(() => {
        const gerarCodigo = async () => {
            if (!formData.unidadeGestoraId) return;
            try {
                setLoadingCodigo(true);
                const codigo = await gerarProximoCodigo('setores', 4, 'unidade_gestora_id', formData.unidadeGestoraId);
                setFormData(prev => ({ ...prev, codigo }));
            } catch (err) {
                console.error('Erro ao gerar código:', err);
                setFormData(prev => ({ ...prev, codigo: '0001' }));
            } finally {
                setLoadingCodigo(false);
            }
        };
        gerarCodigo();
    }, [formData.unidadeGestoraId]);

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
            await setoresService.criar({
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
                ativo: true,
            });
            router.push('/cadastros/setores');
        } catch (err) {
            console.error('Erro ao salvar setor:', err);
            alert('Erro ao salvar setor. Tente novamente.');
        } finally {
            setSaving(false);
        }
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
                    <h1 className="text-2xl font-bold tracking-tight">Novo Setor</h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para cadastrar um novo setor
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
                        {/* Linha 1: Vinculação Hierárquica e Código */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                                    <FieldTooltip content="Selecione para filtrar órgãos" />
                                </div>
                                {loadingInstituicoes ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.instituicaoId}
                                        onValueChange={(valor) => setFormData({ ...formData, instituicaoId: valor, orgaoId: '', unidadeGestoraId: '' })}
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
                                )}
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
                                        onValueChange={(valor) => setFormData({ ...formData, orgaoId: valor, unidadeGestoraId: '' })}
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

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">Código<span className="text-red-500 ml-1">*</span></Label>
                                    <FieldTooltip content="Código sugerido automaticamente ao selecionar a UG. Pode ser editado." />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                                    maxLength={4}
                                    placeholder={loadingCodigo ? 'Gerando...' : '0000'}
                                    className={`font-mono ${errors.codigo ? 'border-red-500' : ''}`}
                                    disabled={loadingCodigo}
                                />
                                {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
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
                mode="create"
                isLoading={saving}
            />
        </div>
    );
}
