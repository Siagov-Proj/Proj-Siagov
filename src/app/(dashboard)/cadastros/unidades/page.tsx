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
import { Badge } from '@/components/ui/badge';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { Plus, Search, Pencil, Trash2, Landmark } from 'lucide-react';
import { maskCnpj, maskCodigoComZeros, maskCep } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { IUnidadeGestora } from '@/types';

// Mock de Instituições e Órgãos para cascata
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças', codigo: '000001' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração', codigo: '000002' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino', codigo: '000003' },
];

const unidadesIniciais: IUnidadeGestora[] = [
    {
        id: '1',
        codigo: '000001',
        orgaoId: '1',
        nome: 'Coordenadoria de Orçamento',
        nomeAbreviado: 'CORC',
        cnpj: '00.000.000/0001-01',
        ordenadorDespesa: 'João da Silva',
        ugTce: '12345',
        ugSiafemSigef: '123456',
        ugSiasg: '123456',
        tipoUnidadeGestora: 'Gestora',
        tipoAdministracao: 'Direta',
        grupoIndireta: undefined,
        cep: '70000-000',
        logradouro: 'Esplanada dos Ministérios',
        numero: 'S/N',
        complemento: 'Bloco A',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        emailPrimario: 'contato@ug.gov.br',
        telefone: '(61) 3333-3333',

        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const formDataVazio = {
    codigo: '',
    instituicaoId: '',
    orgaoId: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
    ordenadorDespesa: '',
    ugTce: '',
    ugSiafemSigef: '',
    ugSiasg: '',
    tipoUnidadeGestora: '',
    tipoAdministracao: undefined as IUnidadeGestora['tipoAdministracao'] | undefined,
    grupoIndireta: undefined as IUnidadeGestora['grupoIndireta'] | undefined,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    emailPrimario: '',
    emailSecundario: '',
    telefone: '',
};

export default function UnidadesGestorasPage() {
    const [unidades, setUnidades] = useState<IUnidadeGestora[]>(unidadesIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    // Filtra órgãos pela instituição selecionada (cascata)
    const orgaosFiltrados = mockOrgaos.filter(
        (orgao) => orgao.instituicaoId === formData.instituicaoId
    );

    const unidadesFiltradas = unidades.filter(
        (ug) =>
            ug.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ug.nomeAbreviado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ug.codigo.includes(termoBusca)
    );

    const abrirNovo = () => {
        const proximoCodigo = maskCodigoComZeros(String(unidades.length + 1), 6);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (ug: IUnidadeGestora) => {
        // Encontra a instituição pelo órgão
        const orgao = mockOrgaos.find((o) => o.id === ug.orgaoId);
        setFormData({
            codigo: ug.codigo,
            instituicaoId: orgao?.instituicaoId || '',
            orgaoId: ug.orgaoId,
            nome: ug.nome,
            nomeAbreviado: ug.nomeAbreviado,
            cnpj: ug.cnpj || '',
            ordenadorDespesa: ug.ordenadorDespesa || '',
            ugTce: ug.ugTce || '',
            ugSiafemSigef: ug.ugSiafemSigef || '',
            ugSiasg: ug.ugSiasg || '',
            tipoUnidadeGestora: ug.tipoUnidadeGestora || '',
            tipoAdministracao: ug.tipoAdministracao,
            grupoIndireta: ug.grupoIndireta,
            cep: ug.cep || '',
            logradouro: ug.logradouro || '',
            numero: ug.numero || '',
            complemento: ug.complemento || '',
            bairro: ug.bairro || '',
            municipio: ug.municipio || '',
            uf: ug.uf || '',
            emailPrimario: ug.emailPrimario || '',
            emailSecundario: ug.emailSecundario || '',
            telefone: ug.telefone || '',
        });
        setEditandoId(ug.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta unidade gestora?')) {
            setUnidades(unidades.filter((u) => u.id !== id));
        }
    };

    const limpar = () => {
        const proximoCodigo = editandoId ? formData.codigo : maskCodigoComZeros(String(unidades.length + 1), 6);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.instituicaoId) novosErros.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) novosErros.orgaoId = 'Órgão é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.nomeAbreviado) novosErros.nomeAbreviado = 'Sigla é obrigatória';
        if (!formData.tipoAdministracao) novosErros.tipoAdministracao = 'Tipo de administração é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setUnidades(
                unidades.map((u) =>
                    u.id === editandoId
                        ? {
                            ...u,
                            ...formData,
                            tipoAdministracao: formData.tipoAdministracao!,
                            updatedAt: new Date()
                        }
                        : u
                )
            );
        } else {
            const novaUnidade: IUnidadeGestora = {
                id: String(Date.now()),
                ...formData,
                tipoAdministracao: formData.tipoAdministracao!,
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setUnidades([...unidades, novaUnidade]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeOrgao = (id: string) => {
        return mockOrgaos.find((o) => o.id === id)?.nome || '';
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = maskCep(e.target.value);
        setFormData({ ...formData, cep });
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Landmark className="h-6 w-6" />
                        Unidades Gestoras
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de unidades de gestão administrativa
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Unidades Gestoras</CardTitle>
                            <CardDescription>
                                {unidadesFiltradas.length} unidade(s) encontrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar unidade..."
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
                                    <TableHead className="w-20">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-20">Sigla</TableHead>
                                    <TableHead>Órgão</TableHead>
                                    <TableHead>Ordenador</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unidadesFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma unidade gestora encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    unidadesFiltradas.map((ug) => (
                                        <TableRow key={ug.id}>
                                            <TableCell className="font-mono">{ug.codigo}</TableCell>
                                            <TableCell className="font-medium">{ug.nome}</TableCell>
                                            <TableCell>{ug.nomeAbreviado}</TableCell>
                                            <TableCell>{obterNomeOrgao(ug.orgaoId)}</TableCell>
                                            <TableCell className="text-sm">{ug.ordenadorDespesa}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(ug)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(ug.id)}
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
                            {editandoId ? 'Editar Unidade Gestora' : 'Nova Unidade Gestora'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os campos. A instituição filtra os órgãos disponíveis (cascata).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Código */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="codigo">Código</Label>
                                <FieldTooltip content="Código de 6 dígitos gerado automaticamente" />
                            </div>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                readOnly
                                className="bg-muted font-mono w-32"
                            />
                        </div>

                        {/* Instituição → Órgão (Cascata) */}
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
                                    onValueChange={(valor) => setFormData({ ...formData, instituicaoId: valor, orgaoId: '' })}
                                >
                                    <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione a instituição" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.codigo} - {inst.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.instituicaoId && <p className="text-sm text-red-500">{erros.instituicaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="orgaoId">
                                        Órgão<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Órgão ao qual a UG está vinculada" />
                                </div>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, orgaoId: valor })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger className={erros.orgaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione o órgão' : 'Selecione a instituição primeiro'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((orgao) => (
                                            <SelectItem key={orgao.id} value={orgao.id}>
                                                {orgao.codigo} - {orgao.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.orgaoId && <p className="text-sm text-red-500">{erros.orgaoId}</p>}
                            </div>
                        </div>

                        {/* Nome e Sigla */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">
                                    Nome<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome da unidade gestora"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeAbreviado">
                                    Sigla<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })}
                                    maxLength={FIELD_LIMITS.nomeAbreviado}
                                    placeholder="SIGLA"
                                    className={erros.nomeAbreviado ? 'border-red-500' : ''}
                                />
                                {erros.nomeAbreviado && <p className="text-sm text-red-500">{erros.nomeAbreviado}</p>}
                            </div>
                        </div>

                        {/* CNPJ e Ordenador */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <FieldTooltip content="CNPJ da unidade gestora" />
                                </div>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                    maxLength={18}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ordenadorDespesa">Ordenador de Despesa</Label>
                                    <FieldTooltip content="Nome do ordenador de despesa responsável" />
                                </div>
                                <Input
                                    id="ordenadorDespesa"
                                    value={formData.ordenadorDespesa}
                                    onChange={(e) => setFormData({ ...formData, ordenadorDespesa: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome do ordenador"
                                />
                            </div>
                        </div>

                        {/* Códigos TCE e SIAFEM */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ugTce">UG TCE</Label>
                                    <FieldTooltip content="Código da UG no Tribunal de Contas" />
                                </div>
                                <Input
                                    id="ugTce"
                                    value={formData.ugTce}
                                    onChange={(e) => setFormData({ ...formData, ugTce: e.target.value.replace(/\D/g, '').substring(0, 5) })}
                                    maxLength={5}
                                    placeholder="00000"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ugSiafemSigef">UG SIAFEM/SIGEF</Label>
                                    <FieldTooltip content="Código da UG no sistema financeiro" />
                                </div>
                                <Input
                                    id="ugSiafemSigef"
                                    value={formData.ugSiafemSigef}
                                    onChange={(e) => setFormData({ ...formData, ugSiafemSigef: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* UG SIASG e Tipo de Unidade */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="ugSiasg">UG SIASG</Label>
                                    <FieldTooltip content="Código da UG no SIASG" />
                                </div>
                                <Input
                                    id="ugSiasg"
                                    value={formData.ugSiasg}
                                    onChange={(e) => setFormData({ ...formData, ugSiasg: e.target.value.replace(/\D/g, '').substring(0, 6) })}
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipoUnidadeGestora">Tipo de Unidade</Label>
                                <Input
                                    id="tipoUnidadeGestora"
                                    value={formData.tipoUnidadeGestora}
                                    onChange={(e) => setFormData({ ...formData, tipoUnidadeGestora: e.target.value })}
                                    maxLength={50}
                                    placeholder="Ex: Gestora, Arrecadadora"
                                />
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
