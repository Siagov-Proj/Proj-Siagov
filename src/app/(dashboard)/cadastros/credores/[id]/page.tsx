'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { maskCnpj, maskCpf, maskCep, maskTelefone, maskNitPisPasep, maskInscricaoEstadual } from '@/utils/masks';
import { validateCpf, validateCnpj } from '@/utils/formatters';
import { TIPOS_CREDOR, TIPOS_CONTA_BANCARIA, ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import type { ICredor } from '@/types';
import { credoresService } from '@/services/api/credoresService';
import { bancosService, IBancoDB } from '@/services/api/bancosService';

// Opções de Cadastro RFB
const CADASTRO_RFB_OPTIONS = [
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'CEI', label: 'CEI' },
    { value: 'CAEPF', label: 'CAEPF' },
];

// Opções de Situação Cadastral
const SITUACAO_CADASTRAL_OPTIONS = [
    { value: 'Ativa', label: 'Ativa' },
    { value: 'Suspensa', label: 'Suspensa' },
    { value: 'Inapta', label: 'Inapta' },
    { value: 'Baixada', label: 'Baixada' },
    { value: 'Nula', label: 'Nula' },
];

// Opções de Porte do Estabelecimento PJ
const PORTE_ESTABELECIMENTO_OPTIONS = [
    { value: 'MEI', label: 'MEI' },
    { value: 'ME', label: 'Microempresa (ME)' },
    { value: 'EPP', label: 'Empresa de Pequeno Porte (EPP)' },
    { value: 'Medio', label: 'Empresa de Médio Porte' },
    { value: 'Grande', label: 'Empresa de Grande Porte' },
    { value: 'Demais', label: 'Demais' },
];

// Opções de Optante (Select)
const OPTANTE_OPTIONS = [
    { value: 'Sim', label: 'Sim' },
    { value: 'Não', label: 'Não' },
];

const formDataVazio = {
    tipoCredor: '' as ICredor['tipoCredor'] | '',
    cadastroRfb: '',
    identificador: '',
    nome: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    nitPisPasep: '',
    optanteSimples: '',
    dataFinalOpcaoSimples: '',
    optanteCprb: '',
    dataFinalOpcaoCprb: '',
    cpfAdministrador: '',
    nomeAdministrador: '',
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    caixaPostal: '',
    pontoReferencia: '',
    // Contato
    telefone: '',
    telefoneComercial2: '',
    telefoneResidencial: '',
    celular: '',
    email: '',
    email2: '',
    site: '',
    // Bancários
    bancoId: '',
    agencia: '',
    conta: '',
    tipoConta: '' as ICredor['tipoContaBancaria'] | '',
    // Complementares
    situacaoCadastral: '',
    dataSituacaoCadastral: '',
    dataAberturaCnpj: '',
    porteEstabelecimento: '',
    observacoes: '',
    inativo: false,
    bloqueado: false,
};

