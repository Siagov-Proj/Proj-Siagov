'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Plus,
    Search,
    Pencil,
    Trash2,
    ArrowLeft,
    Loader2,
    Scale,
    FolderOpen,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import {
    categoriasDocService,
    leisNormativasService,
    ICategoriaDocumentoDB,
    ILeiNormativaDB,
    ISubcategoriaDocumentoDB,
} from '@/services/api';
import { LeisCadastroDialog } from '@/components/normativos/LeisCadastroDialog';
import { useCadastroDialogs } from '@/components/cadastros/cadastro-dialog-provider';
import { ListPagination } from '@/components/ui/list-pagination';
import { compareNormativoLabels } from '@/utils';
import { toast } from 'sonner';

interface ICategoriaComSubcategorias extends ICategoriaDocumentoDB {
    subcategorias?: ISubcategoriaDocumentoDB[];
}

export default function NormativosPage() {
    const itensPorPagina = 10;
    const router = useRouter();
    const { showConfirm } = useCadastroDialogs();
    const [categorias, setCategorias] = useState<ICategoriaComSubcategorias[]>([]);
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroLei, setFiltroLei] = useState('todas');
    const [expandidas, setExpandidas] = useState<string[]>([]);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [paginaAtual, setPaginaAtual] = useState(1);

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            const [categoriasData, leisData] = await Promise.all([
                categoriasDocService.listarCategorias(termoBusca),
                leisNormativasService.listarAtivas(),
            ]);

            // Filtrar por lei se necessário
            let filtradas = categoriasData;
            if (filtroLei !== 'todas') {
                filtradas = categoriasData.filter(cat =>
                    cat.titulo?.lei_id === filtroLei
                );
            }

            // Carregar todas as subcategorias de uma vez (evita N+1 queries)
            const categoriaIds = filtradas.map(cat => cat.id);
            const todasSubcategorias = await categoriasDocService.listarSubcategoriasPorCategorias(categoriaIds);

            // Agrupar subcategorias por categoria_id
            const subsPorCategoria = new Map<string, typeof todasSubcategorias>();
            for (const sub of todasSubcategorias) {
                const lista = subsPorCategoria.get(sub.categoria_id) || [];
                lista.push(sub);
                subsPorCategoria.set(sub.categoria_id, lista);
            }

            const categoriasComSub: ICategoriaComSubcategorias[] = filtradas.map(cat => ({
                ...cat,
                subcategorias: subsPorCategoria.get(cat.id) || [],
            }));

            setCategorias(
                categoriasComSub
                    .map((categoria) => ({
                        ...categoria,
                        subcategorias: [...(categoria.subcategorias || [])].sort((a, b) => compareNormativoLabels(a.nome, b.nome)),
                    }))
                    .sort((a, b) => compareNormativoLabels(a.nome, b.nome))
            );
            setLeis(leisData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    }, [termoBusca, filtroLei]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            carregarDados();
        }, 300);
        return () => clearTimeout(debounce);
    }, [carregarDados]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [termoBusca, filtroLei]);

    const toggleExpansao = (id: string) => {
        setExpandidas((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleEditar = (id: string) => {
        router.push(`/cadastros/categorias-documentos/${id}`);
    };

    const handleExcluir = async (id: string) => {
        if (!await showConfirm({
            title: 'Excluir categoria',
            description: 'Tem certeza que deseja excluir esta categoria?',
            confirmLabel: 'Excluir',
            variant: 'danger',
        })) return;

        try {
            setDeleting(id);
            await categoriasDocService.excluirCategoria(id);
            setCategorias(categorias.filter((cat) => cat.id !== id));
            toast.success('Categoria excluída com sucesso!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao excluir categoria. Tente novamente.';
            toast.error(message);
        } finally {
            setDeleting(null);
        }
    };

    const handleLeisChanged = () => {
        carregarDados();
    };

    const categoriasPaginadas = categorias.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

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
                            <FolderOpen className="h-6 w-6" />
                            Normativos
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie os normativos e subcategorias dos documentos
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <LeisCadastroDialog onLeisChanged={handleLeisChanged} />
                    <Button asChild className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg">
                        <Link href="/cadastros/normativos/novo">
                            <Plus className="mr-2 h-4 w-4" />
                            Incluir Categoria
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome da categoria..."
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
                                {leis.map((lei) => (
                                    <SelectItem key={lei.id} value={lei.id}>
                                        {lei.nome}
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
                        {loading ? 'Carregando...' : `${categorias.length} categoria(s) encontrada(s)`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : categorias.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma categoria encontrada.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categoriasPaginadas.map((cat) => (
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
                                            <div>
                                                <h4 className="font-medium">{cat.nome}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    {cat.titulo?.lei?.nome && (
                                                        <span>{cat.titulo.lei.nome}</span>
                                                    )}
                                                    {cat.titulo?.nome && (
                                                        <>
                                                            <span>→</span>
                                                            <span>{cat.titulo.nome}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {cat.titulo?.lei?.nome && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Scale className="h-3 w-3" />
                                                    {cat.titulo.lei.nome}
                                                </Badge>
                                            )}
                                            {cat.orgaos_vinculados && cat.orgaos_vinculados.length > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {cat.orgaos_vinculados.length} órgão(s)
                                                </Badge>
                                            )}
                                            <Badge variant="secondary">
                                                {cat.subcategorias?.length || 0} subcategoria(s)
                                            </Badge>
                                            <Badge
                                                variant={cat.ativo ? 'default' : 'destructive'}
                                                className={cat.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                                            >
                                                {cat.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            <div
                                                className="flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleEditar(cat.id)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleExcluir(cat.id)}
                                                    disabled={deleting === cat.id}
                                                >
                                                    {deleting === cat.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subcategorias expandidas */}
                                    {expandidas.includes(cat.id) && (
                                        <div className="border-t bg-muted/30 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium">Subcategorias</span>
                                            </div>
                                            {(!cat.subcategorias || cat.subcategorias.length === 0) ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    Nenhuma subcategoria cadastrada
                                                </p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nome</TableHead>
                                                            <TableHead>Descrição</TableHead>
                                                            <TableHead className="w-24">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {cat.subcategorias.map((sub) => (
                                                            <TableRow key={sub.id}>
                                                                <TableCell className="font-medium">
                                                                    {sub.nome}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-muted-foreground">
                                                                    {sub.descricao || '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={sub.ativo ? 'default' : 'destructive'}
                                                                        className={sub.ativo ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                                                                    >
                                                                        {sub.ativo ? 'Ativo' : 'Inativo'}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
                Exibindo {categorias.length} categoria(s)
            </div>
            <ListPagination currentPage={paginaAtual} totalItems={categorias.length} itemsPerPage={itensPorPagina} onPageChange={setPaginaAtual} itemLabel="categorias" />
        </div>
    );
}
