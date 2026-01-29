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
import { Plus, Search, Pencil, Trash2, UserCheck, ArrowLeft } from 'lucide-react';
import type { ICargo } from '@/types';

// Mock data
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

export default function CargosPage() {
    const router = useRouter();
    const [cargos, setCargos] = useState<ICargo[]>(cargosIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const cargosFiltrados = cargos.filter(
        (cargo) =>
            cargo.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            cargo.codigo.includes(termoBusca)
    );

    const handleNovo = () => {
        router.push('/cadastros/cargos/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/cargos/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cargo?')) {
            setCargos(cargos.filter((c) => c.id !== id));
        }
    };

    const obterNomeSetor = (id: string) => {
        return mockSetores.find((s) => s.id === id)?.nome || '';
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
                            <UserCheck className="h-6 w-6" />
                            Cargos
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de cargos administrativos vinculados aos setores
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
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
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(cargo.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(cargo.id)}
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
