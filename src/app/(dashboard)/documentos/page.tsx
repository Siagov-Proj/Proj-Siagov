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
import {
    Search,
    ChevronDown,
    ChevronRight,
    FileText,
    FolderOpen,
    Loader2,
    Cloud,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

// Services
import { documentosService, IDocumentoDB } from '@/services/api/documentosService';
import { categoriasDocService, ICategoriaDocumentoDB, ISubcategoriaDocumentoDB } from '@/services/api/categoriasDocService';
import { processosService, IProcessoDB } from '@/services/api/processosService';
import { leisNormativasService, ILeiNormativaDB } from '@/services/api/leisNormativasService';

// Interfaces estendidas para a renderização na Sidebar
interface CategoryWithSubs extends ICategoriaDocumentoDB {
    subcategorias: ISubcategoriaDocumentoDB[];
}

interface TituloGroup {
    tituloId: string;
    tituloNome: string;
    categorias: CategoryWithSubs[];
}

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<IDocumentoDB[]>([]);
    const [estruturasMenu, setEstruturasMenu] = useState<TituloGroup[]>([]);
    const [processos, setProcessos] = useState<Pick<IProcessoDB, 'id' | 'numero'>[]>([]);
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);

    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroProcesso, setFiltroProcesso] = useState('todos');

    // Status de Filtros
    // null = listando todos globalmente no projeto
    const [filtroLei, setFiltroLei] = useState<string | null>(null);
    const [tituloExpandido, setTituloExpandido] = useState<string | null>(null);

    // Filtros selecionados para tabela
    const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
    const [filtroSubcategoria, setFiltroSubcategoria] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        // Ao trocar de lei, desmarcar categoria/subcategoria para evitar resultados vazios confusos
        setFiltroCategoria(null);
        setFiltroSubcategoria(null);
        setTituloExpandido(null);
    }, [filtroLei]);

    const carregarDados = async () => {
        try {
            setLoading(true);

            // Fetch dados base em paralelo
            const [docsData, catsData, procsData, leisData] = await Promise.all([
                documentosService.listar(),
                categoriasDocService.listarCategorias(),
                processosService.listarParaSelect(),
                leisNormativasService.listarAtivas()
            ]);

            // Buscar subcategorias e montar a estrutura agrupada por Título
            const categoriasComSub = await Promise.all(
                catsData.map(async (cat) => {
                    const subs = await categoriasDocService.listarSubcategorias(cat.id);
                    return { ...cat, subcategorias: subs };
                })
            );

            // Agrupar por Título
            const gruposMap = new Map<string, TituloGroup>();

            categoriasComSub.forEach(cat => {
                const tituloId = cat.titulo_id || 'sem-titulo';
                const tituloNome = cat.titulo?.nome || 'Outros / Sem Título';

                if (!gruposMap.has(tituloId)) {
                    gruposMap.set(tituloId, {
                        tituloId,
                        tituloNome,
                        categorias: []
                    });
                }
                gruposMap.get(tituloId)!.categorias.push(cat);
            });

            // Converter mapa para array e ordenar
            const estruturasFinal = Array.from(gruposMap.values()).sort((a, b) =>
                a.tituloNome.localeCompare(b.tituloNome)
            );

            setDocumentos(docsData);
            setEstruturasMenu(estruturasFinal);
            setProcessos(procsData);
            setLeis(leisData);

            // Auto-expand o primeiro título se existir
            if (estruturasFinal.length > 0) {
                setTituloExpandido(estruturasFinal[0].tituloId);
            }

            // Auto-selecionar a primeira lei se houver, para manter coerência visual (opcional - mantive padrão null/todas)

        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Filtragem Client-side
    const documentosFiltrados = documentos.filter((doc) => {
        // Busca textual
        const searchLower = termoBusca.toLowerCase();
        const tituloMatch = doc.titulo.toLowerCase().includes(searchLower);
        const numeroMatch = doc.numero ? doc.numero.toLowerCase().includes(searchLower) : false;
        const processoMatch = doc.processo?.numero ? doc.processo.numero.toLowerCase().includes(searchLower) : false;

        const matchesBusca = !termoBusca || tituloMatch || numeroMatch || processoMatch;

        // Filtro de Processo
        const matchesProcesso = filtroProcesso === 'todos' || doc.processo_id === filtroProcesso;

        // Filtros Hierárquicos (Sidebar)
        const matchesCategoria = !filtroCategoria || doc.categoria_id === filtroCategoria;
        const matchesSubcategoria = !filtroSubcategoria || doc.subcategoria_id === filtroSubcategoria;

        // Filtro de Lei (Botões Superiores)
        // Considerando que o documento está associado à categoria, que está associada ao título, que está na lei
        // Verificamos a lei do doc ou a lei do título da categoria do doc
        // Adaptaremos baseado na estrutura. Se `doc.categoria.titulo.lei_id` estivesse disponível, usaríamos ele.
        // Como o doc retorna uma view tipada em IDocumentoDB que pode não ter a hierarquia completa profundamente populada,
        // vamos comparar o lei_id do título associado a essa categoria.

        let matchesLei = true;
        if (filtroLei) {
            // Tentamos encontrar se a categoria desse doc pertence à lei filtrada
            const catDoc = estruturasMenu
                .flatMap(group => group.categorias)
                .find(c => c.id === doc.categoria_id);

            const leiCatId = catDoc?.titulo?.lei_id;
            matchesLei = leiCatId === filtroLei;
        }

        return matchesBusca && matchesProcesso && matchesCategoria && matchesSubcategoria && matchesLei;
    });

    const toggleTitulo = (tituloId: string) => {
        setTituloExpandido(tituloExpandido === tituloId ? null : tituloId);
    };

    const selecionarTudoGlobal = () => {
        setFiltroCategoria(null);
        setFiltroSubcategoria(null);
        setFiltroLei(null);
    };

    const selecionarFiltroSidebar = (categoriaId: string, subcategoriaId?: string) => {
        setFiltroCategoria(categoriaId);
        setFiltroSubcategoria(subcategoriaId || null);
    };

    // Filtro as estruturas da sidebar apenas para exibir o que pertence à Lei selecionada (se houver)
    const estruturasExibidas = filtroLei
        ? estruturasMenu.filter(group => group.categorias.some(c => c.titulo?.lei_id === filtroLei))
        : estruturasMenu;

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
                        Documentos gerados pelos especialistas de IA
                    </p>
                </div>
            </div>

            {/* Main Area: Sidebar + Content */}
            <div className="flex flex-col md:flex-row gap-6">

                {/* Sidebar - Categorias via Menus */}
                <Card className="w-full md:w-80 shrink-0 h-fit">
                    <CardHeader className="pb-3 px-4">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Categorias
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-2 pb-6">
                        {/* Botão Global - Limpar Seleção */}
                        <div className="px-2">
                            <Button
                                onClick={selecionarTudoGlobal}
                                variant={!filtroCategoria && !filtroSubcategoria ? 'default' : 'outline'}
                                className="w-full justify-start bg-[#003366] text-white hover:bg-[#002244] hover:text-white"
                            >
                                Todas as Categorias
                            </Button>
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando menu...
                            </div>
                        ) : estruturasExibidas.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Nenhuma categoria encontrada para as leis selecionadas.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {estruturasExibidas.map((grupo) => (
                                    <div key={grupo.tituloId} className="flex flex-col">

                                        {/* Nível 1: Título (Accordion button) */}
                                        <button
                                            onClick={() => toggleTitulo(grupo.tituloId)}
                                            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="text-left w-[90%] truncate">{grupo.tituloNome}</span>
                                            {tituloExpandido === grupo.tituloId ? (
                                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                        </button>

                                        {/* Exibição interna do Título expandido */}
                                        {tituloExpandido === grupo.tituloId && (
                                            <div className="pl-4 pr-2 pt-2 pb-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20 border-l-2 border-primary/20 ml-2">
                                                {grupo.categorias.map(cat => (
                                                    <div key={cat.id} className="flex flex-col space-y-1">

                                                        {/* Nível 2: Categoria (Label escuro, não clicável para filtrar exclusivamente se quiserem modelo da imagem, mas faremos clicável na linha de cima da sub) */}
                                                        <div
                                                            className="text-xs font-bold text-foreground leading-tight px-2 py-1"
                                                        >
                                                            {cat.nome}
                                                        </div>

                                                        {/* Nível 3: Subcategorias (Clicáveis como filtros reais) */}
                                                        <div className="flex flex-col space-y-0.5 mt-1">
                                                            {cat.subcategorias.length === 0 ? (
                                                                <span className="text-xs px-2 py-1 text-muted-foreground/60 italic">Sem subcategorias</span>
                                                            ) : (
                                                                cat.subcategorias.map(sub => {
                                                                    const isActive = filtroCategoria === cat.id && filtroSubcategoria === sub.id;
                                                                    return (
                                                                        <button
                                                                            key={sub.id}
                                                                            onClick={() => selecionarFiltroSidebar(cat.id, sub.id)}
                                                                            className={`text-left text-xs px-2 py-2 rounded-md transition-colors leading-tight ${isActive
                                                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                                }`}
                                                                        >
                                                                            {sub.nome}
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Área Principal - Lista */}
                <div className="flex-1 space-y-4">

                    {/* Filtros Superiores de LEI (Pills Dinâmicas) */}
                    <div className="flex flex-wrap gap-2 pb-1">
                        {loading ? (
                            <span className="text-sm text-muted-foreground">Carregando filtros de leis...</span>
                        ) : leis.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">Nenhuma lei ativa cadastrada.</span>
                        ) : (
                            leis.map((lei) => {
                                const isActive = filtroLei === lei.id;
                                return (
                                    <Button
                                        key={lei.id}
                                        variant={isActive ? 'default' : 'secondary'}
                                        size="sm"
                                        onClick={() => setFiltroLei(isActive ? null : lei.id)}
                                        className={`rounded-full px-4 font-normal text-xs ${isActive ? 'bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-sm' : ''
                                            }`}
                                    >
                                        {lei.nome}
                                    </Button>
                                );
                            })
                        )}
                    </div>

                    {/* Barra de Busca Avançada */}
                    <Card>
                        <CardContent className="p-2 sm:p-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative w-full flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título ou número..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="pl-9 h-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
                                    />
                                </div>
                                <Select value={filtroProcesso} onValueChange={setFiltroProcesso}>
                                    <SelectTrigger className="w-full sm:w-[220px] h-10">
                                        <SelectValue placeholder="Filtrar por Processo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Filtrar por Processo</SelectItem>
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

                    {/* Tabela de Resultados (Estilo Minimalista) */}
                    <Card className="border-t-4 border-t-primary/20 shadow-sm">
                        <div className="overflow-x-auto rounded-md">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow className="border-b-gray-100 dark:border-b-gray-800">
                                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 min-w-[300px]">Título do Documento</TableHead>
                                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell min-w-[200px]">Categoria</TableHead>
                                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 hidden xl:table-cell min-w-[200px]">Subcategoria</TableHead>
                                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center w-[100px]">Arquivo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                    <span className="text-sm">Buscando documentos...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : documentosFiltrados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                Nenhum documento encontrado com os filtros selecionados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        documentosFiltrados.map((doc) => (
                                            <TableRow
                                                key={doc.id}
                                                className="group cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors border-b-gray-100 dark:border-b-gray-800/60"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                                                            {doc.titulo}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            {doc.numero ? `Nº ${doc.numero}` : 'Sem Número'}
                                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                            {formatDate(new Date(doc.created_at))}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell align-top py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="line-clamp-2">
                                                        {doc.categoria?.nome || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell align-top py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="line-clamp-2">
                                                        {doc.subcategoria?.nome || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle text-center py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Visualizar Arquivo"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                                                        asChild
                                                    >
                                                        <Link href={`/documentos/${doc.id}`}>
                                                            <Cloud className="h-5 w-5" strokeWidth={1.5} />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
