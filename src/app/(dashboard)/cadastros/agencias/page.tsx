'use client';

import { useState } from 'react';
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
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { Plus, Search, Pencil, Trash2, Landmark } from 'lucide-react';
import { maskCep, maskTelefone, maskCodigoComZeros } from '@/utils/masks';
import { ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import type { IAgencia } from '@/types';

// Mock de bancos
const mockBancos = [
    { id: '1', codigo: '001', nome: 'Banco do Brasil S.A.' },
    { id: '2', codigo: '104', nome: 'Caixa Econômica Federal' },
    { id: '3', codigo: '341', nome: 'Itaú Unibanco S.A.' },
];

const agenciasIniciais: IAgencia[] = [
    {
        id: '1',
        bancoId: '1',
        codigoBanco: '001',
        codigo: '0001',
        digitoVerificador: '5',
        nome: 'Agência Central',
        nomeAbreviado: 'AG. CENTRAL',
        cnpj: '00.000.000/0001-91',
        praca: 'São Paulo',
        endereco: 'Av. Paulista, 1000',
        municipio: 'São Paulo',
        uf: 'SP',
        telefone: '(11) 3000-0000',
        gerente: 'João da Silva',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const formDataVazio = {
    bancoId: '',
    codigo: '',
    digitoVerificador: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
    praca: '',
    gerente: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    municipio: '',
    uf: '',
    telefone: '',
    email: '',
};

export default function AgenciasPage() {
    const [agencias, setAgencias] = useState<IAgencia[]>(agenciasIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    const agenciasFiltradas = agencias.filter(
        (ag) =>
            ag.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ag.codigo.includes(termoBusca) ||
            (ag.municipio && ag.municipio.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    const abrirNovo = () => {
        setFormData(formDataVazio);
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (agencia: IAgencia) => {
        setFormData({
            bancoId: agencia.bancoId,
            codigo: agencia.codigo,
            digitoVerificador: agencia.digitoVerificador || '',
            nome: agencia.nome,
            nomeAbreviado: agencia.nomeAbreviado || '',
            cnpj: agencia.cnpj || '',
            praca: agencia.praca || '',
            gerente: agencia.gerente || '',
            cep: agencia.cep || '',
            endereco: agencia.endereco || '',
            numero: agencia.numero || '',
            bairro: agencia.bairro || '',
            municipio: agencia.municipio || '',
            uf: agencia.uf || '',
            telefone: agencia.telefone || '',
            email: agencia.email || '',
        });
        setEditandoId(agencia.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta agência?')) {
            setAgencias(agencias.filter((a) => a.id !== id));
        }
    };

    const limpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.bancoId) novosErros.bancoId = 'Banco é obrigatório';
        if (!formData.codigo) novosErros.codigo = 'Código da agência é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setAgencias(
                agencias.map((a) =>
                    a.id === editandoId
                        ? { ...a, ...formData, codigoBanco: mockBancos.find(b => b.id === formData.bancoId)?.codigo || '', updatedAt: new Date() }
                        : a
                )
            );
        } else {
            const novaAgencia: IAgencia = {
                id: String(Date.now()),
                ...formData,
                codigoBanco: mockBancos.find(b => b.id === formData.bancoId)?.codigo || '',
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setAgencias([...agencias, novaAgencia]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeBanco = (id: string) => {
        const banco = mockBancos.find((b) => b.id === id);
        return banco ? `${banco.codigo} - ${banco.nome}` : '';
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Landmark className="h-6 w-6" />
                        Agências Bancárias
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de agências vinculadas aos bancos
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Agência
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Agências</CardTitle>
                            <CardDescription>
                                {agenciasFiltradas.length} agência(s) cadastrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar agência..."
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
                                    <TableHead className="w-28">Agência</TableHead>
                                    <TableHead>Banco</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Município/UF</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agenciasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma agência encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    agenciasFiltradas.map((agencia) => (
                                        <TableRow key={agencia.id}>
                                            <TableCell className="font-mono">
                                                {agencia.codigo}{agencia.digitoVerificador ? `-${agencia.digitoVerificador}` : ''}
                                            </TableCell>
                                            <TableCell className="text-sm">{obterNomeBanco(agencia.bancoId)}</TableCell>
                                            <TableCell className="font-medium">{agencia.nome}</TableCell>
                                            <TableCell className="text-sm">
                                                {agencia.municipio}{agencia.uf ? `/${agencia.uf}` : ''}
                                            </TableCell>
                                            <TableCell className="text-sm">{agencia.telefone}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(agencia)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(agencia.id)}
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

            {/* Dialog de Formulário */}
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId ? 'Editar Agência' : 'Nova Agência'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da agência bancária
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Banco e Código */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="bancoId">
                                        Banco<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Selecione o banco ao qual a agência pertence" />
                                </div>
                                <Select
                                    value={formData.bancoId}
                                    onValueChange={(valor) => setFormData({ ...formData, bancoId: valor })}
                                >
                                    <SelectTrigger className={erros.bancoId ? 'border-red-500' : ''}>
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
                                {erros.bancoId && <p className="text-sm text-red-500">{erros.bancoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código da Agência<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: maskCodigoComZeros(e.target.value, 4) })}
                                        maxLength={4}
                                        placeholder="0000"
                                        className={`font-mono flex-1 ${erros.codigo ? 'border-red-500' : ''}`}
                                    />
                                    <Input
                                        value={formData.digitoVerificador}
                                        onChange={(e) => setFormData({ ...formData, digitoVerificador: e.target.value.substring(0, 1) })}
                                        maxLength={1}
                                        placeholder="DV"
                                        className="w-14 font-mono text-center"
                                    />
                                </div>
                                {erros.codigo && <p className="text-sm text-red-500">{erros.codigo}</p>}
                            </div>
                        </div>

                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome da Agência<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                maxLength={FIELD_LIMITS.nome}
                                placeholder="Nome da agência"
                                className={erros.nome ? 'border-red-500' : ''}
                            />
                            {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                        </div>

                        {/* Nome Abreviado e CNPJ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeAbreviado">
                                    Nome Abreviado
                                </Label>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value })}
                                    maxLength={30}
                                    placeholder="Ex: AG. CENTRO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} // Add mask if needed
                                    maxLength={18}
                                    placeholder="00.000.000/0001-91"
                                />
                            </div>
                        </div>

                        {/* Praça e Gerente */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="praca">
                                    Praça de Pagamento
                                </Label>
                                <Input
                                    id="praca"
                                    value={formData.praca}
                                    onChange={(e) => setFormData({ ...formData, praca: e.target.value })}
                                    maxLength={60}
                                    placeholder="Ex: SÃO PAULO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gerente">Gerente</Label>
                                <Input
                                    id="gerente"
                                    value={formData.gerente}
                                    onChange={(e) => setFormData({ ...formData, gerente: e.target.value })}
                                    maxLength={60}
                                    placeholder="Nome do gerente"
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Endereço</h4>
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
                                    <Label htmlFor="endereco">Logradouro</Label>
                                    <Input
                                        id="endereco"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                        maxLength={FIELD_LIMITS.logradouro}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        maxLength={FIELD_LIMITS.numero}
                                        placeholder="Nº"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        maxLength={FIELD_LIMITS.bairro}
                                        placeholder="Bairro"
                                    />
                                </div>

                                <div className="space-y-2">
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
                                    <Select
                                        value={formData.uf}
                                        onValueChange={(valor) => setFormData({ ...formData, uf: valor })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((estado) => (
                                                <SelectItem key={estado.value} value={estado.value}>
                                                    {estado.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contato */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Contato</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        maxLength={FIELD_LIMITS.email}
                                        placeholder="agencia@banco.com.br"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ActionBar
                        onSalvar={salvar}
                        onCancelar={() => setDialogAberto(false)}
                        onLimpar={limpar}
                        mode={editandoId ? 'edit' : 'create'}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
