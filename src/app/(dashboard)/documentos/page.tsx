'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    Eye,
    Download,
    ChevronDown,
    ChevronRight,
    FileText,
    FolderOpen,
    Loader2
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

// Services
import { documentosService, IDocumentoDB } from '@/services/api/documentosService';
import { categoriasDocService, ICategoriaDocumentoDB, ISubcategoriaDocumentoDB } from '@/services/api/categoriasDocService';
import { processosService, IProcessoDB } from '@/services/api/processosService';

interface CategoryStructure extends ICategoriaDocumentoDB {
    subcategorias: ISubcategoriaDocumentoDB[];
}

const LEIS = ['Lei 14.133/2021', 'Lei 8.666/93', 'Lei 13.019/14'];

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<IDocumentoDB[]>([]);
    const [categorias, setCategorias] = useState<CategoryStructure[]>([]);
    const [processos, setProcessos] = useState<Pick<IProcessoDB, 'id' | 'numero'>[]>([]);

    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroProcesso, setFiltroProcesso] = useState('todos');
    const [filtroLei, setFiltroLei] = useState<string | null>(null);
    const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState('Todas');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch Basics
            const [docsData, catsData, procsData] = await Promise.all([
                documentosService.listar(),
                categoriasDocService.listarCategorias(),
                processosService.listarParaSelect()
            ]);

            // Fetch Subcategories for sidebar structure (parallelized)
            const catsWithSubs = await Promise.all(catsData.map(async (cat) => {
                const subs = await categoriasDocService.listarSubcategorias(cat.id);
                return { ...cat, subcategorias: subs };
            }));

            setDocumentos(docsData);
            setCategorias(catsWithSubs);
            setProcessos(procsData);

            // Auto expand first category if exists
            if (catsWithSubs.length > 0) {
                setCategoriaExpandida(catsWithSubs[0].nome);
            }

        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering logic
    const documentosFiltrados = documentos.filter((doc) => {
        // Text Search
        const searchLower = termoBusca.toLowerCase();
        const tituloMatch = doc.titulo.toLowerCase().includes(searchLower);
        const numeroMatch = doc.numero ? doc.numero.toLowerCase().includes(searchLower) : false;
        const processoMatch = doc.processo?.numero ? doc.processo.numero.toLowerCase().includes(searchLower) : false;

        const matchesBusca = !termoBusca || tituloMatch || numeroMatch || processoMatch;

        // Filters
        const matchesProcesso = filtroProcesso === 'todos' || doc.processo_id === filtroProcesso;

        const catNome = doc.categoria?.nome || '';
        const subNome = doc.subcategoria?.nome || '';

        const matchesCategoria = filtroCategoria === 'Todas' || catNome === filtroCategoria;
        const matchesSubcategoria = filtroSubcategoria === 'Todas' || subNome === filtroSubcategoria;

        // Lei filter - assuming lei is on view model or doc
        const docLei = doc.lei || doc.categoria?.lei;
        const matchesLei = !filtroLei || docLei === filtroLei;

        return matchesBusca && matchesProcesso && matchesCategoria && matchesSubcategoria && matchesLei;
    });

    const toggleCategoria = (nome: string) => {
        setCategoriaExpandida(categoriaExpandida === nome ? null : nome);
    };

    const selecionarFiltro = (categoria: string, subcategoria?: string) => {
        setFiltroCategoria(categoria);
        setFiltroSubcategoria(subcategoria || 'Todas');
    };

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Concluído': return 'default';
            case 'Em Revisão': return 'secondary';
            case 'Rascunho': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Documentos
                    </h1>
                    <p className="text-muted-foreground">
                        Documentos gerados e vinculados aos processos
                    </p>
                </div>
                <Button asChild>
                    <Link href="/documentos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Documento
                    </Link>
                </Button>
            </div>

            {/* Layout Two-Column */}
            <div className="flex gap-6">
                {/* Sidebar de Categorias */}
                <Card className="w-64 shrink-0 hidden md:block">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                            Categorias
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {/* Todas */}
                        <button
                            onClick={() => selecionarFiltro('Todas')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filtroCategoria === 'Todas'
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Todas as Categorias
                            </div>
                        </button>

                        {/* Accordion de Categorias Dynamically Loaded */}
                        {loading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Carregando...</div>
                        ) : categorias.map((cat) => (
                            <div key={cat.id}>
                                <button
                                    onClick={() => toggleCategoria(cat.nome)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filtroCategoria === cat.nome &&
                                        filtroSubcategoria === 'Todas'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <span>{cat.nome}</span>
                                    {categoriaExpandida === cat.nome ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Subcategorias */}
                                {categoriaExpandida === cat.nome && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {cat.subcategorias.map((sub) => (
                                            <button
                                                key={sub.id}
                                                onClick={() => selecionarFiltro(cat.nome, sub.nome)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filtroCategoria === cat.nome &&
                                                    filtroSubcategoria === sub.nome
                                                    ? 'bg-secondary text-secondary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {sub.nome}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Área Principal */}
                <div className="flex-1 space-y-4">
                    {/* Botões de Filtro por Lei */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {LEIS.map((lei) => (
                            <Button
                                key={lei}
                                variant={filtroLei === lei ? 'default' : 'secondary'}
                                size="sm"
                                onClick={() => setFiltroLei(filtroLei === lei ? null : lei)}
                                className="whitespace-nowrap"
                            >
                                {lei}
                            </Button>
                        ))}
                    </div>

                    {/* Barra de Filtros */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título ou número..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filtroProcesso}
                                    onValueChange={setFiltroProcesso}
                                >
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Filtrar por processo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">
                                            Todos os Processos
                                        </SelectItem>
                                        {processos.map((proc) => (
                                            <SelectItem key={proc.id} value={proc.id}>
                                                Processo {proc.numero}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabela de Documentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Documentos</CardTitle>
                            <CardDescription>
                                {documentosFiltrados.length} documento(s) encontrado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título do Documento</TableHead>
                                            <TableHead className="w-32 hidden md:table-cell">Categoria</TableHead>
                                            <TableHead className="w-40 hidden lg:table-cell">Subcategoria</TableHead>
                                            <TableHead className="w-24">Status</TableHead>
                                            <TableHead className="w-20 text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Carregando documentos...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : documentosFiltrados.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    Nenhum documento encontrado com os filtros aplicados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            documentosFiltrados.map((doc) => (
                                                <TableRow
                                                    key={doc.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {doc.titulo}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {doc.numero ? `Nº ${doc.numero}` : 'Sem Número'}
                                                                {' • '}
                                                                {formatDate(new Date(doc.created_at))}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {doc.categoria?.nome || '-'}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        {doc.subcategoria?.nome || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={obterCorStatus(doc.status)}>
                                                            {doc.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                            >
                                                                <Link href={`/documentos/${doc.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Baixar"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert('Download não implementado');
                                                                }}
                                                            >
                                                                <Download className="h-4 w-4" />
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
            </div>
        </div>
    );
}
