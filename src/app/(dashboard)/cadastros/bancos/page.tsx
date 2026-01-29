'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { Plus, Search, Pencil, Trash2, CreditCard } from 'lucide-react';
import { maskCodigoComZeros } from '@/utils/masks';
import type { IBanco } from '@/types';

const bancosIniciais: IBanco[] = [
    {
        id: '1',
        codigo: '001',
        nome: 'Banco do Brasil S.A.',
        nomeAbreviado: 'BB',
        cnpj: '00.000.000/0001-91',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        codigo: '104',
        nome: 'Caixa Econômica Federal',
        nomeAbreviado: 'CEF',
        cnpj: '00.360.305/0001-04',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '3',
        codigo: '341',
        nome: 'Itaú Unibanco S.A.',
        nomeAbreviado: 'ITAU',
        cnpj: '60.701.190/0001-04',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const formDataVazio = {
    codigo: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
};

export default function BancosPage() {
    const [bancos, setBancos] = useState<IBanco[]>(bancosIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});

    const bancosFiltrados = bancos.filter(
        (banco) =>
            banco.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            banco.nomeAbreviado.toLowerCase().includes(termoBusca.toLowerCase()) ||
            banco.codigo.includes(termoBusca)
    );

    const abrirNovo = () => {
        setFormData(formDataVazio);
        setEditandoId(null);
        setErros({});
        setDialogAberto(true);
    };

    const editar = (banco: IBanco) => {
        setFormData({
            codigo: banco.codigo,
            nome: banco.nome,
            nomeAbreviado: banco.nomeAbreviado,
            cnpj: banco.cnpj || '',
        });
        setEditandoId(banco.id);
        setErros({});
        setDialogAberto(true);
    };

    const excluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este banco?')) {
            setBancos(bancos.filter((b) => b.id !== id));
        }
    };

    const limpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.codigo) novosErros.codigo = 'Código FEBRABAN é obrigatório';
        if (!formData.nome) novosErros.nome = 'Nome é obrigatório';

        // Verifica código duplicado
        const codigoExistente = bancos.find(
            (b) => b.codigo === formData.codigo && b.id !== editandoId
        );
        if (codigoExistente) {
            novosErros.codigo = 'Este código já está cadastrado';
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = () => {
        if (!validar()) return;

        if (editandoId) {
            setBancos(
                bancos.map((b) =>
                    b.id === editandoId
                        ? { ...b, ...formData, updatedAt: new Date() }
                        : b
                )
            );
        } else {
            const novoBanco: IBanco = {
                id: String(Date.now()),
                ...formData,
                ativo: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setBancos([...bancos, novoBanco]);
        }

        setDialogAberto(false);
        setFormData(formDataVazio);
        setEditandoId(null);
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        Rede Bancária
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastro de bancos para vinculação de agências e contas
                    </p>
                </div>
                <Button onClick={abrirNovo}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Banco
                </Button>
            </div>

            {/* Card de Listagem */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Lista de Bancos</CardTitle>
                            <CardDescription>
                                {bancosFiltrados.length} banco(s) cadastrado(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar banco..."
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
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="w-24">Sigla</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead className="w-24 text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bancosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum banco encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bancosFiltrados.map((banco) => (
                                        <TableRow key={banco.id}>
                                            <TableCell className="font-mono">{banco.codigo}</TableCell>
                                            <TableCell className="font-medium">{banco.nome}</TableCell>
                                            <TableCell>{banco.nomeAbreviado}</TableCell>
                                            <TableCell className="text-sm font-mono">{banco.cnpj}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => editar(banco)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => excluir(banco.id)}
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
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editandoId ? 'Editar Banco' : 'Novo Banco'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados do banco. O código segue o padrão FEBRABAN.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código FEBRABAN<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Código de 3 dígitos do banco conforme FEBRABAN" />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: maskCodigoComZeros(e.target.value, 3) })}
                                    maxLength={3}
                                    placeholder="000"
                                    className={erros.codigo ? 'border-red-500 font-mono' : 'font-mono'}
                                />
                                {erros.codigo && <p className="text-sm text-red-500">{erros.codigo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeAbreviado">Sigla</Label>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })}
                                    maxLength={20} // Changed to 20 per requirement
                                    placeholder="SIGLA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome do Banco<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                maxLength={80}
                                placeholder="Nome completo do banco"
                                className={erros.nome ? 'border-red-500' : ''}
                            />
                            {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                                id="cnpj"
                                value={formData.cnpj}
                                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                maxLength={18}
                                placeholder="00.000.000/0001-91"
                            />
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
