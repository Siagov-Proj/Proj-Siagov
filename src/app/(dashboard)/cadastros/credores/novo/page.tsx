'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { maskCnpj, maskCpf, maskCep, maskTelefone, maskNitPisPasep, maskInscricaoEstadual } from '@/utils/masks';
import { TIPOS_CREDOR, TIPOS_CONTA_BANCARIA, ESTADOS_BRASIL } from '@/utils/constants';
import type { ICredor } from '@/types';
import { credoresService } from '@/services/api/credoresService';
import { bancosService, IBancoDB } from '@/services/api/bancosService';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSafeSubmit } from '@/hooks/useSafeSubmit';
import { toast } from 'sonner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

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

// Zod Schema para Validação
const credorSchema = z.object({
    tipoCredor: z.enum(['Física', 'Jurídica'], {
        message: 'Tipo de Credor é obrigatório',
    }),
    cadastroRfb: z.string().optional(),
    identificador: z.string().min(1, 'Identificador é obrigatório'),
    nome: z.string().min(1, 'Nome / Razão Social é obrigatório'),
    nomeFantasia: z.string().optional(),
    inscricaoEstadual: z.string().optional(),
    inscricaoMunicipal: z.string().optional(),
    nitPisPasep: z.string().optional(),
    optanteSimples: z.string().optional(),
    dataFinalOpcaoSimples: z.string().optional(),
    optanteCprb: z.string().optional(),
    dataFinalOpcaoCprb: z.string().optional(),
    cpfAdministrador: z.string().optional(),
    nomeAdministrador: z.string().optional(),
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    municipio: z.string().optional(),
    uf: z.string().optional(),
    caixaPostal: z.string().optional(),
    pontoReferencia: z.string().optional(),
    telefone: z.string().optional(),
    telefoneComercial2: z.string().optional(),
    telefoneResidencial: z.string().optional(),
    celular: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    email2: z.string().email('E-mail inválido').optional().or(z.literal('')),
    site: z.string().optional(),
    bancoId: z.string().optional(),
    agencia: z.string().optional(),
    conta: z.string().optional(),
    tipoConta: z.string().optional(),
    situacaoCadastral: z.string().optional(),
    dataSituacaoCadastral: z.string().optional(),
    dataAberturaCnpj: z.string().optional(),
    porteEstabelecimento: z.string().optional(),
    observacoes: z.string().optional(),
    inativo: z.boolean(),
    bloqueado: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.tipoCredor === 'Jurídica' && data.identificador.replace(/\D/g, '').length !== 14) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identificador'],
            message: 'CNPJ inválido (deve conter 14 dígitos)',
        });
    }
    if (data.tipoCredor === 'Física' && data.identificador.replace(/\D/g, '').length !== 11) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['identificador'],
            message: 'CPF inválido (deve conter 11 dígitos)',
        });
    }
});

type CredorFormValues = z.infer<typeof credorSchema>;

