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
import { Plus, Search, Pencil, Trash2, BriefcaseBusiness, ArrowLeft } from 'lucide-react';
import type { ISetor } from '@/types';

// Mock para cascata: Instituição → Órgão → UG
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

export default function SetoresPage() {
    const router = useRouter();
    const [setores, setSetores] = useState<ISetor[]>(setoresIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const setoresFiltrados = setores.filter(
        (setor) =>
            setor.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            setor.nomeAbreviado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            setor.codigo.includes(termoBusca)
    );

    const handleNovo = () => {
        router.push('/cadastros/setores/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/setores/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este setor?')) {
            setSetores(setores.filter((s) => s.id !== id));
        }
    };

    const obterNomeUG = (id: string) => {
        return mockUnidadesGestoras.find((ug) => ug.id === id)?.nome || '';
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
                            <BriefcaseBusiness className="h-6 w-6" />
                            Setores
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de setores administrativos das unidades gestoras
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(setor.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(setor.id)}
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
