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
import type { IAgencia } from '@/types';

// Mock de bancos
const mockBancos = [
    { id: '1', codigo: '001', nome: 'Banco do Brasil S.A.' },
    { id: '2', codigo: '104', nome: 'Caixa Econômica Federal' },
    { id: '3', codigo: '341', nome: 'Itaú Unibanco S.A.' },
];

const agenciasIniciais: IAgencia[] = [
    {
        id: '1',
        bancoId: '1',
        codigoBanco: '001',
        codigo: '0001',
        digitoVerificador: '5',
        nome: 'Agência Central',
        nomeAbreviado: 'AG. CENTRAL',
        cnpj: '00.000.000/0001-91',
        praca: 'São Paulo',
        endereco: 'Av. Paulista, 1000',
        municipio: 'São Paulo',
        uf: 'SP',
        telefone: '(11) 3000-0000',
        gerente: 'João da Silva',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export default function AgenciasPage() {
    const router = useRouter();
    const [agencias, setAgencias] = useState<IAgencia[]>(agenciasIniciais);
    const [termoBusca, setTermoBusca] = useState('');

    const agenciasFiltradas = agencias.filter(
        (ag) =>
            ag.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            ag.codigo.includes(termoBusca) ||
            (ag.municipio && ag.municipio.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    const handleNovo = () => {
        router.push('/cadastros/agencias/novo');
    };

    const handleEdit = (id: string) => {
        router.push(`/cadastros/agencias/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este agência?')) {
            setAgencias(agencias.filter((a) => a.id !== id));
        }
    };

    const obterNomeBanco = (id: string) => {
        const banco = mockBancos.find((b) => b.id === id);
        return banco ? `${banco.codigo} - ${banco.nome}` : '';
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
                            <Landmark className="h-6 w-6" />
                            Agências Bancárias
                        </h1>
                        <p className="text-muted-foreground">
                            Cadastro de agências vinculadas aos bancos
                        </p>
                    </div>
                </div>
                <Button onClick={handleNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Agência
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Agências</CardTitle>
                            <CardDescription>
                                {agenciasFiltradas.length} agência(s) cadastrada(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar agência..."
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
                                    <TableHead className="w-28">Agência</TableHead>
                                    <TableHead>Banco</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Município/UF</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agenciasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma agência encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    agenciasFiltradas.map((agencia) => (
                                        <TableRow key={agencia.id}>
                                            <TableCell className="font-mono">
                                                {agencia.codigo}{agencia.digitoVerificador ? `-${agencia.digitoVerificador}` : ''}
                                            </TableCell>
                                            <TableCell className="text-sm">{obterNomeBanco(agencia.bancoId)}</TableCell>
                                            <TableCell className="font-medium">{agencia.nome}</TableCell>
                                            <TableCell className="text-sm">
                                                {agencia.municipio}{agencia.uf ? `/${agencia.uf}` : ''}
                                            </TableCell>
                                            <TableCell className="text-sm">{agencia.telefone}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(agencia.id)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(agencia.id)}
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
