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
import { Plus, Search, Pencil, Trash2, Landmark, ArrowLeft } from 'lucide-react';
import type { IUnidadeGestora } from '@/types';

// Mock data
const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças', codigo: '000001' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração', codigo: '000002' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino', codigo: '000003' },
];

const unidadesIniciais: IUnidadeGestora[] = [
    {
        id: '1',
        codigo: '000001',
        orgaoId: '1',
        nome: 'Coordenadoria de Orçamento',
        nomeAbreviado: 'CORC',
        cnpj: '00.000.000/0001-01',
        ordenadorDespesa: 'João da Silva',
        ugTce: '12345',
        ugSiafemSigef: '123456',
        ugSiasg: '123456',
        tipoUnidadeGestora: 'Gestora',
        tipoAdministracao: 'Direta',
        grupoIndireta: undefined,
        cep: '70000-000',
        logradouro: 'Esplanada dos Ministérios',
        numero: 'S/N',
        complemento: 'Bloco A',
        bairro: 'Zona Cívico-Administrativa',
        municipio: 'Brasília',
        uf: 'DF',
        emailPrimario: 'contato@ug.gov.br',
        telefone: '(61) 3333-3333',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export default function UnidadesGestorasPage() {
    const router = useRouter();
    const [unidades, setUnidades] = useState<IUnidadeGestora[]>(unidadesIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const unidadesFiltradas = unidades.filter(
        (ug) =>
            ug.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ug.nomeAbreviado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ug.codigo.includes(termoBusca)
    );

    const handleNovo = () => {
        router.push('/cadastros/unidades/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/unidades/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta unidade gestora?')) {
            setUnidades(unidades.filter((u) => u.id !== id));
        }
    };

    const obterNomeOrgao = (id: string) => {
        return mockOrgaos.find((o) => o.id === id)?.nome || '';
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
                            <Landmark className="h-6 w-6" />
                            Unidades Gestoras
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de unidades de gestão administrativa
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Unidade
                </Button>
            </div>

            {/* Search & Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Unidades Gestoras</CardTitle>
                            <CardDescription>
                                {unidadesFiltradas.length} unidade(s) encontrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar unidade..."
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
                                    <TableHead>Órgão</TableHead>
                                    <TableHead>Ordenador</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unidadesFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma unidade gestora encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    unidadesFiltradas.map((ug) => (
                                        <TableRow key={ug.id}>
                                            <TableCell className="font-mono">{ug.codigo}</TableCell>
                                            <TableCell className="font-medium">{ug.nome}</TableCell>
                                            <TableCell>{ug.nomeAbreviado}</TableCell>
                                            <TableCell>{obterNomeOrgao(ug.orgaoId)}</TableCell>
                                            <TableCell className="text-sm">{ug.ordenadorDespesa}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(ug.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(ug.id)}
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
