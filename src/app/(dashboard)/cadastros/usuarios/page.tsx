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
import { Plus, Search, Pencil, Trash2, Users, Eye, EyeOff } from 'lucide-react';
import { maskCpf } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import type { IUsuario } from '@/types';

// Mock para cascata
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda' },
    { id: '2', nome: 'Ministério da Educação' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'Coordenadoria de Orçamento' },
    { id: '2', orgaoId: '2', nome: 'Coordenadoria de RH' },
];

const mockSetores = [
    { id: '1', unidadeGestoraId: '1', nome: 'Setor de Licitações' },
    { id: '2', unidadeGestoraId: '2', nome: 'Setor de Pessoal' },
];

const mockCargos = [
    { id: '1', setorId: '1', nome: 'Analista de Licitações' },
    { id: '2', setorId: '2', nome: 'Analista de RH' },
];

const usuariosIniciais: IUsuario[] = [
    {
        id: '1',
        codigo: '001',
        nome: 'João da Silva',
        emailInstitucional: 'joao.silva@gov.br',
        emailPessoal: 'joao@gmail.com',
        telefone01: '(61) 99999-9999',
        telefoneWhatsApp: '(61) 99999-9999',
        cpf: '123.456.789-00',
        nomeCredor: 'João da Silva (Credor)',
        matricula: '123456',
        vinculo: 'Efetivo',
        instituicaoId: '1',
        orgaoId: '1',
        unidadeGestoraId: '1',
        ugOrigem: '1',
        setorId: '1',
        cargoId: '1',
        permissoes: ['admin'],
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
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
    senha: '',
    confirmarSenha: '',
};

const PERFIS_USUARIO = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'operador', label: 'Operador' },
    { value: 'consulta', label: 'Consulta' },
];

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<IUsuario[]>(usuariosIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [perfilSelecionado, setPerfilSelecionado] = useState('');

    // Cascata completa
    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);
    const setoresFiltrados = mockSetores.filter((s) => s.unidadeGestoraId === formData.unidadeGestoraId);
    const cargosFiltrados = mockCargos.filter((c) => c.setorId === formData.setorId);

    const usuariosFiltrados = usuarios.filter(
        (user) =>
            user.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            user.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            user.emailInstitucional.toLowerCase().includes(termoBusca.toLowerCase()) ||
            user.cpf.includes(termoBusca)
    );

    const abrirNovo = () => {
        setFormData(formDataVazio);
        setPerfilSelecionado('');
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (usuario: IUsuario) => {
        setFormData({
            codigo: usuario.codigo,
            nome: usuario.nome,
            cpf: usuario.cpf,
            nomeCredor: usuario.nomeCredor || '',
            matricula: usuario.matricula,
            vinculo: usuario.vinculo,
            emailInstitucional: usuario.emailInstitucional,
            emailPessoal: usuario.emailPessoal || '',
            telefone01: usuario.telefone01 || '',
            telefoneWhatsApp: usuario.telefoneWhatsApp || '',
            instituicaoId: usuario.instituicaoId,
            orgaoId: usuario.orgaoId,
            unidadeGestoraId: usuario.unidadeGestoraId,
            ugOrigem: usuario.ugOrigem || '',
            setorId: usuario.setorId,
            cargoId: usuario.cargoId,
            senha: '',
            confirmarSenha: '',
        });
        setPerfilSelecionado(usuario.permissoes?.[0] || '');
        setEditandoId(usuario.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            setUsuarios(usuarios.filter((u) => u.id !== id));
        }
    };

    const limpar = () => {
        setFormData(formDataVazio);
        setPerfilSelecionado('');
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
        if (!formData.emailInstitucional) novosErros.emailInstitucional = 'E-mail Institucional é obrigatório';
        if (!formData.instituicaoId) novosErros.instituicaoId = 'Instituição é obrigatória';

        // Validação de senha para novo usuário
        if (!editandoId) {
            if (!formData.senha) novosErros.senha = 'Senha é obrigatória';
            else if (formData.senha.length < 8) novosErros.senha = 'Senha deve ter no mínimo 8 caracteres';

            if (formData.senha !== formData.confirmarSenha) {
                novosErros.confirmarSenha = 'As senhas não conferem';
            }
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setUsuarios(
                usuarios.map((u) =>
                    u.id === editandoId
                        ? {
                            ...u,
                            ...formData,
                            permissoes: perfilSelecionado ? [perfilSelecionado] : [],
                            updatedAt: new Date()
                        }
                        : u
                )
            );
        } else {
            const novoUsuario: IUsuario = {
                id: String(Date.now()),
                ...formData,
                permissoes: perfilSelecionado ? [perfilSelecionado] : [],
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setUsuarios([...usuarios, novoUsuario]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    const obterNomeCargo = (id: string) => {
        return mockCargos.find((c) => c.id === id)?.nome || '-';
    };

    const obterLabelPerfil = (permissoes: string[]) => {
        const perfil = PERFIS_USUARIO.find((p) => permissoes?.includes(p.value));
        return perfil?.label || 'Sem perfil';
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Usuários
                    </h1>
                    <p className="text-muted-foreground">
                        Gestão de usuários do sistema com perfil de acesso
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Usuários</CardTitle>
                            <CardDescription>
                                {usuariosFiltrados.length} usuário(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuário..."
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
                                    <TableHead>Nome / CPF</TableHead>
                                    <TableHead>E-mail Institucional</TableHead>
                                    <TableHead>Cargo / Lotação</TableHead>
                                    <TableHead>Perfil</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usuariosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum usuário encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuariosFiltrados.map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{usuario.nome}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{usuario.cpf}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{usuario.emailInstitucional}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{obterNomeCargo(usuario.cargoId)}</span>
                                                    <span className="text-xs text-muted-foreground">{usuario.vinculo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {obterLabelPerfil(usuario.permissoes || [])}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(usuario)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(usuario.id)}
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId ? 'Editar Usuário' : 'Novo Usuário'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados do usuário. A senha é obrigatória para novos usuários.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Dados Pessoais */}
                        {/* Dados Pessoais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
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
                                        // Mock de lookup
                                        const nomeCredorMock = novoCpf.length === 14 ? 'Credor Exemplo Mock' : '';
                                        setFormData({
                                            ...formData,
                                            cpf: novoCpf,
                                            nomeCredor: nomeCredorMock
                                        });
                                    }}
                                    maxLength={14}
                                    placeholder="000.000.000-00"
                                    className={erros.cpf ? 'border-red-500' : ''}
                                />
                                {erros.cpf && <p className="text-sm text-red-500">{erros.cpf}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeCredor">
                                    Nome do Credor (Auto)
                                </Label>
                                <Input
                                    id="nomeCredor"
                                    value={formData.nomeCredor}
                                    readOnly
                                    className="bg-muted"
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
                                        <SelectItem value="Comissionado">Comissionado</SelectItem>
                                        <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Contato */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Contato</h4>
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
                        </div>

                        {/* Cascata: Instituição → Órgão → UG → Setor → Cargo */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Lotação</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Instituição<span className="text-red-500 ml-1">*</span></Label>
                                    <Select
                                        value={formData.instituicaoId}
                                        onValueChange={(valor) => setFormData({
                                            ...formData,
                                            instituicaoId: valor,
                                            orgaoId: '',
                                            unidadeGestoraId: '',
                                            setorId: '',
                                            cargoId: ''
                                        })}
                                    >
                                        <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockInstituicoes.map((inst) => (
                                                <SelectItem key={inst.id} value={inst.id}>{inst.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {erros.instituicaoId && <p className="text-sm text-red-500">{erros.instituicaoId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Órgão</Label>
                                    <Select
                                        value={formData.orgaoId}
                                        onValueChange={(valor) => setFormData({
                                            ...formData,
                                            orgaoId: valor,
                                            unidadeGestoraId: '',
                                            setorId: '',
                                            cargoId: ''
                                        })}
                                        disabled={!formData.instituicaoId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgaosFiltrados.map((org) => (
                                                <SelectItem key={org.id} value={org.id}>{org.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Unidade Gestora</Label>
                                    <Select
                                        value={formData.unidadeGestoraId}
                                        onValueChange={(valor) => setFormData({
                                            ...formData,
                                            unidadeGestoraId: valor,
                                            setorId: '',
                                            cargoId: ''
                                        })}
                                        disabled={!formData.orgaoId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ugsFiltradas.map((ug) => (
                                                <SelectItem key={ug.id} value={ug.id}>{ug.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            {mockUnidadesGestoras.map((ug) => (
                                                <SelectItem key={ug.id} value={ug.id}>{ug.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Setor</Label>
                                    <Select
                                        value={formData.setorId}
                                        onValueChange={(valor) => setFormData({ ...formData, setorId: valor, cargoId: '' })}
                                        disabled={!formData.unidadeGestoraId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {setoresFiltrados.map((setor) => (
                                                <SelectItem key={setor.id} value={setor.id}>{setor.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cargo</Label>
                                    <Select
                                        value={formData.cargoId}
                                        onValueChange={(valor) => setFormData({ ...formData, cargoId: valor })}
                                        disabled={!formData.setorId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cargosFiltrados.map((cargo) => (
                                                <SelectItem key={cargo.id} value={cargo.id}>{cargo.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label>Perfil de Acesso</Label>
                                        <FieldTooltip content="Define as permissões do usuário no sistema" />
                                    </div>
                                    <Select value={perfilSelecionado} onValueChange={setPerfilSelecionado}>
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
                        </div>

                        {/* Senha */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">
                                {editandoId ? 'Alterar Senha (deixe em branco para manter)' : 'Senha de Acesso'}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="senha">
                                        Senha{!editandoId && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
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
                                    <Label htmlFor="confirmarSenha">
                                        Confirmar Senha{!editandoId && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
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
