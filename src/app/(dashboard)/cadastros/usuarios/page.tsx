'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Pencil, Trash2, Users, ArrowLeft } from 'lucide-react';
import type { IUsuario } from '@/types';

// Mock data
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

const PERFIS_USUARIO = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'operador', label: 'Operador' },
    { value: 'consulta', label: 'Consulta' },
];

export default function UsuariosPage() {
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<IUsuario[]>(usuariosIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const usuariosFiltrados = usuarios.filter(
        (user) =>
            user.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            user.emailInstitucional.toLowerCase().includes(termoBusca.toLowerCase()) ||
            user.cpf.includes(termoBusca)
    );

    const handleNovo = () => {
        router.push('/cadastros/usuarios/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/usuarios/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            setUsuarios(usuarios.filter((u) => u.id !== id));
        }
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
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            Usuários
                        </h1>
                        <p className="text-muted-foreground">
                            Gestão de usuários do sistema com perfil de acesso
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
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
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(usuario.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(usuario.id)}
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
        </div>
    );
}
