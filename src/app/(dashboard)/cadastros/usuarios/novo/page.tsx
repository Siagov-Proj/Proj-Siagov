'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { maskCpf } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import { createUserWithInvite } from '../actions';
import {
    instituicoesService,
    orgaosService,
    unidadesService,
    setoresService,
    cargosService,
    IInstituicaoDB,
    IOrgaoDB,
    IUnidadeGestoraDB,
    ISetorDB,
    ICargoDB,
    gerarProximoCodigo
} from '@/services/api';

const PERFIS_USUARIO = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'operador', label: 'Operador' },
    { value: 'consulta', label: 'Consulta' },
];

// Interface para cada lotação
interface ILotacaoForm {
    instituicaoId: string;
    orgaoId: string;
    unidadeGestoraId: string;
    ugOrigem: string;
    setorId: string;
    cargoId: string;
    perfilAcesso: string;
    // Listas carregadas por cascata
    orgaos: IOrgaoDB[];
    unidades: IUnidadeGestoraDB[];
    setores: ISetorDB[];
    cargos: ICargoDB[];
    // Loading states
    loadingOrgaos: boolean;
    loadingUnidades: boolean;
    loadingSetores: boolean;
    loadingCargos: boolean;
}

const lotacaoVazia: ILotacaoForm = {
    instituicaoId: '',
    orgaoId: '',
    unidadeGestoraId: '',
    ugOrigem: '',
    setorId: '',
    cargoId: '',
    perfilAcesso: '',
    orgaos: [],
    unidades: [],
    setores: [],
    cargos: [],
    loadingOrgaos: false,
    loadingUnidades: false,
    loadingSetores: false,
    loadingCargos: false,
};

const formDataVazio = {
    codigo: '',
    nome: '',
    cpf: '',
    nomeCredor: '',
    matricula: '',
    vinculo: '',
    emailInstitucional: '',
    emailPessoal: '',
    telefone01: '',
    telefoneWhatsApp: '',
};

