'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { maskCpf } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';

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

export default function NovoUsuarioPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // Cascata completa
    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);
    const ugsFiltradas = mockUnidadesGestoras.filter((ug) => ug.orgaoId === formData.orgaoId);
    const setoresFiltrados = mockSetores.filter((s) => s.unidadeGestoraId === formData.unidadeGestoraId);
    const cargosFiltrados = mockCargos.filter((c) => c.setorId === formData.setorId);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
        if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
        if (!formData.emailInstitucional) novosErros.emailInstitucional = 'E-mail Institucional é obrigatório';
        if (!formData.instituicaoId) novosErros.instituicaoId = 'Instituição é obrigatória';
        if (!formData.senha) novosErros.senha = 'Senha é obrigatória';
        else if (formData.senha.length < 8) novosErros.senha = 'Senha deve ter no mínimo 8 caracteres';
        if (formData.senha !== formData.confirmarSenha) {
            novosErros.confirmarSenha = 'As senhas não conferem';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = () => {
        if (!validar()) return;
        console.log('Salvando novo usuário:', formData);
        router.push('/cadastros/usuarios');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Usuário</h1>
                    <p className="text-muted-foreground">
                        Cadastro de novo usuário do sistema
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
                                <Label htmlFor="nomeCredor">Nome do Credor (Auto)</Label>
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
                    <CardTitle>Senha de Acesso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="senha">
                                Senha<span className="text-red-500 ml-1">*</span>
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
                                Confirmar Senha<span className="text-red-500 ml-1">*</span>
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
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
            />
        </div>
    );
}
