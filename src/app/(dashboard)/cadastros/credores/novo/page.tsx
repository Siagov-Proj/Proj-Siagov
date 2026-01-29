'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Wallet, User, Building, MapPin, CreditCard, FileText, Loader2 } from 'lucide-react';
import { maskCnpj, maskCpf, maskCep, maskTelefone, maskNitPisPasep, maskInscricaoEstadual } from '@/utils/masks';
import { TIPOS_CREDOR, TIPOS_CONTA_BANCARIA, ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import type { ICredor } from '@/types';
import { credoresService } from '@/services/api/credoresService';

// Mock de bancos
const mockBancos = [
    { id: '1', codigo: '001', nome: 'Banco do Brasil' },
    { id: '2', codigo: '104', nome: 'Caixa Econômica Federal' },
    { id: '3', codigo: '341', nome: 'Itaú Unibanco' },
    { id: '4', codigo: '033', nome: 'Santander' },
    { id: '5', codigo: '237', nome: 'Bradesco' },
];

// Estado vazio do formulário
const formDataVazio = {
    tipoCredor: '' as ICredor['tipoCredor'] | '',
    identificador: '',
    nome: '',
    nomeFantasia: '',
    naturezaJuridica: '',
    optanteSimples: false,
    dataFinalOpcaoSimples: '',
    optanteCprb: false,
    dataFinalOpcaoCprb: '',
    cpfAdministrador: '',
    nomeAdministrador: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    nitPisPasep: '',
    rg: '',
    orgaoEmissorRg: '',
    dataEmissaoRg: '',
    email: '',
    email2: '',
    telefone: '',
    telefoneComercial2: '',
    telefoneResidencial: '',
    celular: '',
    fax: '',
    site: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    caixaPostal: '',
    pontoReferencia: '',
    bancoId: '',
    agencia: '',
    digitoAgencia: '',
    conta: '',
    digitoConta: '',
    tipoConta: '' as ICredor['tipoContaBancaria'] | '',
    chavePix: '',
    tipoChavePix: '',
    porteEstabelecimento: '',
    dataAberturaCnpj: '',
    situacaoCadastral: '',
    dataSituacaoCadastral: '',
    observacoes: '',
};

export default function NovoCredorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [abaAtiva, setAbaAtiva] = useState('identificacao');
    const [saving, setSaving] = useState(false);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.tipoCredor) novosErros.tipo = 'Tipo é obrigatório';
        if (!formData.identificador) novosErros.cpfCnpj = 'CPF/CNPJ é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';

        if (formData.tipoCredor === 'Jurídica' && formData.identificador.length !== 18) {
            novosErros.cpfCnpj = 'CNPJ inválido';
        }
        if (formData.tipoCredor === 'Física' && formData.identificador.length !== 14) {
            novosErros.cpfCnpj = 'CPF inválido';
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            if (novosErros.tipo || novosErros.cpfCnpj || novosErros.nome) {
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
            identificador: formData.identificador,
            nome: formData.nome,
            nomeFantasia: formData.nomeFantasia,
            naturezaJuridica: formData.naturezaJuridica,
            inscricaoEstadual: formData.inscricaoEstadual,
            inscricaoMunicipal: formData.inscricaoMunicipal,
            nitPisPasep: formData.nitPisPasep,
            rg: formData.rg,
            orgaoEmissorRg: formData.orgaoEmissorRg,
            dataEmissaoRg: formData.dataEmissaoRg ? new Date(formData.dataEmissaoRg) : undefined,
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
            digitoAgencia: formData.digitoAgencia,
            contaBancaria: formData.conta,
            digitoConta: formData.digitoConta,
            tipoContaBancaria: formData.tipoConta as ICredor['tipoContaBancaria'],
            optanteSimples: formData.optanteSimples,
            dataFinalOpcaoSimples: formData.dataFinalOpcaoSimples ? new Date(formData.dataFinalOpcaoSimples) : undefined,
            optanteCprb: formData.optanteCprb,
            dataFinalOpcaoCprb: formData.dataFinalOpcaoCprb ? new Date(formData.dataFinalOpcaoCprb) : undefined,
            cpfAdministrador: formData.cpfAdministrador,
            nomeAdministrador: formData.nomeAdministrador,
            porteEstabelecimento: formData.porteEstabelecimento,
            dataAberturaCnpj: formData.dataAberturaCnpj ? new Date(formData.dataAberturaCnpj) : undefined,
            situacaoCadastral: formData.situacaoCadastral,
            dataSituacaoCadastral: formData.dataSituacaoCadastral ? new Date(formData.dataSituacaoCadastral) : undefined,
            observacao: formData.observacoes,
            cadastroRfb: '',
            inativo: false,
            bloqueado: false,
        };

        try {
            await credoresService.criar(commonData as Omit<ICredor, 'id' | 'createdAt' | 'updatedAt'>);
            alert('Credor cadastrado com sucesso!');
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
        setFormData(formDataVazio);
        setErros({});
    };

    const aplicarMascaraDocumento = (valor: string) => {
        if (formData.tipoCredor === 'Física') {
            return maskCpf(valor);
        }
        return maskCnpj(valor);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Novo Credor
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro completo de novo credor
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
                        <TabsList className="grid w-full grid-cols-6 mb-6">
                            <TabsTrigger value="identificacao" className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Identificação</span>
                            </TabsTrigger>
                            <TabsTrigger value="documentos" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Documentos</span>
                            </TabsTrigger>
                            <TabsTrigger value="contato" className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Contato</span>
                            </TabsTrigger>
                            <TabsTrigger value="endereco" className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span className="hidden sm:inline">Endereço</span>
                            </TabsTrigger>
                            <TabsTrigger value="bancarios" className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">Bancários</span>
                            </TabsTrigger>
                            <TabsTrigger value="complementares" className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span className="hidden sm:inline">Complementar</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Aba Identificação */}
                        <TabsContent value="identificacao" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label>Tipo<span className="text-red-500 ml-1">*</span></Label>
                                        <FieldTooltip content="Pessoa Física ou Jurídica" />
                                    </div>
                                    <Select
                                        value={formData.tipoCredor}
                                        onValueChange={(v) =>
                                            setFormData({ ...formData, tipoCredor: v as ICredor['tipoCredor'], identificador: '' })
                                        }
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
                                        <Label>
                                            {formData.tipoCredor === 'Física' ? 'CPF' : 'CNPJ'}
                                            <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <FieldTooltip content="Documento de identificação" />
                                    </div>
                                    <Input
                                        value={formData.identificador}
                                        onChange={(e) =>
                                            setFormData({ ...formData, identificador: aplicarMascaraDocumento(e.target.value) })
                                        }
                                        disabled={!formData.tipoCredor}
                                        maxLength={formData.tipoCredor === 'Física' ? 14 : 18}
                                        placeholder={formData.tipoCredor === 'Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        className={erros.cpfCnpj ? 'border-red-500' : ''}
                                    />
                                    {erros.cpfCnpj && <p className="text-sm text-red-500">{erros.cpfCnpj}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label>Nome/Razão Social<span className="text-red-500 ml-1">*</span></Label>
                                    </div>
                                    <Input
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                                        maxLength={FIELD_LIMITS.nome}
                                        className={erros.nome ? 'border-red-500' : ''}
                                    />
                                    {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Nome Fantasia</Label>
                                    <Input
                                        value={formData.nomeFantasia}
                                        onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value.toUpperCase() })}
                                        maxLength={FIELD_LIMITS.nome}
                                    />
                                </div>
                            </div>

                            {formData.tipoCredor === 'Jurídica' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Natureza Jurídica</Label>
                                        <Input
                                            value={formData.naturezaJuridica}
                                            onChange={(e) => setFormData({ ...formData, naturezaJuridica: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="optanteSimples"
                                                checked={formData.optanteSimples}
                                                onCheckedChange={(v) => setFormData({ ...formData, optanteSimples: v as boolean })}
                                            />
                                            <Label htmlFor="optanteSimples">Optante Simples Nacional</Label>
                                        </div>
                                        {formData.optanteSimples && (
                                            <div className="space-y-2">
                                                <Label>Data Final Opção</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.dataFinalOpcaoSimples}
                                                    onChange={(e) => setFormData({ ...formData, dataFinalOpcaoSimples: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>CPF Administrador</Label>
                                            <Input
                                                value={formData.cpfAdministrador}
                                                onChange={(e) => setFormData({ ...formData, cpfAdministrador: maskCpf(e.target.value) })}
                                                maxLength={14}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome Administrador</Label>
                                            <Input
                                                value={formData.nomeAdministrador}
                                                onChange={(e) => setFormData({ ...formData, nomeAdministrador: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Aba Documentos */}
                        <TabsContent value="documentos" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Inscrição Estadual</Label>
                                    <Input
                                        value={formData.inscricaoEstadual}
                                        onChange={(e) => setFormData({ ...formData, inscricaoEstadual: maskInscricaoEstadual(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Inscrição Municipal</Label>
                                    <Input
                                        value={formData.inscricaoMunicipal}
                                        onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.tipoCredor === 'Física' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>RG</Label>
                                            <Input
                                                value={formData.rg}
                                                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Órgão Emissor</Label>
                                            <Input
                                                value={formData.orgaoEmissorRg}
                                                onChange={(e) => setFormData({ ...formData, orgaoEmissorRg: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data Emissão</Label>
                                            <Input
                                                type="date"
                                                value={formData.dataEmissaoRg}
                                                onChange={(e) => setFormData({ ...formData, dataEmissaoRg: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>NIT/PIS/PASEP</Label>
                                        <Input
                                            value={formData.nitPisPasep}
                                            onChange={(e) => setFormData({ ...formData, nitPisPasep: maskNitPisPasep(e.target.value) })}
                                            maxLength={14}
                                        />
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Aba Contato */}
                        <TabsContent value="contato" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Secundário</Label>
                                    <Input
                                        type="email"
                                        value={formData.email2}
                                        onChange={(e) => setFormData({ ...formData, email2: e.target.value.toLowerCase() })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefone Comercial</Label>
                                    <Input
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tel. Comercial 2</Label>
                                    <Input
                                        value={formData.telefoneComercial2}
                                        onChange={(e) => setFormData({ ...formData, telefoneComercial2: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Celular</Label>
                                    <Input
                                        value={formData.celular}
                                        onChange={(e) => setFormData({ ...formData, celular: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefone Residencial</Label>
                                    <Input
                                        value={formData.telefoneResidencial}
                                        onChange={(e) => setFormData({ ...formData, telefoneResidencial: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website</Label>
                                    <Input
                                        value={formData.site}
                                        onChange={(e) => setFormData({ ...formData, site: e.target.value.toLowerCase() })}
                                        placeholder="www.exemplo.com.br"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Aba Endereço */}
                        <TabsContent value="endereco" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                                        maxLength={9}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Logradouro</Label>
                                    <Input
                                        value={formData.logradouro}
                                        onChange={(e) => setFormData({ ...formData, logradouro: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Número</Label>
                                    <Input
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Complemento</Label>
                                    <Input
                                        value={formData.complemento}
                                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Bairro</Label>
                                    <Input
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Município</Label>
                                    <Input
                                        value={formData.municipio}
                                        onChange={(e) => setFormData({ ...formData, municipio: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>UF</Label>
                                    <Select
                                        value={formData.uf}
                                        onValueChange={(v) => setFormData({ ...formData, uf: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((uf) => (
                                                <SelectItem key={uf.value} value={uf.value}>{uf.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Caixa Postal</Label>
                                    <Input
                                        value={formData.caixaPostal}
                                        onChange={(e) => setFormData({ ...formData, caixaPostal: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Ponto de Referência</Label>
                                <Input
                                    value={formData.pontoReferencia}
                                    onChange={(e) => setFormData({ ...formData, pontoReferencia: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </TabsContent>

                        {/* Aba Bancários */}
                        <TabsContent value="bancarios" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Banco</Label>
                                    <Select
                                        value={formData.bancoId}
                                        onValueChange={(v) => setFormData({ ...formData, bancoId: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o banco" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockBancos.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.codigo} - {b.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Conta</Label>
                                    <Select
                                        value={formData.tipoConta}
                                        onValueChange={(v) => setFormData({ ...formData, tipoConta: v as ICredor['tipoContaBancaria'] })}
                                    >
                                        <SelectTrigger>
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
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Agência</Label>
                                    <Input
                                        value={formData.agencia}
                                        onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                                        maxLength={6}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dígito Agência</Label>
                                    <Input
                                        value={formData.digitoAgencia}
                                        onChange={(e) => setFormData({ ...formData, digitoAgencia: e.target.value })}
                                        maxLength={1}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Conta</Label>
                                    <Input
                                        value={formData.conta}
                                        onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                                        maxLength={12}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dígito Conta</Label>
                                    <Input
                                        value={formData.digitoConta}
                                        onChange={(e) => setFormData({ ...formData, digitoConta: e.target.value })}
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Chave Pix</Label>
                                    <Select
                                        value={formData.tipoChavePix}
                                        onValueChange={(v) => setFormData({ ...formData, tipoChavePix: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cpf_cnpj">CPF/CNPJ</SelectItem>
                                            <SelectItem value="email">E-mail</SelectItem>
                                            <SelectItem value="telefone">Telefone</SelectItem>
                                            <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Chave Pix</Label>
                                    <Input
                                        value={formData.chavePix}
                                        onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Aba Complementares */}
                        <TabsContent value="complementares" className="space-y-4">
                            {formData.tipoCredor === 'Jurídica' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Porte do Estabelecimento</Label>
                                            <Input
                                                value={formData.porteEstabelecimento}
                                                onChange={(e) => setFormData({ ...formData, porteEstabelecimento: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data Abertura CNPJ</Label>
                                            <Input
                                                type="date"
                                                value={formData.dataAberturaCnpj}
                                                onChange={(e) => setFormData({ ...formData, dataAberturaCnpj: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Situação Cadastral</Label>
                                            <Input
                                                value={formData.situacaoCadastral}
                                                onChange={(e) => setFormData({ ...formData, situacaoCadastral: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data Situação Cadastral</Label>
                                            <Input
                                                type="date"
                                                value={formData.dataSituacaoCadastral}
                                                onChange={(e) => setFormData({ ...formData, dataSituacaoCadastral: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <Label>Observações</Label>
                                <textarea
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
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