export default function NovoUsuarioPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [lotacoes, setLotacoes] = useState<ILotacaoForm[]>([{ ...lotacaoVazia }]);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Lista geral
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [unidadesOrigem, setUnidadesOrigem] = useState<IUnidadeGestoraDB[]>([]);
    const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
    const [loadingCodigo, setLoadingCodigo] = useState(true);

    const carregarProximoCodigo = useCallback(async () => {
        try {
            setLoadingCodigo(true);
            const codigo = await gerarProximoCodigo('usuarios', 6);
            setFormData(prev => ({ ...prev, codigo }));
        } catch (err) {
            console.error('Erro ao gerar código:', err);
            setFormData(prev => ({ ...prev, codigo: '000001' }));
        } finally {
            setLoadingCodigo(false);
        }
    }, []);

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                const [listaInstituicoes, listaUnidades] = await Promise.all([
                    instituicoesService.listar(),
                    unidadesService.listar()
                ]);
                setInstituicoes(listaInstituicoes);
                setUnidadesOrigem(listaUnidades);
            } catch (err) {
                console.error('Erro ao carregar dados iniciais:', err);
            } finally {
                setLoadingInstituicoes(false);
            }
        };
        carregarDadosIniciais();
        carregarProximoCodigo();
    }, [carregarProximoCodigo]);

    // --- Handlers de cascata por lotação ---
    const updateLotacao = (index: number, updates: Partial<ILotacaoForm>) => {
        setLotacoes(prev => prev.map((lot, i) => i === index ? { ...lot, ...updates } : lot));
    };

    const handleInstituicaoChange = async (index: number, instituicaoId: string) => {
        updateLotacao(index, {
            instituicaoId,
            orgaoId: '', unidadeGestoraId: '', setorId: '', cargoId: '',
            orgaos: [], unidades: [], setores: [], cargos: [],
        });

        if (instituicaoId) {
            updateLotacao(index, { loadingOrgaos: true });
            try {
                const data = await orgaosService.listarPorInstituicao(instituicaoId);
                updateLotacao(index, { orgaos: data, loadingOrgaos: false });
            } catch {
                updateLotacao(index, { loadingOrgaos: false });
            }
        }
    };

    const handleOrgaoChange = async (index: number, orgaoId: string) => {
        updateLotacao(index, {
            orgaoId,
            unidadeGestoraId: '', setorId: '', cargoId: '',
            unidades: [], setores: [], cargos: [],
        });

        if (orgaoId) {
            updateLotacao(index, { loadingUnidades: true });
            try {
                const data = await unidadesService.listarPorOrgao(orgaoId);
                updateLotacao(index, { unidades: data, loadingUnidades: false });
            } catch {
                updateLotacao(index, { loadingUnidades: false });
            }
        }
    };

    const handleUnidadeChange = async (index: number, unidadeGestoraId: string) => {
        updateLotacao(index, {
            unidadeGestoraId,
            setorId: '', cargoId: '',
            setores: [], cargos: [],
        });

        if (unidadeGestoraId) {
            updateLotacao(index, { loadingSetores: true });
            try {
                const data = await setoresService.listarPorUnidadeGestora(unidadeGestoraId);
                updateLotacao(index, { setores: data, loadingSetores: false });
            } catch {
                updateLotacao(index, { loadingSetores: false });
            }
        }
    };

    const handleSetorChange = async (index: number, setorId: string) => {
        updateLotacao(index, { setorId, cargoId: '', cargos: [] });

        if (setorId) {
            updateLotacao(index, { loadingCargos: true });
            try {
                const data = await cargosService.listarPorSetor(setorId);
                updateLotacao(index, { cargos: data, loadingCargos: false });
            } catch {
                updateLotacao(index, { loadingCargos: false });
            }
        }
    };

    const adicionarLotacao = () => {
        setLotacoes(prev => [...prev, { ...lotacaoVazia }]);
    };

    const removerLotacao = (index: number) => {
        if (lotacoes.length <= 1) return; // Mínimo 1
        setLotacoes(prev => prev.filter((_, i) => i !== index));
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.codigo) novosErros.codigo = 'Código é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
        if (formData.cpf && formData.cpf.length < 14) novosErros.cpf = 'CPF incompleto';
        if (!formData.emailInstitucional) novosErros.emailInstitucional = 'E-mail Institucional é obrigatório';

        lotacoes.forEach((lot, i) => {
            if (!lot.instituicaoId) novosErros[`lotacao_${i}_instituicaoId`] = 'Instituição é obrigatória';
            if (!lot.orgaoId) novosErros[`lotacao_${i}_orgaoId`] = 'Órgão é obrigatório';
            if (!lot.unidadeGestoraId) novosErros[`lotacao_${i}_unidadeGestoraId`] = 'UG é obrigatória';
            if (!lot.setorId) novosErros[`lotacao_${i}_setorId`] = 'Setor é obrigatório';
        });

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            const result = await createUserWithInvite({
                codigo: formData.codigo,
                nome: formData.nome,
                cpf: formData.cpf.replace(/\D/g, ''),
                nomeCredor: formData.nomeCredor,
                matricula: formData.matricula,
                vinculo: formData.vinculo,
                emailInstitucional: formData.emailInstitucional,
                emailPessoal: formData.emailPessoal,
                telefone01: formData.telefone01,
                telefoneWhatsApp: formData.telefoneWhatsApp,
                ativo: true,
                lotacoes: lotacoes.map(lot => ({
                    instituicaoId: lot.instituicaoId,
                    orgaoId: lot.orgaoId,
                    unidadeGestoraId: lot.unidadeGestoraId,
                    setorId: lot.setorId,
                    cargoId: lot.cargoId || undefined,
                    ugOrigemId: lot.ugOrigem || undefined,
                    perfilAcesso: lot.perfilAcesso || 'consulta',
                })),
            });

            if (result.error) {
                if (result.error.toLowerCase().includes('rate limit')) {
                    alert('Limite de envio de emails excedido. Por favor, aguarde alguns minutos ou use outro email.');
                } else {
                    alert(result.error);
                }
                return;
            }

            alert('Usuário criado e convite enviado com sucesso! Verifique a caixa de entrada.');
            router.push('/cadastros/usuarios');
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            alert('Erro inesperado ao criar usuário.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData({ ...formDataVazio, codigo: formData.codigo });
        setLotacoes([{ ...lotacaoVazia }]);
        setErros({});
    };

    // Render de um bloco de lotação
    const renderLotacao = (lot: ILotacaoForm, index: number) => (
        <div key={index} className="relative border rounded-lg p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
            {/* Header com número e botão remover */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">
                    Lotação {index + 1}
                </h4>
                {lotacoes.length > 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8"
                        onClick={() => removerLotacao(index)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                    </Button>
                )}
            </div>

            {/* Linha 1: Instituição e Órgão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                    <Select
                        value={lot.instituicaoId}
                        onValueChange={(val) => handleInstituicaoChange(index, val)}
                    >
                        <SelectTrigger className={`w-full ${erros[`lotacao_${index}_instituicaoId`] ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={loadingInstituicoes ? "Carregando..." : "Selecione"} />
                        </SelectTrigger>
                        <SelectContent>
                            {instituicoes.map((inst) => (
                                <SelectItem key={inst.id} value={inst.id}>{inst.codigo} - {inst.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {erros[`lotacao_${index}_instituicaoId`] && <p className="text-sm text-red-500">{erros[`lotacao_${index}_instituicaoId`]}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Órgão<span className="text-red-500 ml-1">*</span></Label>
                    {lot.loadingOrgaos ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Carregando...</span>
                        </div>
                    ) : (
                        <Select
                            value={lot.orgaoId}
                            onValueChange={(val) => handleOrgaoChange(index, val)}
                            disabled={!lot.instituicaoId}
                        >
                            <SelectTrigger className={`w-full ${erros[`lotacao_${index}_orgaoId`] ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={lot.instituicaoId ? "Selecione" : "Aguardando..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {lot.orgaos.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>{org.codigo} - {org.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {erros[`lotacao_${index}_orgaoId`] && <p className="text-sm text-red-500">{erros[`lotacao_${index}_orgaoId`]}</p>}
                </div>
            </div>

            {/* Linha 2: UG, UG Origem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Unidade Gestora<span className="text-red-500 ml-1">*</span></Label>
                    {lot.loadingUnidades ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Carregando...</span>
                        </div>
                    ) : (
                        <Select
                            value={lot.unidadeGestoraId}
                            onValueChange={(val) => handleUnidadeChange(index, val)}
                            disabled={!lot.orgaoId}
                        >
                            <SelectTrigger className={`w-full ${erros[`lotacao_${index}_unidadeGestoraId`] ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={lot.orgaoId ? "Selecione" : "Aguardando..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {lot.unidades.map((ug) => (
                                    <SelectItem key={ug.id} value={ug.id}>{ug.codigo} - {ug.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {erros[`lotacao_${index}_unidadeGestoraId`] && <p className="text-sm text-red-500">{erros[`lotacao_${index}_unidadeGestoraId`]}</p>}
                </div>

                <div className="space-y-2">
                    <Label>UG Origem</Label>
                    <Select
                        value={lot.ugOrigem}
                        onValueChange={(val) => updateLotacao(index, { ugOrigem: val })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {unidadesOrigem.map((ug) => (
                                <SelectItem key={ug.id} value={ug.id}>{ug.codigo} - {ug.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Linha 3: Setor, Cargo, Perfil */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Setor<span className="text-red-500 ml-1">*</span></Label>
                    {lot.loadingSetores ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Carregando...</span>
                        </div>
                    ) : (
                        <Select
                            value={lot.setorId}
                            onValueChange={(val) => handleSetorChange(index, val)}
                            disabled={!lot.unidadeGestoraId}
                        >
                            <SelectTrigger className={`w-full ${erros[`lotacao_${index}_setorId`] ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={lot.unidadeGestoraId ? "Selecione" : "Aguardando..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {lot.setores.map((setor) => (
                                    <SelectItem key={setor.id} value={setor.id}>{setor.codigo} - {setor.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {erros[`lotacao_${index}_setorId`] && <p className="text-sm text-red-500">{erros[`lotacao_${index}_setorId`]}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Cargo</Label>
                    {lot.loadingCargos ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Carregando...</span>
                        </div>
                    ) : (
                        <Select
                            value={lot.cargoId}
                            onValueChange={(val) => updateLotacao(index, { cargoId: val })}
                            disabled={!lot.setorId}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={lot.setorId ? "Selecione" : "Aguardando..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {lot.cargos.map((cargo) => (
                                    <SelectItem key={cargo.id} value={cargo.id}>{cargo.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label>Perfil de Acesso</Label>
                        <FieldTooltip content="Define as permissões do usuário nesta lotação" />
                    </div>
                    <Select
                        value={lot.perfilAcesso}
                        onValueChange={(val) => updateLotacao(index, { perfilAcesso: val })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {PERFIS_USUARIO.map((perfil) => (
                                <SelectItem key={perfil.value} value={perfil.value}>{perfil.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Usuário</h1>
                    <p className="text-muted-foreground">
                        Cadastro e convite de novo usuário do sistema
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Informações de identificação do usuário</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">Código<span className="text-red-500 ml-1">*</span></Label>
                                    <FieldTooltip content="Código de 6 dígitos gerado automaticamente. Pode ser editado." />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                    maxLength={6}
                                    placeholder={loadingCodigo ? 'Gerando...' : '000001'}
                                    className={`font-mono w-full ${erros.codigo ? 'border-red-500' : ''}`}
                                    disabled={loadingCodigo}
                                />
                                {erros.codigo && <p className="text-sm text-red-500">{erros.codigo}</p>}
                            </div>

                            <div className="space-y-2 sm:col-span-1">
                                <Label htmlFor="nome">
                                    Nome Completo<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome completo do usuário"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpf">
                                    CPF<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="cpf"
                                    value={formData.cpf}
                                    onChange={(e) => {
                                        const novoCpf = maskCpf(e.target.value);
                                        const nomeCredorMock = novoCpf.length === 14 ? formData.nome : '';
                                        setFormData({
                                            ...formData,
                                            cpf: novoCpf,
                                            nomeCredor: formData.nomeCredor || nomeCredorMock
                                        });
                                    }}
                                    maxLength={14}
                                    placeholder="000.000.000-00"
                                    className={erros.cpf ? 'border-red-500' : ''}
                                />
                                {erros.cpf && <p className="text-sm text-red-500">{erros.cpf}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeCredor">Nome do Credor (Auto)</Label>
                                <Input
                                    id="nomeCredor"
                                    value={formData.nomeCredor}
                                    onChange={(e) => setFormData({ ...formData, nomeCredor: e.target.value })}
                                    placeholder="Preenchido automaticamente ou digite"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="matricula">Matrícula</Label>
                                <Input
                                    id="matricula"
                                    value={formData.matricula}
                                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                                    maxLength={20}
                                    placeholder="Matrícula funcional"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vinculo">Vínculo</Label>
                                <Select
                                    value={formData.vinculo}
                                    onValueChange={(valor) => setFormData({ ...formData, vinculo: valor })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Efetivo">Efetivo</SelectItem>
                                        <SelectItem value="Comissionado">Comissionado</SelectItem>
                                        <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emailInstitucional">
                                E-mail Institucional<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="emailInstitucional"
                                type="email"
                                value={formData.emailInstitucional}
                                onChange={(e) => setFormData({ ...formData, emailInstitucional: e.target.value })}
                                maxLength={100}
                                placeholder="email@gov.br"
                                className={erros.emailInstitucional ? 'border-red-500' : ''}
                            />
                            {erros.emailInstitucional && <p className="text-sm text-red-500">{erros.emailInstitucional}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailPessoal">E-mail Pessoal</Label>
                            <Input
                                id="emailPessoal"
                                type="email"
                                value={formData.emailPessoal}
                                onChange={(e) => setFormData({ ...formData, emailPessoal: e.target.value })}
                                maxLength={100}
                                placeholder="pessoal@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefone01">Telefone</Label>
                            <Input
                                id="telefone01"
                                value={formData.telefone01}
                                onChange={(e) => setFormData({ ...formData, telefone01: e.target.value })}
                                maxLength={15}
                                placeholder="(00) 0000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefoneWhatsApp">WhatsApp</Label>
                            <Input
                                id="telefoneWhatsApp"
                                value={formData.telefoneWhatsApp}
                                onChange={(e) => setFormData({ ...formData, telefoneWhatsApp: e.target.value })}
                                maxLength={15}
                                placeholder="(00) 0000-0000"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card de Lotações */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lotação</CardTitle>
                            <CardDescription>Hierarquia organizacional do usuário. É possível vincular a múltiplas instituições.</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={adicionarLotacao}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar Lotação
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {lotacoes.map((lot, index) => renderLotacao(lot, index))}
                    </div>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
                isLoading={saving}
                salvarLabel="Criar e Convidar"
            />
        </div>
    );
}
