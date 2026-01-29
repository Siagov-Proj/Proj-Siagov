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
import { Plus, Search, Pencil, Trash2, BriefcaseBusiness } from 'lucide-react';
import { maskCodigoComZeros } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { ISetor } from '@/types';

// Mock para cascata: Instituição → Órgão → UG
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças', codigo: '000001' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração', codigo: '000002' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino', codigo: '000003' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'Coordenadoria de Orçamento', codigo: '00001' },
    { id: '2', orgaoId: '1', nome: 'Coordenadoria de Contabilidade', codigo: '00002' },
    { id: '3', orgaoId: '2', nome: 'Coordenadoria de RH', codigo: '00003' },
];

const setoresIniciais: ISetor[] = [
    {
        id: '1',
        codigo: '0001',
        instituicaoId: '1',
        orgaoId: '1',
        unidadeGestoraId: '1',
        nome: 'Setor de Licitações',
        nomeAbreviado: 'SELIC',
        responsavel: 'Maria da Silva',
        ramal: '1234',
        emailPrimario: 'maria@setor.gov.br',
        telefone01: '(00) 1234-5678',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const formDataVazio = {
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

export default function SetoresPage() {
    const [setores, setSetores] = useState<ISetor[]>(setoresIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    // Cascata: Instituição → Órgão → UG
    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);

    const setoresFiltrados = setores.filter(
        (setor) =>
            setor.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            setor.nomeAbreviado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            setor.codigo.includes(termoBusca)
    );

    const abrirNovo = () => {
        const proximoCodigo = maskCodigoComZeros(String(setores.length + 1), 4);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (setor: ISetor) => {
        // Encontra a hierarquia
        const ug = mockUnidadesGestoras.find((u) => u.id === setor.unidadeGestoraId);
        const orgao = mockOrgaos.find((o) => o.id === ug?.orgaoId);

        setFormData({
            codigo: setor.codigo,
            instituicaoId: orgao?.instituicaoId || '',
            orgaoId: ug?.orgaoId || '',
            unidadeGestoraId: setor.unidadeGestoraId,
            nome: setor.nome,
            nomeAbreviado: setor.nomeAbreviado,
            responsavel: setor.responsavel || '',
            telefone01: setor.telefone01 || '',
            emailPrimario: setor.emailPrimario || '',
            emailSecundario: setor.emailSecundario || '',
            ramal: setor.ramal || '',
        });
        setEditandoId(setor.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este setor?')) {
            setSetores(setores.filter((s) => s.id !== id));
        }
    };

    const limpar = () => {
        const proximoCodigo = editandoId ? formData.codigo : maskCodigoComZeros(String(setores.length + 1), 4);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.unidadeGestoraId) novosErros.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.nomeAbreviado) novosErros.nomeAbreviado = 'Sigla é obrigatória';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setSetores(
                setores.map((s) =>
                    s.id === editandoId
                        ? { ...s, ...formData, updatedAt: new Date() }
                        : s
                )
            );
        } else {
            const novoSetor: ISetor = {
                id: String(Date.now()),
                ...formData,
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setSetores([...setores, novoSetor]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeUG = (id: string) => {
        return mockUnidadesGestoras.find((ug) => ug.id === id)?.nome || '';
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BriefcaseBusiness className="h-6 w-6" />
                        Setores
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de setores administrativos das unidades gestoras
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Setor
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Setores</CardTitle>
                            <CardDescription>
                                {setoresFiltrados.length} setor(es) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar setor..."
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
                                    <TableHead>Unidade Gestora</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {setoresFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum setor encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    setoresFiltrados.map((setor) => (
                                        <TableRow key={setor.id}>
                                            <TableCell className="font-mono">{setor.codigo}</TableCell>
                                            <TableCell className="font-medium">{setor.nome}</TableCell>
                                            <TableCell>{setor.nomeAbreviado}</TableCell>
                                            <TableCell>{obterNomeUG(setor.unidadeGestoraId)}</TableCell>
                                            <TableCell className="text-sm">{setor.responsavel}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(setor)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(setor.id)}
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
                            {editandoId ? 'Editar Setor' : 'Novo Setor'}
                        </DialogTitle>
                        <DialogDescription>
                            Seleção em cascata: Instituição → Órgão → Unidade Gestora
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Código */}
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código</Label>
                            <Input
                                id="codigo"
                                value={formData.codigo}
                                readOnly
                                className="bg-muted font-mono w-24"
                            />
                        </div>

                        {/* Cascata: Instituição → Órgão → UG */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição</Label>
                                    <FieldTooltip content="Selecione para filtrar órgãos" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, instituicaoId: valor, orgaoId: '', unidadeGestoraId: '' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>
                                                {inst.codigo} - {inst.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Órgão</Label>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({ ...formData, orgaoId: valor, unidadeGestoraId: '' })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguardando...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((orgao) => (
                                            <SelectItem key={orgao.id} value={orgao.id}>
                                                {orgao.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>
                                        Unidade Gestora<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Select
                                    value={formData.unidadeGestoraId}
                                    onValueChange={(valor) => setFormData({ ...formData, unidadeGestoraId: valor })}
                                    disabled={!formData.orgaoId}
                                >
                                    <SelectTrigger className={erros.unidadeGestoraId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguardando...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ugsFiltradas.map((ug) => (
                                            <SelectItem key={ug.id} value={ug.id}>
                                                {ug.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.unidadeGestoraId && <p className="text-sm text-red-500">{erros.unidadeGestoraId}</p>}
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
                                    placeholder="Nome do setor"
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
                                    maxLength={FIELD_LIMITS.sigla} // Using sigla limit for nomeAbreviado as it's the same concept here
                                    placeholder="SIGLA"
                                    className={erros.nomeAbreviado ? 'border-red-500' : ''}
                                />
                                {erros.nomeAbreviado && <p className="text-sm text-red-500">{erros.nomeAbreviado}</p>}
                            </div>
                        </div>

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
                                onChange={(e) => setFormData({ ...formData, telefone01: e.target.value })}
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
