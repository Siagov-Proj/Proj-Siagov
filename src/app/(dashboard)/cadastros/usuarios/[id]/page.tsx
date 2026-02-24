'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { maskCpf } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import {
    usuariosService,
    instituicoesService,
    orgaosService,
    unidadesService,
    setoresService,
    cargosService,
    IInstituicaoDB,
    IOrgaoDB,
    IUnidadeGestoraDB,
    ISetorDB,
    ICargoDB
} from '@/services/api';

const PERFIS_USUARIO = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'operador', label: 'Operador' },
    { value: 'consulta', label: 'Consulta' },
];

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
    instituicaoId: '',
    orgaoId: '',
    unidadeGestoraId: '',
    ugOrigem: '',
    setorId: '',
    cargoId: '',
    perfilAcesso: '',
    senha: '',
    confirmarSenha: '',
};

export default function EditarUsuarioPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formDataVazio);
    const [originalData, setOriginalData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Listas para selects
    const [instituicoes, setInstituicoes] = useState<IInstituicaoDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [unidades, setUnidades] = useState<IUnidadeGestoraDB[]>([]);
    const [setores, setSetores] = useState<ISetorDB[]>([]);
    const [cargos, setCargos] = useState<ICargoDB[]>([]);
    const [unidadesOrigem, setUnidadesOrigem] = useState<IUnidadeGestoraDB[]>([]);

    // Loading states for dropdowns
    const [loadingOrgaos, setLoadingOrgaos] = useState(false);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [loadingSetores, setLoadingSetores] = useState(false);
    const [loadingCargos, setLoadingCargos] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            const [usuario, listaInstituicoes, listaUnidadesOrigem] = await Promise.all([
                usuariosService.buscarPorId(id),
                instituicoesService.listar(),
                unidadesService.listar()
            ]);

            setInstituicoes(listaInstituicoes);
            setUnidadesOrigem(listaUnidadesOrigem);

            if (usuario) {
                // Carregar dependências em cascata
                if (usuario.instituicao_id) {
                    const listaOrgaos = await orgaosService.listarPorInstituicao(usuario.instituicao_id);
                    setOrgaos(listaOrgaos);
                }

                if (usuario.orgao_id) {
                    const listaUnidades = await unidadesService.listarPorOrgao(usuario.orgao_id);
                    setUnidades(listaUnidades);
                }

                if (usuario.unidade_gestora_id) {
                    const listaSetores = await setoresService.listarPorUnidadeGestora(usuario.unidade_gestora_id);
                    setSetores(listaSetores);
                }

                if (usuario.setor_id) {
                    const listaCargos = await cargosService.listarPorSetor(usuario.setor_id);
                    setCargos(listaCargos);
                }

                const data = {
                    codigo: usuario.codigo,
                    nome: usuario.nome,
                    cpf: maskCpf(usuario.cpf),
                    nomeCredor: usuario.nome_credor || '',
                    matricula: usuario.matricula || '',
                    vinculo: usuario.vinculo || '',
                    emailInstitucional: usuario.email_institucional || '',
                    emailPessoal: usuario.email_pessoal || '',
                    telefone01: usuario.telefone_01 || '',
                    telefoneWhatsApp: usuario.telefone_whatsapp || '',
                    instituicaoId: usuario.instituicao_id || '',
                    orgaoId: usuario.orgao_id || '',
                    unidadeGestoraId: usuario.unidade_gestora_id || '',
                    ugOrigem: usuario.ug_origem_id || '',
                    setorId: usuario.setor_id || '',
                    cargoId: usuario.cargo_id || '',
                    perfilAcesso: usuario.permissoes?.[0] || '',
                    senha: '', // Não carregamos senha
                    confirmarSenha: '',
                };
                setFormData(data);
                setOriginalData(data);
            } else {
                alert('Usuário não encontrado');
                router.push('/cadastros/usuarios');
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            alert('Erro ao carregar dados do usuário. Tente novamente.');
            router.push('/cadastros/usuarios');
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
            setorId: '',
            cargoId: ''
        });
        setOrgaos([]);
        setUnidades([]);
        setSetores([]);
        setCargos([]);

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
            setorId: '',
            cargoId: ''
        });
        setUnidades([]);
        setSetores([]);
        setCargos([]);

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
            setorId: '',
            cargoId: ''
        });
        setSetores([]);
        setCargos([]);

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

    const handleSetorChange = async (setorId: string) => {
        setFormData({
            ...formData,
            setorId,
            cargoId: ''
        });
        setCargos([]);

        if (setorId) {
            try {
                setLoadingCargos(true);
                const data = await cargosService.listarPorSetor(setorId);
                setCargos(data);
            } catch (err) {
                console.error('Erro ao carregar cargos:', err);
            } finally {
                setLoadingCargos(false);
            }
        }
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.codigo) novosErros.codigo = 'Código é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
        if (formData.cpf && formData.cpf.length < 14) novosErros.cpf = 'CPF incompleto';
        if (!formData.emailInstitucional) novosErros.emailInstitucional = 'E-mail Institucional é obrigatório';
        if (!formData.instituicaoId) novosErros.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) novosErros.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) novosErros.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.setorId) novosErros.setorId = 'Setor é obrigatório';

        // Validação de senha só se preenchida
        if (formData.senha) {
            if (formData.senha.length < 8) novosErros.senha = 'Senha deve ter no mínimo 8 caracteres';
            if (formData.senha !== formData.confirmarSenha) {
                novosErros.confirmarSenha = 'As senhas não conferem';
            }
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            await usuariosService.atualizar(params.id as string, {
                codigo: formData.codigo,
                nome: formData.nome,
                cpf: formData.cpf.replace(/\D/g, ''),
                nome_credor: formData.nomeCredor,
                matricula: formData.matricula,
                vinculo: formData.vinculo,
                email_institucional: formData.emailInstitucional,
                email_pessoal: formData.emailPessoal,
                telefone_01: formData.telefone01,
                telefone_whatsapp: formData.telefoneWhatsApp,
                instituicao_id: formData.instituicaoId,
                orgao_id: formData.orgaoId,
                unidade_gestora_id: formData.unidadeGestoraId,
                ug_origem_id: formData.ugOrigem,
                setor_id: formData.setorId,
                cargo_id: formData.cargoId || undefined,
                permissoes: [formData.perfilAcesso].filter(Boolean),
            });
            router.push('/cadastros/usuarios');
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            alert('Erro ao atualizar usuário. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
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
                    <h1 className="text-2xl font-bold tracking-tight">Editar Usuário</h1>
                    <p className="text-muted-foreground">
                        Altere os dados do usuário
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
                                <Label htmlFor="codigo">Código<span className="text-red-500 ml-1">*</span></Label>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.substring(0, 10) })}
                                    maxLength={10}
                                    placeholder="Código"
                                    className={`font-mono w-full ${erros.codigo ? 'border-red-500' : ''}`}
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
                                    placeholder="Preenchido automaticamente..."
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Efetivo">Efetivo</SelectItem>
                                        <SelectItem value="Efetivo-Comissionado">Efetivo-Comissionado</SelectItem>
                                        <SelectItem value="CLT">CLT</SelectItem>
                                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                                        <SelectItem value="Requisitado">Requisitado</SelectItem>
                                        <SelectItem value="Contrato Emergencial">Contrato Emergencial</SelectItem>
                                        <SelectItem value="Prestador de Apoio">Prestador de Apoio</SelectItem>
                                        <SelectItem value="Cargo Eletivo">Cargo Eletivo</SelectItem>
                                        <SelectItem value="Outros">Outros</SelectItem>
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

            <Card>
                <CardHeader>
                    <CardTitle>Lotação</CardTitle>
                    <CardDescription>Hierarquia organizacional do usuário</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                            <Select
                                value={formData.instituicaoId}
                                onValueChange={handleInstituicaoChange}
                            >
                                <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instituicoes.map((inst) => (
                                        <SelectItem key={inst.id} value={inst.id}>{inst.codigo} - {inst.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {erros.instituicaoId && <p className="text-sm text-red-500">{erros.instituicaoId}</p>}
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
                                    <SelectTrigger className={erros.orgaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.instituicaoId ? "Selecione" : "Aguardando..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaos.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>{org.codigo} - {org.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {erros.orgaoId && <p className="text-sm text-red-500">{erros.orgaoId}</p>}
                        </div>

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
                                    <SelectTrigger className={erros.unidadeGestoraId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.orgaoId ? "Selecione" : "Aguardando..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidades.map((ug) => (
                                            <SelectItem key={ug.id} value={ug.id}>{ug.codigo} - {ug.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {erros.unidadeGestoraId && <p className="text-sm text-red-500">{erros.unidadeGestoraId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>UG Origem</Label>
                            <Select
                                value={formData.ugOrigem}
                                onValueChange={(valor) => setFormData({ ...formData, ugOrigem: valor })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidadesOrigem.map((ug) => (
                                        <SelectItem key={ug.id} value={ug.id}>{ug.codigo} - {ug.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Setor<span className="text-red-500 ml-1">*</span></Label>
                            {loadingSetores ? (
                                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Carregando...</span>
                                </div>
                            ) : (
                                <Select
                                    value={formData.setorId}
                                    onValueChange={handleSetorChange}
                                    disabled={!formData.unidadeGestoraId}
                                >
                                    <SelectTrigger className={erros.setorId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.unidadeGestoraId ? "Selecione" : "Aguardando..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {setores.map((setor) => (
                                            <SelectItem key={setor.id} value={setor.id}>{setor.codigo} - {setor.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {erros.setorId && <p className="text-sm text-red-500">{erros.setorId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Cargo</Label>
                            {loadingCargos ? (
                                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Carregando...</span>
                                </div>
                            ) : (
                                <Select
                                    value={formData.cargoId}
                                    onValueChange={(valor) => setFormData({ ...formData, cargoId: valor })}
                                    disabled={!formData.setorId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.setorId ? "Selecione" : "Aguardando..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cargos.map((cargo) => (
                                            <SelectItem key={cargo.id} value={cargo.id}>{cargo.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label>Perfil de Acesso</Label>
                                <FieldTooltip content="Define as permissões do usuário no sistema" />
                            </div>
                            <Select value={formData.perfilAcesso} onValueChange={(v) => setFormData({ ...formData, perfilAcesso: v })}>
                                <SelectTrigger>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>Deixe em branco para manter a senha atual</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="senha">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="senha"
                                    type={mostrarSenha ? 'text' : 'password'}
                                    value={formData.senha}
                                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                                    placeholder="Mínimo 8 caracteres"
                                    className={erros.senha ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {erros.senha && <p className="text-sm text-red-500">{erros.senha}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmarSenha"
                                type={mostrarSenha ? 'text' : 'password'}
                                value={formData.confirmarSenha}
                                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                placeholder="Repita a senha"
                                className={erros.confirmarSenha ? 'border-red-500' : ''}
                            />
                            {erros.confirmarSenha && <p className="text-sm text-red-500">{erros.confirmarSenha}</p>}
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
