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
import { maskCnpj, maskCep, maskTelefone } from '@/utils/masks';
import { TIPOS_ADMINISTRACAO, GRUPOS_INDIRETA, FIELD_LIMITS } from '@/utils/constants';
import type { IUnidadeGestora } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { unidadesService, instituicoesService, orgaosService, IInstituicaoDB, IOrgaoDB } from '@/services/api';

const emptyFormData = {
    codigo: '',
    instituicaoId: '',
    orgaoId: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    tipoAdministracao: undefined as IUnidadeGestora['tipoAdministracao'] | undefined,
    grupoIndireta: undefined as IUnidadeGestora['grupoIndireta'] | undefined,
    normativaCriacao: '',
    numeroDiarioOficial: '',
    ordenadorDespesa: '',
    emailPrimario: '',
    emailSecundario: '',
    telefone: '',
    ugSiafemSigef: '',
    ugTce: '',
    ugSiasg: '',
    tipoUnidadeGestora: '',
};

export default function EditarUnidadePage() {
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
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            // Carrega unidade e instituições em paralelo
            const [unidade, listaInstituicoes] = await Promise.all([
                unidadesService.buscarPorId(id),
                instituicoesService.listar(),
            ]);

            setInstituicoes(listaInstituicoes);

            if (unidade) {
                // Busca o órgão para pegar o ID da instituição
                let instituicaoId = '';
                if (unidade.orgao_id) {
                    const orgao = await orgaosService.buscarPorId(unidade.orgao_id);
                    if (orgao) {
                        instituicaoId = orgao.instituicao_id || '';
                        // Já carrega a lista de órgãos dessa instituição
                        const listaOrgaos = await orgaosService.listarPorInstituicao(instituicaoId);
                        setOrgaos(listaOrgaos);
                    }
                }

                const data = {
                    codigo: unidade.codigo,
                    instituicaoId: instituicaoId,
                    orgaoId: unidade.orgao_id || '',
                    nome: unidade.nome,
                    nomeAbreviado: unidade.nome_abreviado || '',
                    cnpj: unidade.cnpj || '',
                    cep: unidade.cep || '',
                    logradouro: unidade.logradouro || '',
                    numero: unidade.numero || '',
                    complemento: unidade.complemento || '',
                    bairro: unidade.bairro || '',
                    municipio: unidade.municipio || '',
                    uf: unidade.uf || '',
                    tipoAdministracao: unidade.tipo_administracao as IUnidadeGestora['tipoAdministracao'],
                    grupoIndireta: unidade.grupo_indireta as IUnidadeGestora['grupoIndireta'],
                    normativaCriacao: unidade.normativa_criacao || '',
                    numeroDiarioOficial: unidade.numero_diario_oficial || '',
                    ordenadorDespesa: unidade.ordenador_despesa || '',
                    emailPrimario: unidade.email_primario || '',
                    emailSecundario: unidade.email_secundario || '',
                    telefone: unidade.telefone || '',
                    ugSiafemSigef: unidade.ug_siafem_sigef || '',
                    ugTce: unidade.ug_tce || '',
                    ugSiasg: unidade.ug_siasg || '',
                    tipoUnidadeGestora: unidade.tipo_unidade_gestora || '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                alert('Unidade Gestora não encontrada');
                router.push('/cadastros/unidades');
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            alert('Erro ao carregar dados. Tente novamente.');
            router.push('/cadastros/unidades');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Carregar órgãos quando a instituição mudar manualmente
    const handleInstituicaoChange = async (instituicaoId: string) => {
        setFormData({ ...formData, instituicaoId, orgaoId: '' });
        if (!instituicaoId) {
            setOrgaos([]);
            return;
        }

        try {
            setLoadingOrgaos(true);
            const dados = await orgaosService.listarPorInstituicao(instituicaoId);
            setOrgaos(dados);
        } catch (err) {
            console.error('Erro ao carregar órgãos:', err);
            setOrgaos([]);
        } finally {
            setLoadingOrgaos(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
        if (formData.codigo.length !== 6) newErrors.codigo = 'Código deve ter 6 dígitos';
        if (!formData.instituicaoId) newErrors.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) newErrors.orgaoId = 'Órgão é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.nomeAbreviado) newErrors.nomeAbreviado = 'Sigla é obrigatória';
        if (!formData.tipoAdministracao) newErrors.tipoAdministracao = 'Tipo de administração é obrigatório';
        if (formData.tipoAdministracao === 'Indireta' && !formData.grupoIndireta) {
            newErrors.grupoIndireta = 'Grupo é obrigatório para administração indireta';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await unidadesService.atualizar(params.id as string, {
                codigo: formData.codigo,
                orgao_id: formData.orgaoId,
                nome: formData.nome,
                nome_abreviado: formData.nomeAbreviado,
                cnpj: formData.cnpj,
                cep: formData.cep,
                logradouro: formData.logradouro,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                municipio: formData.municipio,
                uf: formData.uf,
                tipo_administracao: formData.tipoAdministracao,
                grupo_indireta: formData.grupoIndireta,
                normativa_criacao: formData.normativaCriacao,
                numero_diario_oficial: formData.numeroDiarioOficial,
                ordenador_despesa: formData.ordenadorDespesa,
                email_primario: formData.emailPrimario,
                email_secundario: formData.emailSecundario,
                telefone: formData.telefone,
                ug_siafem_sigef: formData.ugSiafemSigef,
                ug_tce: formData.ugTce,
                ug_siasg: formData.ugSiasg,
                tipo_unidade_gestora: formData.tipoUnidadeGestora,
            });
            router.push('/cadastros/unidades');
        } catch (err: any) {
            const errorMsg = err?.message || err?.details || JSON.stringify(err);
            console.error('Erro ao atualizar unidade gestora:', errorMsg, err);
            alert(`Erro ao atualizar unidade gestora: ${errorMsg}`);
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
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = maskCep(e.target.value);
        setFormData({ ...formData, cep });
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
                    <h1 className="text-2xl font-bold tracking-tight">Editar Unidade Gestora</h1>
                    <p className="text-muted-foreground">
                        Edite os dados da unidade gestora
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados Principais</CardTitle>
                    <CardDescription>Informações básicas e vinculação</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* Código */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="codigo">Código</Label>
                                <FieldTooltip content="Código gerado manualmente (6 dígitos)" />
                            </div>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                maxLength={6}
                                placeholder="000000"
                                className={`font-mono w-32 ${errors.codigo ? 'border-red-500' : ''}`}
                            />
                            {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                        </div>

                        {/* Instituição e Órgão */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="instituicaoId">
                                        Instituição<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Selecione a instituição para filtrar os órgãos" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={handleInstituicaoChange}
                                >
                                    <SelectTrigger className={errors.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a instituição" />
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
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="orgaoId">
                                        Órgão<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                {loadingOrgaos ? (
                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.orgaoId}
                                        onValueChange={(value) => setFormData({ ...formData, orgaoId: value })}
                                        disabled={!formData.instituicaoId}
                                    >
                                        <SelectTrigger className={errors.orgaoId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={formData.instituicaoId ? 'Selecione o órgão' : 'Selecione a instituição primeiro'} />
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
                                    placeholder="Nome da unidade"
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
                                    maxLength={FIELD_LIMITS.nomeAbreviado}
                                    placeholder="SIGLA"
                                    className={errors.nomeAbreviado ? 'border-red-500' : ''}
                                />
                                {errors.nomeAbreviado && <p className="text-sm text-red-500">{errors.nomeAbreviado}</p>}
                            </div>
                        </div>

                        {/* Tipo Administração e Grupo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="tipoAdministracao">
                                        Tipo Administração<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Select
                                    value={formData.tipoAdministracao}
                                    onValueChange={(value) => setFormData({
                                        ...formData,
                                        tipoAdministracao: value as IUnidadeGestora['tipoAdministracao'],
                                        grupoIndireta: value === 'Direta' ? undefined : formData.grupoIndireta
                                    })}
                                >
                                    <SelectTrigger className={errors.tipoAdministracao ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_ADMINISTRACAO.map((tipo) => (
                                            <SelectItem key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipoAdministracao && <p className="text-sm text-red-500">{errors.tipoAdministracao}</p>}
                            </div>

                            {formData.tipoAdministracao === 'Indireta' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="grupoIndireta">
                                            Grupo<span className="text-red-500 ml-1">*</span>
                                        </Label>
                                    </div>
                                    <Select
                                        value={formData.grupoIndireta}
                                        onValueChange={(value) => setFormData({ ...formData, grupoIndireta: value as IUnidadeGestora['grupoIndireta'] })}
                                    >
                                        <SelectTrigger className={errors.grupoIndireta ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione o grupo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRUPOS_INDIRETA.map((grupo) => (
                                                <SelectItem key={grupo.value} value={grupo.value}>
                                                    {grupo.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grupoIndireta && <p className="text-sm text-red-500">{errors.grupoIndireta}</p>}
                                </div>
                            )}
                        </div>

                        {/* CNPJ e Ordenador */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                    maxLength={18}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ordenadorDespesa">Ordenador de Despesa</Label>
                                <Input
                                    id="ordenadorDespesa"
                                    value={formData.ordenadorDespesa}
                                    onChange={(e) => setFormData({ ...formData, ordenadorDespesa: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome do ordenador"
                                />
                            </div>
                        </div>

                        {/* Códigos diversos */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ugTce">UG TCE</Label>
                                <Input
                                    id="ugTce"
                                    value={formData.ugTce}
                                    onChange={(e) => setFormData({ ...formData, ugTce: e.target.value.replace(/\D/g, '').substring(0, 5) })}
                                    maxLength={5}
                                    placeholder="00000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ugSiafemSigef">UG SIAFEM/SIGEF</Label>
                                <Input
                                    id="ugSiafemSigef"
                                    value={formData.ugSiafemSigef}
                                    onChange={(e) => setFormData({ ...formData, ugSiafemSigef: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ugSiasg">UG SIASG</Label>
                                <Input
                                    id="ugSiasg"
                                    value={formData.ugSiasg}
                                    onChange={(e) => setFormData({ ...formData, ugSiasg: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* Tipo de Unidade */}
                        <div className="space-y-2">
                            <Label htmlFor="tipoUnidadeGestora">Tipo de Unidade Gestora</Label>
                            <Input
                                id="tipoUnidadeGestora"
                                value={formData.tipoUnidadeGestora}
                                onChange={(e) => setFormData({ ...formData, tipoUnidadeGestora: e.target.value })}
                                maxLength={50}
                                placeholder="Ex: Gestora, Arrecadadora"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Endereço e Contato */}
            <Card>
                <CardHeader>
                    <CardTitle>Endereço e Contato</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* CEP e Logradouro */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-1 space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.cep}
                                    onChange={handleCepChange}
                                    maxLength={9}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="sm:col-span-3 space-y-2">
                                <Label htmlFor="logradouro">Logradouro</Label>
                                <Input
                                    id="logradouro"
                                    value={formData.logradouro}
                                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                                    maxLength={FIELD_LIMITS.logradouro}
                                    placeholder="Rua, Avenida, etc"
                                />
                            </div>
                        </div>

                        {/* Número, Complemento, Bairro */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input
                                    id="numero"
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    maxLength={FIELD_LIMITS.numero}
                                    placeholder="123"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input
                                    id="complemento"
                                    value={formData.complemento}
                                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                    maxLength={FIELD_LIMITS.complemento}
                                    placeholder="Sala 101"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input
                                    id="bairro"
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                    maxLength={FIELD_LIMITS.bairro}
                                    placeholder="Centro"
                                />
                            </div>
                        </div>

                        {/* Município e UF */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-2">
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
                                <Input
                                    id="uf"
                                    value={formData.uf}
                                    onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase().substring(0, 2) })}
                                    maxLength={2}
                                    placeholder="UF"
                                />
                            </div>
                        </div>

                        {/* Contato */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emailPrimario">Email Principal</Label>
                                <Input
                                    id="emailPrimario"
                                    type="email"
                                    value={formData.emailPrimario}
                                    onChange={(e) => setFormData({ ...formData, emailPrimario: e.target.value })}
                                    maxLength={FIELD_LIMITS.email}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailSecundario">Email Secundário</Label>
                                <Input
                                    id="emailSecundario"
                                    type="email"
                                    value={formData.emailSecundario}
                                    onChange={(e) => setFormData({ ...formData, emailSecundario: e.target.value })}
                                    maxLength={FIELD_LIMITS.email}
                                    placeholder="email2@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                    maxLength={FIELD_LIMITS.telefone}
                                    placeholder="(00) 0000-0000"
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