export default function EditarCredorPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formDataVazio);
    const [originalData, setOriginalData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [abaAtiva, setAbaAtiva] = useState('identificacao');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bancos, setBancos] = useState<IBancoDB[]>([]);
    const [loadingBancos, setLoadingBancos] = useState(true);

    useEffect(() => {
        carregarBancos();
    }, []);

    const carregarBancos = async () => {
        try {
            setLoadingBancos(true);
            const data = await bancosService.listar();
            setBancos(data);
        } catch (error) {
            console.error('Erro ao carregar bancos:', error);
        } finally {
            setLoadingBancos(false);
        }
    };

    useEffect(() => {
        const carregarCredor = async () => {
            try {
                const id = params.id as string;
                const credor = await credoresService.buscarPorId(id);

                if (credor) {
                    const data = {
                        tipoCredor: credor.tipoCredor,
                        cadastroRfb: credor.cadastroRfb || '',
                        identificador: credor.identificador,
                        nome: credor.nome,
                        nomeFantasia: credor.nomeFantasia || '',
                        inscricaoEstadual: credor.inscricaoEstadual || '',
                        inscricaoMunicipal: credor.inscricaoMunicipal || '',
                        nitPisPasep: credor.nitPisPasep || '',
                        optanteSimples: credor.optanteSimples ? 'Sim' : 'Não',
                        dataFinalOpcaoSimples: credor.dataFinalOpcaoSimples ? new Date(credor.dataFinalOpcaoSimples).toISOString().split('T')[0] : '',
                        optanteCprb: credor.optanteCprb ? 'Sim' : 'Não',
                        dataFinalOpcaoCprb: credor.dataFinalOpcaoCprb ? new Date(credor.dataFinalOpcaoCprb).toISOString().split('T')[0] : '',
                        cpfAdministrador: credor.cpfAdministrador || '',
                        nomeAdministrador: credor.nomeAdministrador || '',
                        email: credor.email || '',
                        email2: credor.email2 || '',
                        telefone: credor.telefoneComercial || '',
                        telefoneComercial2: credor.telefoneComercial2 || '',
                        telefoneResidencial: credor.telefoneResidencial || '',
                        celular: credor.telefoneCelular || '',
                        site: credor.site || '',
                        cep: credor.cep || '',
                        logradouro: credor.logradouro || '',
                        numero: credor.numero || '',
                        complemento: credor.complemento || '',
                        bairro: credor.bairro || '',
                        municipio: credor.municipio || '',
                        uf: credor.uf || '',
                        caixaPostal: credor.caixaPostal || '',
                        pontoReferencia: credor.pontoReferencia || '',
                        bancoId: credor.bancoId || '',
                        agencia: credor.agencia || '',
                        conta: credor.contaBancaria || '',
                        tipoConta: (credor.tipoContaBancaria || '') as ICredor['tipoContaBancaria'] | '',
                        porteEstabelecimento: credor.porteEstabelecimento || '',
                        dataAberturaCnpj: credor.dataAberturaCnpj ? new Date(credor.dataAberturaCnpj).toISOString().split('T')[0] : '',
                        situacaoCadastral: credor.situacaoCadastral || '',
                        dataSituacaoCadastral: credor.dataSituacaoCadastral ? new Date(credor.dataSituacaoCadastral).toISOString().split('T')[0] : '',
                        observacoes: credor.observacao || '',
                        inativo: credor.inativo || false,
                        bloqueado: credor.bloqueado || false,
                    };
                    setFormData(data);
                    setOriginalData(data);
                }
            } catch (error) {
                console.error('Erro ao carregar credor:', error);
                alert('Erro ao carregar dados do credor.');
            } finally {
                setLoading(false);
            }
        };

        carregarCredor();
    }, [params.id]);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.tipoCredor) novosErros.tipo = 'Tipo de Credor é obrigatório';
        if (!formData.identificador) novosErros.cpfCnpj = 'Identificador é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome/Razão Social é obrigatório';

        const digits = formData.identificador.replace(/\D/g, '');
        if (formData.tipoCredor === 'Jurídica') {
            if (digits.length !== 14) {
                novosErros.cpfCnpj = 'CNPJ inválido (deve conter 14 dígitos)';
            } else if (!validateCnpj(formData.identificador)) {
                novosErros.cpfCnpj = 'CNPJ inválido. Verifique os dígitos informados.';
            }
        }
        if (formData.tipoCredor === 'Física') {
            if (digits.length !== 11) {
                novosErros.cpfCnpj = 'CPF inválido (deve conter 11 dígitos)';
            } else if (!validateCpf(formData.identificador)) {
                novosErros.cpfCnpj = 'CPF inválido. Verifique os dígitos informados.';
            }
        }

        // Valida CPF do administrador se preenchido
        if (formData.cpfAdministrador) {
            const adminDigits = formData.cpfAdministrador.replace(/\D/g, '');
            if (adminDigits.length === 11 && !validateCpf(formData.cpfAdministrador)) {
                novosErros.cpfAdministrador = 'CPF do Administrador inválido. Verifique os dígitos.';
            }
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            if (novosErros.tipo || novosErros.cpfCnpj || novosErros.nome || novosErros.cpfAdministrador) {
                setAbaAtiva('identificacao');
            }
        }

        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        setSaving(true);

        const commonData: Partial<ICredor> = {
            tipoCredor: formData.tipoCredor as ICredor['tipoCredor'],
            cadastroRfb: formData.cadastroRfb,
            identificador: formData.identificador,
            nome: formData.nome,
            nomeFantasia: formData.nomeFantasia,
            inscricaoEstadual: formData.inscricaoEstadual,
            inscricaoMunicipal: formData.inscricaoMunicipal,
            nitPisPasep: formData.nitPisPasep,
            email: formData.email,
            email2: formData.email2,
            telefoneComercial: formData.telefone,
            telefoneComercial2: formData.telefoneComercial2,
            telefoneResidencial: formData.telefoneResidencial,
            telefoneCelular: formData.celular,
            site: formData.site,
            cep: formData.cep,
            logradouro: formData.logradouro,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            municipio: formData.municipio,
            uf: formData.uf,
            caixaPostal: formData.caixaPostal,
            pontoReferencia: formData.pontoReferencia,
            bancoId: formData.bancoId,
            agencia: formData.agencia,
            contaBancaria: formData.conta,
            tipoContaBancaria: formData.tipoConta as ICredor['tipoContaBancaria'],
            optanteSimples: formData.optanteSimples === 'Sim',
            dataFinalOpcaoSimples: formData.dataFinalOpcaoSimples ? new Date(formData.dataFinalOpcaoSimples) : undefined,
            optanteCprb: formData.optanteCprb === 'Sim',
            dataFinalOpcaoCprb: formData.dataFinalOpcaoCprb ? new Date(formData.dataFinalOpcaoCprb) : undefined,
            cpfAdministrador: formData.cpfAdministrador,
            nomeAdministrador: formData.nomeAdministrador,
            porteEstabelecimento: formData.porteEstabelecimento,
            dataAberturaCnpj: formData.dataAberturaCnpj ? new Date(formData.dataAberturaCnpj) : undefined,
            situacaoCadastral: formData.situacaoCadastral,
            dataSituacaoCadastral: formData.dataSituacaoCadastral ? new Date(formData.dataSituacaoCadastral) : undefined,
            observacao: formData.observacoes,
            inativo: formData.inativo,
            bloqueado: formData.bloqueado,
        };

        try {
            await credoresService.atualizar(params.id as string, commonData);
            alert('Credor atualizado com sucesso!');
            router.push('/cadastros/credores');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar credor. Verifique o console para mais detalhes.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setErros({});
    };

    const aplicarMascaraDocumento = (valor: string) => {
        if (formData.tipoCredor === 'Física') {
            return maskCpf(valor);
        }
        return maskCnpj(valor);
    };

    const CharCount = ({ value, max }: { value: string; max: number }) => (
        <p className="text-xs text-muted-foreground text-right mt-1">{value.length}/{max} caracteres</p>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
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
                    <h1 className="text-2xl font-bold tracking-tight">Editar Credor</h1>
                    <p className="text-muted-foreground">
                        Altere os dados do credor
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                            <TabsTrigger value="identificacao">01 - Identificação</TabsTrigger>
                            <TabsTrigger value="endereco">02 - Endereço</TabsTrigger>
                            <TabsTrigger value="contato">03 - Contato</TabsTrigger>
                            <TabsTrigger value="bancarios">04 - Dados Bancários</TabsTrigger>
                            <TabsTrigger value="complementares">05 - Complementares</TabsTrigger>
                        </TabsList>

                        {/* ===== ABA 01 - IDENTIFICAÇÃO ===== */}
                        <TabsContent value="identificacao" className="space-y-8">
                            {/* Seção: Dados Básicos */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        📋 Dados Básicos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Tipo de Credor, Cadastro RFB, Identificador */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Tipo de Credor<span className="text-red-500 ml-1">*</span></Label>
                                                <FieldTooltip content="Pessoa Física ou Jurídica" />
                                            </div>
                                            <Select
                                                value={formData.tipoCredor}
                                                onValueChange={(v) =>
                                                    setFormData({ ...formData, tipoCredor: v as ICredor['tipoCredor'], identificador: '' })
                                                }
                                                disabled={true}
                                            >
                                                <SelectTrigger className={erros.tipo ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIPOS_CREDOR.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {erros.tipo && <p className="text-sm text-red-500">{erros.tipo}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Cadastro RFB<span className="text-red-500 ml-1">*</span></Label>
                                                <FieldTooltip content="Tipo de cadastro na Receita Federal do Brasil" />
                                            </div>
                                            <Select
                                                value={formData.cadastroRfb}
                                                onValueChange={(v) => setFormData({ ...formData, cadastroRfb: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CADASTRO_RFB_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Identificador<span className="text-red-500 ml-1">*</span></Label>
                                                <FieldTooltip content="CPF ou CNPJ do credor (não pode ser alterado)" />
                                            </div>
                                            <Input
                                                value={formData.identificador}
                                                disabled={true}
                                                className="bg-muted"
                                                placeholder="000.000.000-00"
                                            />
                                            <CharCount value={formData.identificador} max={18} />
                                            {erros.cpfCnpj && <p className="text-sm text-red-500">{erros.cpfCnpj}</p>}
                                        </div>
                                    </div>

                                    {/* Nome / Razão Social, Nome Fantasia */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Nome / Razão Social<span className="text-red-500 ml-1">*</span></Label>
                                                <FieldTooltip content="Nome completo ou razão social do credor" />
                                            </div>
                                            <Input
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                maxLength={200}
                                                placeholder="Nome completo ou razão social"
                                                className={erros.nome ? 'border-red-500' : ''}
                                            />
                                            <CharCount value={formData.nome} max={200} />
                                            {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Nome Fantasia</Label>
                                                <FieldTooltip content="Nome fantasia da empresa (opcional)" />
                                            </div>
                                            <Input
                                                value={formData.nomeFantasia}
                                                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                                                maxLength={100}
                                                placeholder="Nome fantasia"
                                            />
                                            <CharCount value={formData.nomeFantasia} max={100} />
                                        </div>
                                    </div>

                                    {/* Inscrição Estadual, Inscrição Municipal, NIT/PIS/PASEP */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Inscrição Estadual</Label>
                                                <FieldTooltip content="Número da Inscrição Estadual" />
                                            </div>
                                            <Input
                                                value={formData.inscricaoEstadual}
                                                onChange={(e) => setFormData({ ...formData, inscricaoEstadual: maskInscricaoEstadual(e.target.value) })}
                                                maxLength={20}
                                                placeholder="000.000.000.000"
                                            />
                                            <CharCount value={formData.inscricaoEstadual} max={20} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Inscrição Municipal</Label>
                                                <FieldTooltip content="Número da Inscrição Municipal" />
                                            </div>
                                            <Input
                                                value={formData.inscricaoMunicipal}
                                                onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                                                maxLength={20}
                                                placeholder="0000000"
                                            />
                                            <CharCount value={formData.inscricaoMunicipal} max={20} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>NIT / PIS / PASEP</Label>
                                                <FieldTooltip content="Número de Identificação do Trabalhador" />
                                            </div>
                                            <Input
                                                value={formData.nitPisPasep}
                                                onChange={(e) => setFormData({ ...formData, nitPisPasep: maskNitPisPasep(e.target.value) })}
                                                maxLength={20}
                                                placeholder="000.00000.00-0"
                                            />
                                            <CharCount value={formData.nitPisPasep} max={20} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seção: Regimes Tributários */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        🔥 Regimes Tributários
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Optante Simples</Label>
                                                <FieldTooltip content="Indicar se o credor é optante pelo Simples Nacional" />
                                            </div>
                                            <Select
                                                value={formData.optanteSimples}
                                                onValueChange={(v) => setFormData({ ...formData, optanteSimples: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPTANTE_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Data Final Opção Simples</Label>
                                                <FieldTooltip content="Data de vigência final da opção pelo Simples Nacional" />
                                            </div>
                                            <Input
                                                type="date"
                                                value={formData.dataFinalOpcaoSimples}
                                                onChange={(e) => setFormData({ ...formData, dataFinalOpcaoSimples: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Optante CPRB</Label>
                                                <FieldTooltip content="Indicar se o credor é optante pela CPRB" />
                                            </div>
                                            <Select
                                                value={formData.optanteCprb}
                                                onValueChange={(v) => setFormData({ ...formData, optanteCprb: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPTANTE_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Data Final Opção CPRB</Label>
                                                <FieldTooltip content="Data de vigência final da opção pela CPRB" />
                                            </div>
                                            <Input
                                                type="date"
                                                value={formData.dataFinalOpcaoCprb}
                                                onChange={(e) => setFormData({ ...formData, dataFinalOpcaoCprb: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seção: Administrador(a) Responsável */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        👤 Administrador(a) Responsável
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>CPF do Administrador</Label>
                                                <FieldTooltip content="CPF do administrador responsável" />
                                            </div>
                                            <Input
                                                value={formData.cpfAdministrador}
                                                onChange={(e) => setFormData({ ...formData, cpfAdministrador: maskCpf(e.target.value) })}
                                                maxLength={14}
                                                placeholder="000.000.000-00"
                                            />
                                            <CharCount value={formData.cpfAdministrador} max={14} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Nome do Administrador</Label>
                                                <FieldTooltip content="Nome completo do administrador responsável" />
                                            </div>
                                            <Input
                                                value={formData.nomeAdministrador}
                                                onChange={(e) => setFormData({ ...formData, nomeAdministrador: e.target.value })}
                                                maxLength={150}
                                                placeholder="Nome completo"
                                            />
                                            <CharCount value={formData.nomeAdministrador} max={150} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== ABA 02 - ENDEREÇO ===== */}
                        <TabsContent value="endereco" className="space-y-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        📍 Endereço
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>CEP</Label>
                                                <FieldTooltip content="Código de Endereçamento Postal" />
                                            </div>
                                            <Input
                                                value={formData.cep}
                                                onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                                                maxLength={10}
                                                placeholder="00000-000"
                                            />
                                            <CharCount value={formData.cep} max={10} />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Logradouro</Label>
                                                <FieldTooltip content="Rua, Avenida, Travessa, etc." />
                                            </div>
                                            <Input
                                                value={formData.logradouro}
                                                onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                                                maxLength={100}
                                                placeholder="Rua, Avenida, etc."
                                            />
                                            <CharCount value={formData.logradouro} max={100} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Número</Label>
                                                <FieldTooltip content="Número do endereço" />
                                            </div>
                                            <Input
                                                value={formData.numero}
                                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                                maxLength={10}
                                                placeholder="100"
                                            />
                                            <CharCount value={formData.numero} max={10} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Complemento</Label>
                                                <FieldTooltip content="Complemento do endereço (Sala, Bloco, etc.)" />
                                            </div>
                                            <Input
                                                value={formData.complemento}
                                                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                                maxLength={50}
                                                placeholder="Sala, Bloco, etc."
                                            />
                                            <CharCount value={formData.complemento} max={50} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Bairro</Label>
                                                <FieldTooltip content="Bairro do endereço" />
                                            </div>
                                            <Input
                                                value={formData.bairro}
                                                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                                maxLength={80}
                                                placeholder="Nome do bairro"
                                            />
                                            <CharCount value={formData.bairro} max={80} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Município</Label>
                                                <FieldTooltip content="Nome do município" />
                                            </div>
                                            <Input
                                                value={formData.municipio}
                                                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                                                maxLength={80}
                                                placeholder="Nome do município"
                                            />
                                            <CharCount value={formData.municipio} max={80} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>UF</Label>
                                                <FieldTooltip content="Unidade da Federação" />
                                            </div>
                                            <Select
                                                value={formData.uf}
                                                onValueChange={(v) => setFormData({ ...formData, uf: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a UF" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ESTADOS_BRASIL.map((uf) => (
                                                        <SelectItem key={uf.value} value={uf.value}>{uf.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Caixa Postal</Label>
                                                <FieldTooltip content="Número da Caixa Postal" />
                                            </div>
                                            <Input
                                                value={formData.caixaPostal}
                                                onChange={(e) => setFormData({ ...formData, caixaPostal: e.target.value })}
                                                maxLength={20}
                                                placeholder="Caixa Postal"
                                            />
                                            <CharCount value={formData.caixaPostal} max={20} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Ponto de Referência</Label>
                                                <FieldTooltip content="Ponto de referência para facilitar a localização" />
                                            </div>
                                            <Input
                                                value={formData.pontoReferencia}
                                                onChange={(e) => setFormData({ ...formData, pontoReferencia: e.target.value })}
                                                maxLength={200}
                                                placeholder="Ponto de referência"
                                            />
                                            <CharCount value={formData.pontoReferencia} max={200} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== ABA 03 - CONTATO ===== */}
                        <TabsContent value="contato" className="space-y-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        📞 Informações de Contato
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Telefone Comercial 1</Label>
                                                <FieldTooltip content="Telefone comercial principal" />
                                            </div>
                                            <Input
                                                value={formData.telefone}
                                                onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                                maxLength={15}
                                                placeholder="(00) 0000-0000"
                                            />
                                            <CharCount value={formData.telefone} max={15} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Telefone Comercial 2</Label>
                                                <FieldTooltip content="Telefone comercial secundário" />
                                            </div>
                                            <Input
                                                value={formData.telefoneComercial2}
                                                onChange={(e) => setFormData({ ...formData, telefoneComercial2: maskTelefone(e.target.value) })}
                                                maxLength={15}
                                                placeholder="(00) 0000-0000"
                                            />
                                            <CharCount value={formData.telefoneComercial2} max={15} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Telefone Residencial</Label>
                                                <FieldTooltip content="Telefone residencial" />
                                            </div>
                                            <Input
                                                value={formData.telefoneResidencial}
                                                onChange={(e) => setFormData({ ...formData, telefoneResidencial: maskTelefone(e.target.value) })}
                                                maxLength={15}
                                                placeholder="(00) 0000-0000"
                                            />
                                            <CharCount value={formData.telefoneResidencial} max={15} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Telefone Celular</Label>
                                                <FieldTooltip content="Telefone celular" />
                                            </div>
                                            <Input
                                                value={formData.celular}
                                                onChange={(e) => setFormData({ ...formData, celular: maskTelefone(e.target.value) })}
                                                maxLength={15}
                                                placeholder="(00) 00000-0000"
                                            />
                                            <CharCount value={formData.celular} max={15} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>E-mail Principal</Label>
                                                <FieldTooltip content="Endereço de e-mail principal" />
                                            </div>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                                                maxLength={100}
                                                placeholder="email@exemplo.com"
                                            />
                                            <CharCount value={formData.email} max={100} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>E-mail Secundário</Label>
                                                <FieldTooltip content="Endereço de e-mail secundário (opcional)" />
                                            </div>
                                            <Input
                                                type="email"
                                                value={formData.email2}
                                                onChange={(e) => setFormData({ ...formData, email2: e.target.value.toLowerCase() })}
                                                maxLength={100}
                                                placeholder="email2@exemplo.com"
                                            />
                                            <CharCount value={formData.email2} max={100} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <Label>Website</Label>
                                            <FieldTooltip content="Endereço do website" />
                                        </div>
                                        <Input
                                            value={formData.site}
                                            onChange={(e) => setFormData({ ...formData, site: e.target.value.toLowerCase() })}
                                            maxLength={100}
                                            placeholder="www.exemplo.com.br"
                                        />
                                        <CharCount value={formData.site} max={100} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== ABA 04 - DADOS BANCÁRIOS ===== */}
                        <TabsContent value="bancarios" className="space-y-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        🏦 Informações Bancárias
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <Label>Banco</Label>
                                            <FieldTooltip content="Selecione o banco" />
                                            {loadingBancos && <Loader2 className="h-3 w-3 animate-spin" />}
                                        </div>
                                        <Select
                                            value={formData.bancoId}
                                            onValueChange={(v) => {
                                                setFormData({
                                                    ...formData,
                                                    bancoId: v,
                                                    agencia: '',
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione o banco" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bancos.map((b) => (
                                                    <SelectItem key={b.id} value={b.id}>
                                                        {b.codigo} - {b.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Agência</Label>
                                                <FieldTooltip content="Número da agência bancária" />
                                            </div>
                                            <Input
                                                value={formData.agencia}
                                                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                                                maxLength={10}
                                                placeholder="0000"
                                            />
                                            <CharCount value={formData.agencia} max={10} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Conta Bancária</Label>
                                                <FieldTooltip content="Número da conta bancária com dígito" />
                                            </div>
                                            <Input
                                                value={formData.conta}
                                                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                                                maxLength={20}
                                                placeholder="00000-0"
                                            />
                                            <CharCount value={formData.conta} max={20} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Tipo de Conta</Label>
                                                <FieldTooltip content="Tipo da conta bancária" />
                                            </div>
                                            <Select
                                                value={formData.tipoConta}
                                                onValueChange={(v) => setFormData({ ...formData, tipoConta: v as ICredor['tipoContaBancaria'] })}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIPOS_CONTA_BANCARIA.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ===== ABA 05 - COMPLEMENTARES ===== */}
                        <TabsContent value="complementares" className="space-y-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        📎 Informações Complementares
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Situação Cadastral</Label>
                                                <FieldTooltip content="Situação cadastral do credor na Receita Federal" />
                                            </div>
                                            <Select
                                                value={formData.situacaoCadastral}
                                                onValueChange={(v) => setFormData({ ...formData, situacaoCadastral: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SITUACAO_CADASTRAL_OPTIONS.map((o) => (
                                                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Data da Situação</Label>
                                                <FieldTooltip content="Data da última alteração da situação cadastral" />
                                            </div>
                                            <Input
                                                type="date"
                                                value={formData.dataSituacaoCadastral}
                                                onChange={(e) => setFormData({ ...formData, dataSituacaoCadastral: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Data Abertura CNPJ</Label>
                                                <FieldTooltip content="Data de abertura/constituição da empresa" />
                                            </div>
                                            <Input
                                                type="date"
                                                value={formData.dataAberturaCnpj}
                                                onChange={(e) => setFormData({ ...formData, dataAberturaCnpj: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <Label>Porte Estabelecimento PJ</Label>
                                            <FieldTooltip content="Porte do estabelecimento conforme classificação da Receita Federal" />
                                        </div>
                                        <Select
                                            value={formData.porteEstabelecimento}
                                            onValueChange={(v) => setFormData({ ...formData, porteEstabelecimento: v })}
                                        >
                                            <SelectTrigger className="w-full sm:w-1/3">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PORTE_ESTABELECIMENTO_OPTIONS.map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <Label>Observações</Label>
                                            <FieldTooltip content="Observações gerais sobre o credor" />
                                        </div>
                                        <textarea
                                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={formData.observacoes}
                                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                            placeholder="Observações gerais..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="inativo"
                                                checked={formData.inativo}
                                                onCheckedChange={(v) => setFormData({ ...formData, inativo: v as boolean })}
                                            />
                                            <Label htmlFor="inativo" className="cursor-pointer">Inativo</Label>
                                            <FieldTooltip content="Marque se o credor estiver inativo" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="bloqueado"
                                                checked={formData.bloqueado}
                                                onCheckedChange={(v) => setFormData({ ...formData, bloqueado: v as boolean })}
                                            />
                                            <Label htmlFor="bloqueado" className="cursor-pointer">Bloqueado</Label>
                                            <FieldTooltip content="Marque se o credor estiver bloqueado para transações" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
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
