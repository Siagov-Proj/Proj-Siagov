'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Search, Pencil, Trash2, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { usuariosService, IUsuarioDB } from '@/services/api';

const PERFIS_USUARIO = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'operador', label: 'Operador' },
    { value: 'consulta', label: 'Consulta' },
];

export default function UsuariosPage() {
    const router = useRouter();
    const [usuarios, setUsuarios] = useState<IUsuarioDB[]>([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const carregarUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await usuariosService.listar(termoBusca);
            setUsuarios(dados);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarUsuarios();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarUsuarios]);

    const handleNovo = () => {
        router.push('/cadastros/usuarios/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/usuarios/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                setDeleting(id);
                await usuariosService.excluir(id);
                setUsuarios(usuarios.filter((u) => u.id !== id));
            } catch (err) {
                console.error('Erro ao excluir usuário:', err);
                alert('Erro ao excluir usuário. Tente novamente.');
            } finally {
                setDeleting(null);
            }
        }
    };

    const obterLabelPerfil = (permissoes: string[] | null | undefined): string => {
        if (!permissoes || permissoes.length === 0) return 'Sem perfil';
        const perfil = PERFIS_USUARIO.find((p) => permissoes.includes(p.value));
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
                                {loading ? 'Carregando...' : `${usuarios.length} usuário(s) encontrado(s)`}
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
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome / CPF</TableHead>
                                        <TableHead>E-mail Institucional</TableHead>
                                        <TableHead>Vínculo</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead className="w-24 text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuarios.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhum usuário encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        usuarios.map((usuario) => (
                                            <TableRow key={usuario.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{usuario.nome}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{usuario.cpf}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{usuario.email_institucional || '-'}</TableCell>
                                                <TableCell className="text-sm">{usuario.vinculo || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {obterLabelPerfil(usuario.permissoes)}
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
                                                            disabled={deleting === usuario.id}
                                                        >
                                                            {deleting === usuario.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
