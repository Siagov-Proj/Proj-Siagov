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
import { Plus, Search, Pencil, Trash2, UserCheck } from 'lucide-react';
import { maskCodigoComZeros } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { ICargo } from '@/types';

// Mock para cascata
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'Coordenadoria de Orçamento' },
    { id: '2', orgaoId: '1', nome: 'Coordenadoria de Contabilidade' },
    { id: '3', orgaoId: '2', nome: 'Coordenadoria de RH' },
];

const mockSetores = [
    { id: '1', unidadeGestoraId: '1', nome: 'Setor de Licitações' },
    { id: '2', unidadeGestoraId: '1', nome: 'Setor de Contratos' },
    { id: '3', unidadeGestoraId: '3', nome: 'Setor de Pessoal' },
];

const cargosIniciais: ICargo[] = [
    {
        id: '1',
        codigo: '001',
        instituicaoId: '1',
        orgaoId: '1',
        unidadeGestoraId: '1',
        setorId: '1',
        nome: 'Analista de Licitações',
        descricao: 'Responsável pela análise de processos licitatórios',
        nivel: 'Superior',
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
    setorId: '',
    nome: '',
    descricao: '',
    nivel: '',
};

const NIVEIS_CARGO = [
    { value: 'Superior', label: 'Nível Superior' },
    { value: 'Médio', label: 'Nível Médio' },
    { value: 'Técnico', label: 'Nível Técnico' },
    { value: 'Fundamental', label: 'Nível Fundamental' },
];

export default function CargosPage() {
    const [cargos, setCargos] = useState<ICargo[]>(cargosIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    // Cascata completa: Instituição → Órgão → UG → Setor
    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);
    const setoresFiltrados = mockSetores.filter((s) => s.unidadeGestoraId === formData.unidadeGestoraId);

    const cargosFiltrados = cargos.filter(
        (cargo) =>
            cargo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            cargo.codigo.includes(termoBusca)
    );

    const abrirNovo = () => {
        const proximoCodigo = maskCodigoComZeros(String(cargos.length + 1), 3);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (cargo: ICargo) => {
        // Encontra a hierarquia completa
        const setor = mockSetores.find((s) => s.id === cargo.setorId);
        const ug = mockUnidadesGestoras.find((u) => u.id === setor?.unidadeGestoraId);
        const orgao = mockOrgaos.find((o) => o.id === ug?.orgaoId);

        setFormData({
            codigo: cargo.codigo,
            instituicaoId: orgao?.instituicaoId || '',
            orgaoId: ug?.orgaoId || '',
            unidadeGestoraId: setor?.unidadeGestoraId || '',
            setorId: cargo.setorId,
            nome: cargo.nome,
            descricao: cargo.descricao || '',
            nivel: cargo.nivel || '',
        });
        setEditandoId(cargo.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            setCargos(cargos.filter((c) => c.id !== id));
        }
    };

    const limpar = () => {
        const proximoCodigo = editandoId ? formData.codigo : maskCodigoComZeros(String(cargos.length + 1), 3);
        setFormData({ ...formDataVazio, codigo: proximoCodigo });
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.setorId) novosErros.setorId = 'Setor é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setCargos(
                cargos.map((c) =>
                    c.id === editandoId
                        ? { ...c, ...formData, updatedAt: new Date() }
                        : c
                )
            );
        } else {
            const novoCargo: ICargo = {
                id: String(Date.now()),
                ...formData,
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setCargos([...cargos, novoCargo]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeSetor = (id: string) => {
        return mockSetores.find((s) => s.id === id)?.nome || '';
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <UserCheck className="h-6 w-6" />
                        Cargos
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de cargos administrativos vinculados aos setores
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cargo
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Cargos</CardTitle>
                            <CardDescription>
                                {cargosFiltrados.length} cargo(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cargo..."
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
                                    <TableHead>Setor</TableHead>
                                    <TableHead>Nível</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cargosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum cargo encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cargosFiltrados.map((cargo) => (
                                        <TableRow key={cargo.id}>
                                            <TableCell className="font-mono">{cargo.codigo}</TableCell>
                                            <TableCell className="font-medium">{cargo.nome}</TableCell>
                                            <TableCell>{obterNomeSetor(cargo.setorId)}</TableCell>
                                            <TableCell className="text-sm">{cargo.nivel}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(cargo)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(cargo.id)}
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
                            {editandoId ? 'Editar Cargo' : 'Novo Cargo'}
                        </DialogTitle>
                        <DialogDescription>
                            Cascata: Instituição → Órgão → UG → Setor → Cargo
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
                                className="bg-muted font-mono w-20"
                            />
                        </div>

                        {/* Cascata: Instituição → Órgão → UG → Setor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Instituição</Label>
                                    <FieldTooltip content="Primeiro nível da cascata" />
                                </div>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        instituicaoId: valor,
                                        orgaoId: '',
                                        unidadeGestoraId: '',
                                        setorId: ''
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>{inst.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Órgão</Label>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        orgaoId: valor,
                                        unidadeGestoraId: '',
                                        setorId: ''
                                    })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((org) => (
                                            <SelectItem key={org.id} value={org.id}>{org.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unidade Gestora</Label>
                                <Select
                                    value={formData.unidadeGestoraId}
                                    onValueChange={(valor) => setFormData({ ...formData, unidadeGestoraId: valor, setorId: '' })}
                                    disabled={!formData.orgaoId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ugsFiltradas.map((ug) => (
                                            <SelectItem key={ug.id} value={ug.id}>{ug.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label>Setor<span className="text-red-500 ml-1">*</span></Label>
                                </div>
                                <Select
                                    value={formData.setorId}
                                    onValueChange={(valor) => setFormData({ ...formData, setorId: valor })}
                                    disabled={!formData.unidadeGestoraId}
                                >
                                    <SelectTrigger className={erros.setorId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.unidadeGestoraId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {setoresFiltrados.map((setor) => (
                                            <SelectItem key={setor.id} value={setor.id}>{setor.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.setorId && <p className="text-sm text-red-500">{erros.setorId}</p>}
                            </div>
                        </div>

                        {/* Nome e Nível */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">
                                    Nome do Cargo<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome do cargo"
                                    className={erros.nome ? 'border-red-500' : ''}
                                />
                                {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nivel">Nível de Escolaridade</Label>
                                <Select
                                    value={formData.nivel}
                                    onValueChange={(valor) => setFormData({ ...formData, nivel: valor })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NIVEIS_CARGO.map((nivel) => (
                                            <SelectItem key={nivel.value} value={nivel.value}>{nivel.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição do Cargo</Label>
                            <Input
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                maxLength={200}
                                placeholder="Descrição das atribuições do cargo"
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
