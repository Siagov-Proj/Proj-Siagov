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
import { Plus, Search, Pencil, Trash2, Building, ArrowLeft } from 'lucide-react';
import type { IOrgao } from '@/types';

// Mock data
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda', codigo: '001' },
    { id: '2', nome: 'Ministério da Educação', codigo: '002' },
    { id: '3', nome: 'Ministério da Saúde', codigo: '003' },
];

const initialOrgaos: IOrgao[] = [
    {
        id: '1',
        codigo: '000001',
        instituicaoId: '1',
        poderVinculado: 'Executivo',
        nome: 'Secretaria de Finanças',
        sigla: 'SEFIN',
        cnpj: '00.000.000/0001-00',
        codigoSiasg: '123456',
        ugTce: '12345',
        ugSiafemSigef: '123456',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        codigo: '000002',
        instituicaoId: '1',
        poderVinculado: 'Executivo',
        nome: 'Secretaria de Administração',
        sigla: 'SEAD',
        cnpj: '00.000.000/0002-00',
        codigoSiasg: '234567',
        ugTce: '23456',
        ugSiafemSigef: '234567',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export default function OrgaosPage() {
    const router = useRouter();
    const [orgaos, setOrgaos] = useState<IOrgao[]>(initialOrgaos);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrgaos = orgaos.filter(
        (org) =>
            org.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.codigo.includes(searchTerm)
    );

    const handleNovo = () => {
        router.push('/cadastros/orgaos/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/orgaos/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este órgão?')) {
            setOrgaos(orgaos.filter((o) => o.id !== id));
        }
    };

    const getInstituicaoNome = (id: string) => {
        return mockInstituicoes.find((i) => i.id === id)?.nome || '';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Órgãos
                        </h1>
                        <p className="text-muted-foreground">
                            Gerenciamento de órgãos vinculados às instituições
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Órgão
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Órgãos</CardTitle>
                            <CardDescription>
                                {filteredOrgaos.length} órgão(s) encontrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar órgão..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-20">Sigla</TableHead>
                                    <TableHead>Instituição</TableHead>
                                    <TableHead>Poder</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrgaos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum órgão encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrgaos.map((orgao) => (
                                        <TableRow key={orgao.id}>
                                            <TableCell className="font-mono">{orgao.codigo}</TableCell>
                                            <TableCell className="font-medium">{orgao.nome}</TableCell>
                                            <TableCell>{orgao.sigla}</TableCell>
                                            <TableCell>{getInstituicaoNome(orgao.instituicaoId)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{orgao.poderVinculado}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(orgao.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(orgao.id)}
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
