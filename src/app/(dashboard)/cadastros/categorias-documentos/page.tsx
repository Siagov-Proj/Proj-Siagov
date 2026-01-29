'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Search,
    FolderOpen,
    ChevronDown,
    ChevronRight,
    Scale,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

// Tipos
interface ISubcategoria {
    id: string;
    nome: string;
    descricao: string;
    categoriaId: string;
    ativo: boolean;
    criadoEm: Date;
}

interface ICategoria {
    id: string;
    nome: string;
    descricao: string;
    lei: string;
    cor: string;
    ativo: boolean;
    criadoEm: Date;
    subcategorias: ISubcategoria[];
}

// Dados mock
const LEIS = [
    'Lei 14.133/2021',
    'Lei 8.666/93',
    'Lei 13.019/14',
    'Lei 10.520/02',
];

const categoriasIniciais: ICategoria[] = [
    {
        id: '1',
        nome: 'Licitações',
        descricao: 'Documentos relacionados a processos licitatórios',
        lei: 'Lei 14.133/2021',
        cor: '#3b82f6',
        ativo: true,
        criadoEm: new Date('2024-01-01'),
        subcategorias: [
            {
                id: 's1',
                nome: 'Pregão Eletrônico',
                descricao: 'Modalidade de licitação por pregão eletrônico',
                categoriaId: '1',
                ativo: true,
                criadoEm: new Date('2024-01-01'),
            },
            {
                id: 's2',
                nome: 'Dispensa de Licitação',
                descricao: 'Contratações com dispensa de licitação',
                categoriaId: '1',
                ativo: true,
                criadoEm: new Date('2024-01-01'),
            },
            {
                id: 's3',
                nome: 'Inexigibilidade',
                descricao: 'Contratações por inexigibilidade',
                categoriaId: '1',
                ativo: true,
                criadoEm: new Date('2024-01-01'),
            },
            {
                id: 's4',
                nome: 'Contratação Direta',
                descricao: 'Contratações diretas diversas',
                categoriaId: '1',
                ativo: true,
                criadoEm: new Date('2024-01-01'),
            },
        ],
    },
    {
        id: '2',
        nome: 'Contratos',
        descricao: 'Documentos contratuais e aditivos',
        lei: 'Lei 8.666/93',
        cor: '#10b981',
        ativo: true,
        criadoEm: new Date('2024-01-02'),
        subcategorias: [
            {
                id: 's5',
                nome: 'Minutas',
                descricao: 'Minutas de contratos',
                categoriaId: '2',
                ativo: true,
                criadoEm: new Date('2024-01-02'),
            },
            {
                id: 's6',
                nome: 'Atas de Registro',
                descricao: 'Atas de registro de preços',
                categoriaId: '2',
                ativo: true,
                criadoEm: new Date('2024-01-02'),
            },
            {
                id: 's7',
                nome: 'Aditivos',
                descricao: 'Termos aditivos de contratos',
                categoriaId: '2',
                ativo: true,
                criadoEm: new Date('2024-01-02'),
            },
        ],
    },
    {
        id: '3',
        nome: 'Recursos Humanos',
        descricao: 'Documentos de pessoal e RH',
        lei: 'Lei 13.019/14',
        cor: '#f59e0b',
        ativo: true,
        criadoEm: new Date('2024-01-03'),
        subcategorias: [
            {
                id: 's8',
                nome: 'Relatórios',
                descricao: 'Relatórios de RH',
                categoriaId: '3',
                ativo: true,
                criadoEm: new Date('2024-01-03'),
            },
            {
                id: 's9',
                nome: 'Portarias',
                descricao: 'Portarias e atos de pessoal',
                categoriaId: '3',
                ativo: true,
                criadoEm: new Date('2024-01-03'),
            },
        ],
    },
];

const formVazio = {
    nome: '',
    descricao: '',
    lei: '',
};

const subFormVazio = {
    nome: '',
    descricao: '',
    categoriaId: '',
};