export default function NovoCredorPage() {
    const router = useRouter();
    const [abaAtiva, setAbaAtiva] = useState('identificacao');
    const [bancos, setBancos] = useState<IBancoDB[]>([]);
    const [loadingBancos, setLoadingBancos] = useState(true);

    useEffect(() => {
        const fetchBancos = async () => {
            try {
                const response = await bancosService.listar();
                setBancos(response);
            } catch (error) {
                console.error('Erro ao carregar bancos:', error);
            } finally {
                setLoadingBancos(false);
            }
        };
        fetchBancos();
    }, []);

    const form = useForm<CredorFormValues>({
        resolver: zodResolver(credorSchema),
        defaultValues: {
            tipoCredor: undefined as any,
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
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            municipio: '',
            uf: '',
            caixaPostal: '',
            pontoReferencia: '',
            telefone: '',
            telefoneComercial2: '',
            telefoneResidencial: '',
            celular: '',
            email: '',
            email2: '',
            site: '',
            bancoId: '',
            agencia: '',
            conta: '',
            tipoConta: '',
            situacaoCadastral: '',
            dataSituacaoCadastral: '',
            dataAberturaCnpj: '',
            porteEstabelecimento: '',
            observacoes: '',
            inativo: false,
            bloqueado: false,
        },
    });

    const formValues = form.watch();

    const { safeSubmit, isSaving } = useSafeSubmit(async (data: CredorFormValues) => {
        try {
            const commonData: Partial<ICredor> = {
                tipoCredor: data.tipoCredor as ICredor['tipoCredor'],
                cadastroRfb: data.cadastroRfb,
                identificador: data.identificador,
                nome: data.nome,
                nomeFantasia: data.nomeFantasia,
                inscricaoEstadual: data.inscricaoEstadual,
                inscricaoMunicipal: data.inscricaoMunicipal,
                nitPisPasep: data.nitPisPasep,
                email: data.email,
                email2: data.email2,
                telefoneComercial: data.telefone,
                telefoneComercial2: data.telefoneComercial2,
                telefoneResidencial: data.telefoneResidencial,
                telefoneCelular: data.celular,
                site: data.site,
                cep: data.cep,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                municipio: data.municipio,
                uf: data.uf,
                caixaPostal: data.caixaPostal,
                pontoReferencia: data.pontoReferencia,
                bancoId: data.bancoId,
                agencia: data.agencia,
                contaBancaria: data.conta,
                tipoContaBancaria: data.tipoConta as ICredor['tipoContaBancaria'],
                optanteSimples: data.optanteSimples === 'Sim',
                dataFinalOpcaoSimples: data.dataFinalOpcaoSimples ? new Date(data.dataFinalOpcaoSimples) : undefined,
                optanteCprb: data.optanteCprb === 'Sim',
                dataFinalOpcaoCprb: data.dataFinalOpcaoCprb ? new Date(data.dataFinalOpcaoCprb) : undefined,
                cpfAdministrador: data.cpfAdministrador,
                nomeAdministrador: data.nomeAdministrador,
                porteEstabelecimento: data.porteEstabelecimento,
                dataAberturaCnpj: data.dataAberturaCnpj ? new Date(data.dataAberturaCnpj) : undefined,
                situacaoCadastral: data.situacaoCadastral,
                dataSituacaoCadastral: data.dataSituacaoCadastral ? new Date(data.dataSituacaoCadastral) : undefined,
                observacao: data.observacoes,
                inativo: data.inativo,
                bloqueado: data.bloqueado,
            };

            await credoresService.criar(commonData as Omit<ICredor, 'id' | 'createdAt' | 'updatedAt'>);
            toast.success('Credor cadastrado com sucesso!');
            router.push('/cadastros/credores');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar credor. Verifique o console para mais detalhes.');
        }
    });

    const onSubmit = form.handleSubmit(
        (data) => safeSubmit(data),
        (errors) => {
            console.log("Erros de validação:", errors);
            if (errors.tipoCredor || errors.identificador || errors.nome) {
                setAbaAtiva('identificacao');
            }
            toast.error("Preencha todos os campos obrigatórios corretamente.");
        }
    );

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        form.reset();
    };

    const aplicarMascaraDocumento = (valor: string) => {
        if (formValues.tipoCredor === 'Física') {
            return maskCpf(valor);
        }
        return maskCnpj(valor);
    };

    const CharCount = ({ value, max }: { value: string; max: number }) => (
        <p className="text-xs text-muted-foreground text-right mt-1">{value?.length || 0}/{max} caracteres</p>
    );

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" onClick={handleCancelar}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Incluir Novo Credor</h1>
                        <p className="text-muted-foreground">
                            Preencha os dados do credor
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
                            {/* Dados Básicos */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        📋 Dados Básicos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="tipoCredor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Tipo de Credor<span className="text-red-500 ml-1">*</span></FormLabel>
                                                        <FieldTooltip content="Pessoa Física ou Jurídica" />
                                                    </div>
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue('identificador', '');
                                                    }} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {TIPOS_CREDOR.map((t) => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="cadastroRfb"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Cadastro RFB</FormLabel>
                                                        <FieldTooltip content="Tipo de cadastro na Receita Federal do Brasil" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CADASTRO_RFB_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="identificador"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Identificador<span className="text-red-500 ml-1">*</span></FormLabel>
                                                        <FieldTooltip content="CPF ou CNPJ do credor" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            disabled={!formValues.tipoCredor}
                                                            maxLength={formValues.tipoCredor === 'Física' ? 14 : 18}
                                                            placeholder={formValues.tipoCredor === 'Física' ? "000.000.000-00" : "00.000.000/0000-00"}
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(aplicarMascaraDocumento(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={18} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nome"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Nome / Razão Social<span className="text-red-500 ml-1">*</span></FormLabel>
                                                        <FieldTooltip content="Nome completo ou razão social do credor" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={200} placeholder="Nome completo ou razão social" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={200} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="nomeFantasia"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Nome Fantasia</FormLabel>
                                                        <FieldTooltip content="Nome fantasia da empresa (opcional)" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={100} placeholder="Nome fantasia" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={100} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="inscricaoEstadual"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Inscrição Estadual</FormLabel>
                                                        <FieldTooltip content="Número da Inscrição Estadual" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            maxLength={20}
                                                            placeholder="000.000.000.000"
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(maskInscricaoEstadual(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={20} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="inscricaoMunicipal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Inscrição Municipal</FormLabel>
                                                        <FieldTooltip content="Número da Inscrição Municipal" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={20} placeholder="0000000" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={20} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="nitPisPasep"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>NIT / PIS / PASEP</FormLabel>
                                                        <FieldTooltip content="Número de Identificação do Trabalhador" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            maxLength={20}
                                                            placeholder="000.00000.00-0"
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(maskNitPisPasep(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={20} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Regimes Tributários */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        🔥 Regimes Tributários
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="optanteSimples"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Optante Simples</FormLabel>
                                                        <FieldTooltip content="Indicar se o credor é optante pelo Simples Nacional" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {OPTANTE_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dataFinalOpcaoSimples"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Data Final Opção Simples</FormLabel>
                                                        <FieldTooltip content="Data de vigência final da opção pelo Simples Nacional" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="optanteCprb"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Optante CPRB</FormLabel>
                                                        <FieldTooltip content="Indicar se o credor é optante pela CPRB" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {OPTANTE_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dataFinalOpcaoCprb"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Data Final Opção CPRB</FormLabel>
                                                        <FieldTooltip content="Data de vigência final da opção pela CPRB" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Administrador Responsável */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        👤 Administrador(a) Responsável
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cpfAdministrador"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>CPF do Administrador</FormLabel>
                                                        <FieldTooltip content="CPF do administrador responsável" />
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            maxLength={14}
                                                            placeholder="000.000.000-00"
                                                            {...field}
                                                            onChange={(e) => field.onChange(maskCpf(e.target.value))}
                                                            value={field.value || ''}
                                                        />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={14} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="nomeAdministrador"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Nome do Administrador</FormLabel>
                                                        <FieldTooltip content="Nome completo do administrador responsável" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={150} placeholder="Nome completo" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={150} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                      <FormField
                                            control={form.control}
                                            name="cep"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>CEP</FormLabel>
                                                        <FieldTooltip content="Código de Endereçamento Postal" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={10} placeholder="00000-000" {...field} value={field.value || ''} onChange={(e) => field.onChange(maskCep(e.target.value))} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={10} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logradouro"
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-2">
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Logradouro</FormLabel>
                                                        <FieldTooltip content="Rua, Avenida, Travessa, etc." />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={100} placeholder="Rua, Avenida, etc." {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={100} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="numero"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Número</FormLabel>
                                                        <FieldTooltip content="Número do endereço" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={10} placeholder="100" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={10} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="complemento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Complemento</FormLabel>
                                                        <FieldTooltip content="Complemento do endereço" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={50} placeholder="Sala, Bloco, etc." {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={50} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bairro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Bairro</FormLabel>
                                                        <FieldTooltip content="Bairro do endereço" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={80} placeholder="Nome do bairro" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={80} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="municipio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Município</FormLabel>
                                                        <FieldTooltip content="Nome do município" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={80} placeholder="Nome do município" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={80} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="uf"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>UF</FormLabel>
                                                        <FieldTooltip content="Unidade da Federação" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a UF" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {ESTADOS_BRASIL.map((uf) => (
                                                                <SelectItem key={uf.value} value={uf.value}>{uf.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="caixaPostal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Caixa Postal</FormLabel>
                                                        <FieldTooltip content="Número da Caixa Postal" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={20} placeholder="Caixa Postal" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={20} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="pontoReferencia"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Ponto de Referência</FormLabel>
                                                        <FieldTooltip content="Ponto de referência para facilitar a localização" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={200} placeholder="Ponto de referência" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={200} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        <FormField
                                            control={form.control}
                                            name="telefone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Telefone Comercial 1</FormLabel>
                                                        <FieldTooltip content="Telefone comercial principal" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={15} placeholder="(00) 0000-0000" {...field} value={field.value || ''} onChange={(e) => field.onChange(maskTelefone(e.target.value))} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={15} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="telefoneComercial2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Telefone Comercial 2</FormLabel>
                                                        <FieldTooltip content="Telefone comercial secundário" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={15} placeholder="(00) 0000-0000" {...field} value={field.value || ''} onChange={(e) => field.onChange(maskTelefone(e.target.value))} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={15} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="telefoneResidencial"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Telefone Residencial</FormLabel>
                                                        <FieldTooltip content="Telefone residencial" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={15} placeholder="(00) 0000-0000" {...field} value={field.value || ''} onChange={(e) => field.onChange(maskTelefone(e.target.value))} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={15} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="celular"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Telefone Celular</FormLabel>
                                                        <FieldTooltip content="Telefone celular" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={15} placeholder="(00) 00000-0000" {...field} value={field.value || ''} onChange={(e) => field.onChange(maskTelefone(e.target.value))} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={15} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>E-mail Principal</FormLabel>
                                                        <FieldTooltip content="Endereço de e-mail principal" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="email" maxLength={100} placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={100} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>E-mail Secundário</FormLabel>
                                                        <FieldTooltip content="Endereço de e-mail secundário (opcional)" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="email" maxLength={100} placeholder="email2@exemplo.com" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={100} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="site"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Website</FormLabel>
                                                        <FieldTooltip content="Endereço do website" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={100} placeholder="www.exemplo.com.br" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={100} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        <FormField
                                            control={form.control}
                                            name="bancoId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Banco</FormLabel>
                                                        <FieldTooltip content="Selecione o banco" />
                                                        {loadingBancos && <Loader2 className="h-3 w-3 animate-spin" />}
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Selecione o banco" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {bancos.map((b) => (
                                                                <SelectItem key={b.id} value={b.id}>
                                                                    {b.codigo} - {b.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="agencia"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Agência</FormLabel>
                                                        <FieldTooltip content="Número da agência bancária" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={10} placeholder="0000" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={10} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="conta"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Conta Bancária</FormLabel>
                                                        <FieldTooltip content="Número da conta bancária com dígito" />
                                                    </div>
                                                    <FormControl>
                                                        <Input maxLength={20} placeholder="00000-0" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <CharCount value={field.value || ''} max={20} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tipoConta"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Tipo de Conta</FormLabel>
                                                        <FieldTooltip content="Tipo da conta bancária" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {TIPOS_CONTA_BANCARIA.map((t) => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        <FormField
                                            control={form.control}
                                            name="situacaoCadastral"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Situação Cadastral</FormLabel>
                                                        <FieldTooltip content="Situação cadastral do credor na Receita Federal" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {SITUACAO_CADASTRAL_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dataSituacaoCadastral"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Data da Situação</FormLabel>
                                                        <FieldTooltip content="Data da última alteração da situação cadastral" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dataAberturaCnpj"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Data Abertura CNPJ</FormLabel>
                                                        <FieldTooltip content="Data de abertura/constituição da empresa" />
                                                    </div>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="porteEstabelecimento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Porte Estabelecimento PJ</FormLabel>
                                                        <FieldTooltip content="Porte do estabelecimento conforme classificação da Receita Federal" />
                                                    </div>
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full sm:w-1/3">
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PORTE_ESTABELECIMENTO_OPTIONS.map((o) => (
                                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="observacoes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel>Observações</FormLabel>
                                                        <FieldTooltip content="Observações gerais sobre o credor" />
                                                    </div>
                                                    <FormControl>
                                                        <textarea
                                                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            {...field}
                                                            value={field.value || ''}
                                                            placeholder="Observações gerais..."
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-2">
                                        <FormField
                                            control={form.control}
                                            name="inativo"
                                            render={({ field }) => (
                                                <FormItem className="flex items-end gap-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel className="cursor-pointer">Inativo</FormLabel>
                                                        <FieldTooltip content="Marque se o credor estiver inativo" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bloqueado"
                                            render={({ field }) => (
                                                <FormItem className="flex items-end gap-2 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="flex items-center gap-1">
                                                        <FormLabel className="cursor-pointer">Bloqueado</FormLabel>
                                                        <FieldTooltip content="Marque se o credor estiver bloqueado para transações" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={() => {}}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
                isLoading={isSaving}
            />
            </form>
        </Form>
    );
}
