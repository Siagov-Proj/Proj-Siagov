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
import { Plus, Search, Pencil, Trash2, Building2, ArrowLeft } from 'lucide-react';
import type { IInstituicao } from '@/types';

const initialInstituicoes: IInstituicao[] = [
    {
        id: '1',
        codigo: '001',
        nome: 'Ministério da Fazenda',
        nomeAbreviado: 'MF',
        esfera: 'Federal',
        cnpj: '00.000.000/0001-00',
        email: 'contato@fazenda.gov.br',
        codigoSiasg: '123456',
        cep: '70000-000',
        logradouro: 'Esplanada dos Ministérios, Bloco P',
        numero: 'S/N',
        complemento: '',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        codigo: '002',
        nome: 'Ministério da Educação',
        nomeAbreviado: 'MEC',
        esfera: 'Federal',
        cnpj: '00.000.000/0002-00',
        email: 'contato@mec.gov.br',
        codigoSiasg: '234567',
        cep: '70047-900',
        logradouro: 'Esplanada dos Ministérios, Bloco L',
        numero: 'S/N',
        complemento: '',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export default function InstituicoesPage() {
    const router = useRouter();
    const [instituicoes, setInstituicoes] = useState<IInstituicao[]>(initialInstituicoes);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInstituicoes = instituicoes.filter(
        (inst) =>
            inst.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.nomeAbreviado.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.codigo.includes(searchTerm)
    );

    const handleNovo = () => {
        router.push('/cadastros/instituicoes/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/instituicoes/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta instituição?')) {
            setInstituicoes(instituicoes.filter((i) => i.id !== id));
        }
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
                            <Building2 className="h-6 w-6" />
                            Instituições
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de instituições governamentais
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Instituição
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Instituições</CardTitle>
                            <CardDescription>
                                {filteredInstituicoes.length} instituição(ões) encontrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar instituição..."
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
                                    <TableHead className="w-20">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-24">Sigla</TableHead>
                                    <TableHead>Esfera</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInstituicoes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma instituição encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInstituicoes.map((inst) => (
                                        <TableRow key={inst.id}>
                                            <TableCell className="font-mono">{inst.codigo}</TableCell>
                                            <TableCell className="font-medium">{inst.nome}</TableCell>
                                            <TableCell>{inst.nomeAbreviado}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{inst.esfera}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{inst.cnpj}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(inst.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(inst.id)}
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
