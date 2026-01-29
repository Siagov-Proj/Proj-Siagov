'use client';

import { useState, useEffect } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { Plus, Search, Pencil, Trash2, Wallet, User, Building, MapPin, Info, Loader2 } from 'lucide-react';
import { maskCnpj, maskCpf, maskCep, maskTelefone, maskNitPisPasep, maskInscricaoEstadual } from '@/utils/masks';
import { TIPOS_CREDOR, TIPOS_CONTA_BANCARIA, ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import type { ICredor } from '@/types';
import { credoresService } from '@/services/api/credoresService';

// Mock de bancos para o select (Ideal seria uma tabela de bancos no Supabase também)
const mockBancos = [
    { id: '1', codigo: '001', nome: 'Banco do Brasil' },
    { id: '2', codigo: '104', nome: 'Caixa Econômica Federal' },
    { id: '3', codigo: '341', nome: 'Itaú Unibanco' },
    { id: '4', codigo: '033', nome: 'Santander' },
    { id: '5', codigo: '237', nome: 'Bradesco' },
];

// Estado vazio do formulário
const formDataVazio = {
    // Aba 1: Identificação
    tipoCredor: '' as ICredor['tipoCredor'] | '',
    identificador: '', // CPF/CNPJ
    nome: '',
    nomeFantasia: '',
    naturezaJuridica: '',
    optanteSimples: false,
    dataFinalOpcaoSimples: '',
    optanteCprb: false,
    dataFinalOpcaoCprb: '',
    cpfAdministrador: '',
    nomeAdministrador: '',

    // Aba 2: Documentos
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    nitPisPasep: '',
    rg: '',
    orgaoEmissorRg: '',
    dataEmissaoRg: '',

    // Aba 3: Contato
    email: '',
    email2: '',
    telefone: '',
    telefoneComercial2: '',
    telefoneResidencial: '',
    celular: '',
    fax: '',
    site: '',

    // Aba 4: Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    caixaPostal: '',
    pontoReferencia: '',

    // Aba 5: Dados Bancários
    bancoId: '',
    agencia: '',
    digitoAgencia: '',
    conta: '',
    digitoConta: '',
    tipoConta: '' as ICredor['tipoContaBancaria'] | '',
    chavePix: '',
    tipoChavePix: '',

    // Aba 6: Complementares
    porteEstabelecimento: '',
    dataAberturaCnpj: '',
    situacaoCadastral: '',
    dataSituacaoCadastral: '',

    // Outros
    observacoes: '',
};

export default function CredoresPage() {
    const [credores, setCredores] = useState<ICredor[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [abaAtiva, setAbaAtiva] = useState('identificacao');
    const [saving, setSaving] = useState(false);

    const carregarCredores = async () => {
        setLoading(true);
        try {
            const dados = await credoresService.listar(termoBusca);
            setCredores(dados || []);
        } catch (error) {
            console.error('Erro ao carregar credores:', error);
            alert('Erro ao carregar lista de credores. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            carregarCredores();
        }, 500);
        return () => clearTimeout(timer);
    }, [termoBusca]);

    const abrirNovo = () => {
        setFormData(formDataVazio);
        setEditandoId(null);
        setErros({});
        setAbaAtiva('identificacao');
        setDialogAberto(true);
    };

    const editar = (credor: ICredor) => {
        setFormData({
            tipoCredor: credor.tipoCredor,
            identificador: credor.identificador,
            nome: credor.nome,
            nomeFantasia: credor.nomeFantasia || '',
            naturezaJuridica: credor.naturezaJuridica || '',
            inscricaoEstadual: credor.inscricaoEstadual || '',
            inscricaoMunicipal: credor.inscricaoMunicipal || '',
            nitPisPasep: credor.nitPisPasep || '',
            rg: credor.rg || '',
            orgaoEmissorRg: credor.orgaoEmissorRg || '',
            dataEmissaoRg: credor.dataEmissaoRg ? new Date(credor.dataEmissaoRg).toISOString().split('T')[0] : '',
            email: credor.email || '',
            email2: credor.email2 || '',
            telefone: credor.telefoneComercial || '',
            telefoneComercial2: credor.telefoneComercial2 || '',
            telefoneResidencial: credor.telefoneResidencial || '',
            celular: credor.telefoneCelular || '',
            fax: '', // Ignored
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
            digitoAgencia: credor.digitoAgencia || '',
            conta: credor.contaBancaria || '',
            digitoConta: credor.digitoConta || '',
            tipoConta: credor.tipoContaBancaria || '',
            chavePix: '',
            tipoChavePix: '',
            optanteSimples: credor.optanteSimples || false,
            dataFinalOpcaoSimples: credor.dataFinalOpcaoSimples ? new Date(credor.dataFinalOpcaoSimples).toISOString().split('T')[0] : '',
            optanteCprb: credor.optanteCprb || false,
            dataFinalOpcaoCprb: credor.dataFinalOpcaoCprb ? new Date(credor.dataFinalOpcaoCprb).toISOString().split('T')[0] : '',
            cpfAdministrador: credor.cpfAdministrador || '',
            nomeAdministrador: credor.nomeAdministrador || '',
            porteEstabelecimento: credor.porteEstabelecimento || '',
            dataAberturaCnpj: credor.dataAberturaCnpj ? new Date(credor.dataAberturaCnpj).toISOString().split('T')[0] : '',
            situacaoCadastral: credor.situacaoCadastral || '',
            dataSituacaoCadastral: credor.dataSituacaoCadastral ? new Date(credor.dataSituacaoCadastral).toISOString().split('T')[0] : '',
            observacoes: credor.observacao || '',
        });
        setEditandoId(credor.id);
        setErros({});
        setAbaAtiva('identificacao');
        setDialogAberto(true);
    };

    const excluir = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este credor?')) return;

        try {
            await credoresService.excluir(id);
            setCredores(credores.filter((c) => c.id !== id));
            alert('Credor excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir credor.');
        }
    };

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

    const salvar = async () => {
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
            if (editandoId) {
                await credoresService.atualizar(editandoId, commonData);
                alert('Credor atualizado com sucesso!');
            } else {
                await credoresService.criar(commonData as Omit<ICredor, 'id' | 'createdAt' | 'updatedAt'>);
                alert('Credor cadastrado com sucesso!');
            }

            setDialogAberto(false);
            setFormData(formDataVazio);
            setEditandoId(null);
            carregarCredores();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar credor. Verifique o console para mais detalhes.');
        } finally {
            setSaving(false);
        }
    };

    const aplicarMascaraDocumento = (valor: string) => {
        if (formData.tipoCredor === 'Física') {
            return maskCpf(valor);
        }
        return maskCnpj(valor);
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Wallet className="h-6 w-6" />
                        Credores (Supabase)
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro completo de credores integrado com Supabase
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Credor
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Credores</CardTitle>
                            <CardDescription>
                                {credores.length} credor(es) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar credor..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>CPF/CNPJ</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Carregando credores...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : credores.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum credor encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    credores.map((credor) => (
                                        <TableRow key={credor.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {credor.tipoCredor === 'Física' ? 'PF' : 'PJ'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{credor.identificador}</TableCell>
                                            <TableCell className="font-medium">{credor.nome}</TableCell>
                                            <TableCell className="text-sm">{credor.email}</TableCell>
                                            <TableCell className="text-sm">{credor.telefoneComercial}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => editar(credor)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(credor.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de Formulário com 5 Abas */}
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId ? 'Editar Credor' : 'Novo Credor'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os campos em todas as abas para {editandoId ? 'editar o' : 'cadastrar um novo'} credor
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
                        <TabsList className="grid w-full grid-cols-6 h-auto"> {/* Adjusted columns to 6 */}
                            <TabsTrigger value="identificacao" className="gap-1 p-2">
                                <User className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Identificação</span>
                            </TabsTrigger>
                            <TabsTrigger value="documentos" className="gap-1 p-2">
                                <Info className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Documentos</span>
                            </TabsTrigger>
                            <TabsTrigger value="contato" className="gap-1 p-2">
                                <User className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Contato</span>
                            </TabsTrigger>
                            <TabsTrigger value="endereco" className="gap-1 p-2">
                                <MapPin className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Endereço</span>
                            </TabsTrigger>
                            <TabsTrigger value="bancario" className="gap-1 p-2">
                                <Building className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Bancário</span>
                            </TabsTrigger>
                            <TabsTrigger value="complementar" className="gap-1 p-2">
                                <Info className="h-4 w-4 hidden sm:inline" />
                                <span className="text-xs sm:text-sm">Complem.</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Aba 1: Identificação */}
                        <TabsContent value="identificacao" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="tipo">
                                            Tipo<span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <FieldTooltip content="Pessoa Física (CPF) ou Pessoa Jurídica (CNPJ)" />
                                    </div>
                                    <Select
                                        value={formData.tipoCredor}
                                        onValueChange={(valor) => setFormData({ ...formData, tipoCredor: valor as ICredor['tipoCredor'], identificador: '' })}
                                    >
                                        <SelectTrigger className={erros.tipo ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Física">Pessoa Física</SelectItem>
                                            <SelectItem value="Jurídica">Pessoa Jurídica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {erros.tipo && <p className="text-sm text-red-500">{erros.tipo}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="cpfCnpj">
                                            {formData.tipoCredor === 'Física' ? 'CPF' : 'CNPJ'}<span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <FieldTooltip content={formData.tipoCredor === 'Física' ? 'CPF do credor' : 'CNPJ da empresa'} />
                                    </div>
                                    <Input
                                        id="cpfCnpj"
                                        value={formData.identificador}
                                        onChange={(e) => setFormData({ ...formData, identificador: aplicarMascaraDocumento(e.target.value) })}
                                        maxLength={formData.tipoCredor === 'Física' ? 14 : 18}
                                        placeholder={formData.tipoCredor === 'Física' ? '000.000.000-00' : '00.000.000/0001-00'}
                                        className={erros.cpfCnpj ? 'border-red-500' : ''}
                                        disabled={!formData.tipoCredor}
                                    />
                                    {erros.cpfCnpj && <p className="text-sm text-red-500">{erros.cpfCnpj}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nome">
                                        Nome Completo / Razão Social<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome completo ou razão social"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                            </div>

                            {formData.tipoCredor === 'Jurídica' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                                        <Input
                                            id="nomeFantasia"
                                            value={formData.nomeFantasia}
                                            onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                                            maxLength={FIELD_LIMITS.nome}
                                            placeholder="Nome fantasia da empresa"
                                        />
                                    </div>

                                    {/* Campos Adicionais de Paridade Legado (PJ) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="naturezaJuridica">Natureza Jurídica</Label>
                                            <Select
                                                value={formData.naturezaJuridica}
                                                onValueChange={(v) => setFormData({ ...formData, naturezaJuridica: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Empresa Individual">Empresa Individual</SelectItem>
                                                    <SelectItem value="Sociedade Empresária">Sociedade Empresária</SelectItem>
                                                    <SelectItem value="Associação Privada">Associação Privada</SelectItem>
                                                    <SelectItem value="Autarquia">Autarquia</SelectItem>
                                                    <SelectItem value="Fundação">Fundação</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Optante Simples</Label>
                                            <Select
                                                value={formData.optanteSimples ? 'Sim' : 'Não'}
                                                onValueChange={(v) => setFormData({ ...formData, optanteSimples: v === 'Sim' })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sim">Sim</SelectItem>
                                                    <SelectItem value="Não">Não</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.optanteSimples && (
                                            <div className="space-y-2">
                                                <Label htmlFor="dataFinalOpcaoSimples">Data Final Opção Simples</Label>
                                                <Input
                                                    id="dataFinalOpcaoSimples"
                                                    type="date"
                                                    value={formData.dataFinalOpcaoSimples}
                                                    onChange={(e) => setFormData({ ...formData, dataFinalOpcaoSimples: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Optante CPRB</Label>
                                            <Select
                                                value={formData.optanteCprb ? 'Sim' : 'Não'}
                                                onValueChange={(v) => setFormData({ ...formData, optanteCprb: v === 'Sim' })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sim">Sim</SelectItem>
                                                    <SelectItem value="Não">Não</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.optanteCprb && (
                                            <div className="space-y-2">
                                                <Label htmlFor="dataFinalOpcaoCprb">Data Final Opção CPRB</Label>
                                                <Input
                                                    id="dataFinalOpcaoCprb"
                                                    type="date"
                                                    value={formData.dataFinalOpcaoCprb}
                                                    onChange={(e) => setFormData({ ...formData, dataFinalOpcaoCprb: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Administrador Responsável
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cpfAdministrador">CPF do Administrador</Label>
                                                <Input
                                                    id="cpfAdministrador"
                                                    value={formData.cpfAdministrador}
                                                    onChange={(e) => setFormData({ ...formData, cpfAdministrador: maskCpf(e.target.value) })}
                                                    placeholder="000.000.000-00"
                                                    maxLength={14}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nomeAdministrador">Nome do Administrador</Label>
                                                <Input
                                                    id="nomeAdministrador"
                                                    value={formData.nomeAdministrador}
                                                    onChange={(e) => setFormData({ ...formData, nomeAdministrador: e.target.value })}
                                                    placeholder="Nome completo"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* Aba 2: Documentos */}
                        <TabsContent value="documentos" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                                        <FieldTooltip content="Número da inscrição estadual (para PJ)" />
                                    </div>
                                    <Input
                                        id="inscricaoEstadual"
                                        value={formData.inscricaoEstadual}
                                        onChange={(e) => setFormData({ ...formData, inscricaoEstadual: maskInscricaoEstadual(e.target.value) })}
                                        maxLength={20}
                                        placeholder="000.000.000.000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                                        <FieldTooltip content="Número da inscrição municipal (para PJ)" />
                                    </div>
                                    <Input
                                        id="inscricaoMunicipal"
                                        value={formData.inscricaoMunicipal}
                                        onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value.replace(/\D/g, '').substring(0, 15) })}
                                        maxLength={15}
                                        placeholder="Número da inscrição"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="nitPisPasep">NIT/PIS/PASEP</Label>
                                        <FieldTooltip content="Número de Identificação do Trabalhador" />
                                    </div>
                                    <Input
                                        id="nitPisPasep"
                                        value={formData.nitPisPasep}
                                        onChange={(e) => setFormData({ ...formData, nitPisPasep: maskNitPisPasep(e.target.value) })}
                                        maxLength={14}
                                        placeholder="000.00000.00-0"
                                    />
                                </div>

                                {formData.tipoCredor === 'Física' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="rg">RG</Label>
                                        <Input
                                            id="rg"
                                            value={formData.rg}
                                            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                                            maxLength={20}
                                            placeholder="Número do RG"
                                        />
                                    </div>
                                )}
                            </div>

                            {formData.tipoCredor === 'Física' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="orgaoEmissorRg">Órgão Emissor do RG</Label>
                                        <Input
                                            id="orgaoEmissorRg"
                                            value={formData.orgaoEmissorRg}
                                            onChange={(e) => setFormData({ ...formData, orgaoEmissorRg: e.target.value.toUpperCase() })}
                                            maxLength={20}
                                            placeholder="SSP/UF"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dataEmissaoRg">Data de Emissão do RG</Label>
                                        <Input
                                            id="dataEmissaoRg"
                                            type="date"
                                            value={formData.dataEmissaoRg}
                                            onChange={(e) => setFormData({ ...formData, dataEmissaoRg: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Aba 3: Contato */}
                        <TabsContent value="contato" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail Principal</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        maxLength={FIELD_LIMITS.email}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone Comercial 1</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefoneComercial2">Telefone Comercial 2</Label>
                                    <Input
                                        id="telefoneComercial2"
                                        value={formData.telefoneComercial2}
                                        onChange={(e) => setFormData({ ...formData, telefoneComercial2: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefoneResidencial">Telefone Residencial</Label>
                                    <Input
                                        id="telefoneResidencial"
                                        value={formData.telefoneResidencial}
                                        onChange={(e) => setFormData({ ...formData, telefoneResidencial: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="celular">Celular</Label>
                                    <Input
                                        id="celular"
                                        value={formData.celular}
                                        onChange={(e) => setFormData({ ...formData, celular: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 90000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site">Site</Label>
                                    <Input
                                        id="site"
                                        value={formData.site}
                                        onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                                        maxLength={100}
                                        placeholder="www.exemplo.com.br"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email2">E-mail Secundário</Label>
                                    <Input
                                        id="email2"
                                        type="email"
                                        value={formData.email2}
                                        onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
                                        maxLength={FIELD_LIMITS.email}
                                        placeholder="email2@exemplo.com"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Aba 4: Endereço */}
                        <TabsContent value="endereco" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                                        maxLength={9}
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro</Label>
                                    <Input
                                        id="logradouro"
                                        value={formData.logradouro}
                                        onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                                        maxLength={100}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        maxLength={10}
                                        placeholder="Número"
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input
                                        id="complemento"
                                        value={formData.complemento}
                                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                        maxLength={50}
                                        placeholder="Apto, Sala, Bloco..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        maxLength={50}
                                        placeholder="Bairro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="municipio">Município</Label>
                                    <Input
                                        id="municipio"
                                        value={formData.municipio}
                                        onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                                        maxLength={60}
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="uf">UF</Label>
                                    <Select
                                        value={formData.uf}
                                        onValueChange={(valor) => setFormData({ ...formData, uf: valor })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((uf) => (
                                                <SelectItem key={uf} value={uf}>
                                                    {uf}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="caixaPostal">Caixa Postal</Label>
                                    <Input
                                        id="caixaPostal"
                                        value={formData.caixaPostal}
                                        onChange={(e) => setFormData({ ...formData, caixaPostal: e.target.value })}
                                        maxLength={10}
                                        placeholder="Caixa Postal"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                                    <Input
                                        id="pontoReferencia"
                                        value={formData.pontoReferencia}
                                        onChange={(e) => setFormData({ ...formData, pontoReferencia: e.target.value })}
                                        maxLength={100}
                                        placeholder="Próximo a..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Aba 5: Dados Bancários */}
                        <TabsContent value="bancario" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="bancoId">Banco</Label>
                                <Select
                                    value={formData.bancoId}
                                    onValueChange={(valor) => setFormData({ ...formData, bancoId: valor })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o banco" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockBancos.map((banco) => (
                                            <SelectItem key={banco.id} value={banco.id}>
                                                {banco.codigo} - {banco.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-3">
                                    <Label htmlFor="agencia">Agência</Label>
                                    <Input
                                        id="agencia"
                                        value={formData.agencia}
                                        onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                                        maxLength={10}
                                        placeholder="Número da agência"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="digitoAgencia">Dígito</Label>
                                    <Input
                                        id="digitoAgencia"
                                        value={formData.digitoAgencia}
                                        onChange={(e) => setFormData({ ...formData, digitoAgencia: e.target.value })}
                                        maxLength={2}
                                        placeholder="X"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-3">
                                    <Label htmlFor="conta">Conta Corrente</Label>
                                    <Input
                                        id="conta"
                                        value={formData.conta}
                                        onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                                        maxLength={20}
                                        placeholder="Número da conta"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="digitoConta">Dígito</Label>
                                    <Input
                                        id="digitoConta"
                                        value={formData.digitoConta}
                                        onChange={(e) => setFormData({ ...formData, digitoConta: e.target.value })}
                                        maxLength={2}
                                        placeholder="X"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipoConta">Tipo de Conta</Label>
                                <Select
                                    value={formData.tipoConta}
                                    onValueChange={(valor) => setFormData({ ...formData, tipoConta: valor as ICredor['tipoContaBancaria'] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo de conta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_CONTA_BANCARIA.map((tipo) => (
                                            <SelectItem key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        {/* Aba 6: Complementar */}
                        <TabsContent value="complementar" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="situacaoCadastral">Situação Cadastral</Label>
                                    <Select
                                        value={formData.situacaoCadastral}
                                        onValueChange={(v) => setFormData({ ...formData, situacaoCadastral: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Ativa">Ativa</SelectItem>
                                            <SelectItem value="Suspensa">Suspensa</SelectItem>
                                            <SelectItem value="Inapta">Inapta</SelectItem>
                                            <SelectItem value="Baixada">Baixada</SelectItem>
                                            <SelectItem value="Nula">Nula</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataSituacaoCadastral">Data da Situação</Label>
                                    <Input
                                        id="dataSituacaoCadastral"
                                        type="date"
                                        value={formData.dataSituacaoCadastral}
                                        onChange={(e) => setFormData({ ...formData, dataSituacaoCadastral: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="porteEstabelecimento">Porte do Estabelecimento</Label>
                                    <Select
                                        value={formData.porteEstabelecimento}
                                        onValueChange={(v) => setFormData({ ...formData, porteEstabelecimento: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Microempresa">Microempresa</SelectItem>
                                            <SelectItem value="EPP">EPP</SelectItem>
                                            <SelectItem value="Demais">Demais</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataAberturaCnpj">Data de Abertura CNPJ</Label>
                                    <Input
                                        id="dataAberturaCnpj"
                                        type="date"
                                        value={formData.dataAberturaCnpj}
                                        onChange={(e) => setFormData({ ...formData, dataAberturaCnpj: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Input
                                    id="observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Observações gerais sobre o credor"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button variant="outline" onClick={() => setDialogAberto(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={salvar} disabled={saving}>
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Salvando...
                                </div>
                            ) : (
                                editandoId ? 'Salvar Alterações' : 'Cadastrar Credor'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