export default function CategoriasDocumentosPage() {
    const [categorias, setCategorias] = useState<ICategoria[]>(categoriasIniciais);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroLei, setFiltroLei] = useState('todas');
    const [expandidas, setExpandidas] = useState<string[]>(['1']);

    // State do modal de categoria
    const [modalCategoria, setModalCategoria] = useState(false);
    const [formCategoria, setFormCategoria] = useState(formVazio);
    const [editandoCategoriaId, setEditandoCategoriaId] = useState<string | null>(null);

    // State do modal de subcategoria
    const [modalSubcategoria, setModalSubcategoria] = useState(false);
    const [formSubcategoria, setFormSubcategoria] = useState(subFormVazio);
    const [editandoSubcategoriaId, setEditandoSubcategoriaId] = useState<string | null>(null);

    // Filtrar categorias
    const categoriasFiltradas = categorias.filter((cat) => {
        const matchBusca =
            cat.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            cat.descricao.toLowerCase().includes(termoBusca.toLowerCase());
        const matchLei = filtroLei === 'todas' || cat.lei === filtroLei;
        return matchBusca && matchLei;
    });

    const toggleExpansao = (id: string) => {
        setExpandidas((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Handlers de Categoria
    const abrirModalCategoria = (cat?: ICategoria) => {
        if (cat) {
            setFormCategoria({
                nome: cat.nome,
                descricao: cat.descricao,
                lei: cat.lei,
            });
            setEditandoCategoriaId(cat.id);
        } else {
            setFormCategoria(formVazio);
            setEditandoCategoriaId(null);
        }
        setModalCategoria(true);
    };

    const salvarCategoria = () => {
        if (!formCategoria.nome.trim() || !formCategoria.lei) return;

        if (editandoCategoriaId) {
            setCategorias((prev) =>
                prev.map((cat) =>
                    cat.id === editandoCategoriaId
                        ? { ...cat, ...formCategoria }
                        : cat
                )
            );
        } else {
            const novaCategoria: ICategoria = {
                id: Date.now().toString(),
                nome: formCategoria.nome,
                descricao: formCategoria.descricao,
                lei: formCategoria.lei,
                cor: '#3b82f6',
                ativo: true,
                criadoEm: new Date(),
                subcategorias: [],
            };
            setCategorias((prev) => [...prev, novaCategoria]);
        }
        setModalCategoria(false);
        setFormCategoria(formVazio);
    };

    const excluirCategoria = (id: string) => {
        setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    };

    // Handlers de Subcategoria
    const abrirModalSubcategoria = (categoriaId: string, sub?: ISubcategoria) => {
        if (sub) {
            setFormSubcategoria({
                nome: sub.nome,
                descricao: sub.descricao,
                categoriaId: sub.categoriaId,
            });
            setEditandoSubcategoriaId(sub.id);
        } else {
            setFormSubcategoria({ ...subFormVazio, categoriaId });
            setEditandoSubcategoriaId(null);
        }
        setModalSubcategoria(true);
    };

    const salvarSubcategoria = () => {
        if (!formSubcategoria.nome.trim() || !formSubcategoria.categoriaId) return;

        if (editandoSubcategoriaId) {
            setCategorias((prev) =>
                prev.map((cat) =>
                    cat.id === formSubcategoria.categoriaId
                        ? {
                            ...cat,
                            subcategorias: cat.subcategorias.map((sub) =>
                                sub.id === editandoSubcategoriaId
                                    ? { ...sub, ...formSubcategoria }
                                    : sub
                            ),
                        }
                        : cat
                )
            );
        } else {
            const novaSubcategoria: ISubcategoria = {
                id: Date.now().toString(),
                nome: formSubcategoria.nome,
                descricao: formSubcategoria.descricao,
                categoriaId: formSubcategoria.categoriaId,
                ativo: true,
                criadoEm: new Date(),
            };
            setCategorias((prev) =>
                prev.map((cat) =>
                    cat.id === formSubcategoria.categoriaId
                        ? { ...cat, subcategorias: [...cat.subcategorias, novaSubcategoria] }
                        : cat
                )
            );
        }
        setModalSubcategoria(false);
        setFormSubcategoria(subFormVazio);
    };

    const excluirSubcategoria = (categoriaId: string, subcategoriaId: string) => {
        setCategorias((prev) =>
            prev.map((cat) =>
                cat.id === categoriaId
                    ? {
                        ...cat,
                        subcategorias: cat.subcategorias.filter((sub) => sub.id !== subcategoriaId),
                    }
                    : cat
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/cadastros">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FolderOpen className="h-6 w-6" />
                            Categorias de Documentos (Normativos)
                        </h1>
                        <p className="text-muted-foreground">
                            Organize os documentos por categoria e subcategoria
                        </p>
                    </div>
                </div>
                <Button onClick={() => abrirModalCategoria()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar categorias..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filtroLei} onValueChange={setFiltroLei}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar por lei" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas as Leis</SelectItem>
                                {LEIS.map((lei) => (
                                    <SelectItem key={lei} value={lei}>
                                        {lei}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Categorias */}
            <Card>
                <CardHeader>
                    <CardTitle>Categorias Cadastradas</CardTitle>
                    <CardDescription>
                        {categoriasFiltradas.length} categoria(s) encontrada(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {categoriasFiltradas.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhuma categoria encontrada
                            </div>
                        ) : (
                            categoriasFiltradas.map((cat) => (
                                <div key={cat.id} className="border rounded-lg">
                                    {/* Cabeçalho da Categoria */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                                        onClick={() => toggleExpansao(cat.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandidas.includes(cat.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: cat.cor }}
                                            />
                                            <div>
                                                <h4 className="font-medium">{cat.nome}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {cat.descricao}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Scale className="h-3 w-3" />
                                                {cat.lei}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {cat.subcategorias.length} subcategoria(s)
                                            </Badge>
                                            <div
                                                className="flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => abrirModalCategoria(cat)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => excluirCategoria(cat.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategorias */}
                                    {expandidas.includes(cat.id) && (
                                        <div className="border-t bg-muted/30 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium">Subcategorias</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => abrirModalSubcategoria(cat.id)}
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />
                                                    Adicionar
                                                </Button>
                                            </div>
                                            {cat.subcategorias.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    Nenhuma subcategoria cadastrada
                                                </p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nome</TableHead>
                                                            <TableHead>Descrição</TableHead>
                                                            <TableHead className="w-24">Ações</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {cat.subcategorias.map((sub) => (
                                                            <TableRow key={sub.id}>
                                                                <TableCell className="font-medium">
                                                                    {sub.nome}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-muted-foreground">
                                                                    {sub.descricao}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                abrirModalSubcategoria(cat.id, sub)
                                                                            }
                                                                        >
                                                                            <Edit2 className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                excluirSubcategoria(cat.id, sub.id)
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal Categoria */}
            <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editandoCategoriaId ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da categoria de documentos
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomeCategoria">Nome</Label>
                            <Input
                                id="nomeCategoria"
                                value={formCategoria.nome}
                                onChange={(e) =>
                                    setFormCategoria({ ...formCategoria, nome: e.target.value })
                                }
                                placeholder="Ex: Licitações"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricaoCategoria">Descrição</Label>
                            <Input
                                id="descricaoCategoria"
                                value={formCategoria.descricao}
                                onChange={(e) =>
                                    setFormCategoria({ ...formCategoria, descricao: e.target.value })
                                }
                                placeholder="Descrição da categoria"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Lei Vinculada</Label>
                            <Select
                                value={formCategoria.lei}
                                onValueChange={(valor) =>
                                    setFormCategoria({ ...formCategoria, lei: valor })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a lei" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEIS.map((lei) => (
                                        <SelectItem key={lei} value={lei}>
                                            {lei}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalCategoria(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={salvarCategoria}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Subcategoria */}
            <Dialog open={modalSubcategoria} onOpenChange={setModalSubcategoria}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editandoSubcategoriaId ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da subcategoria
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomeSubcategoria">Nome</Label>
                            <Input
                                id="nomeSubcategoria"
                                value={formSubcategoria.nome}
                                onChange={(e) =>
                                    setFormSubcategoria({ ...formSubcategoria, nome: e.target.value })
                                }
                                placeholder="Ex: Pregão Eletrônico"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricaoSubcategoria">Descrição</Label>
                            <Input
                                id="descricaoSubcategoria"
                                value={formSubcategoria.descricao}
                                onChange={(e) =>
                                    setFormSubcategoria({
                                        ...formSubcategoria,
                                        descricao: e.target.value,
                                    })
                                }
                                placeholder="Descrição da subcategoria"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalSubcategoria(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={salvarSubcategoria}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
