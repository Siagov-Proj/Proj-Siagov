'use client';

import { useState, useEffect } from 'react';
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
    ChevronLeft,
    ChevronRight,
    FileText,
    Loader2,
    Download,
    PanelLeft,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { compareNormativoLabels, stripNormativoCode } from '@/utils';

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
    const documentosPorPagina = 10;
    const router = useRouter();

    const [documentos, setDocumentos] = useState<IDocumentoDB[]>([]);
    const [estruturasMenu, setEstruturasMenu] = useState<TituloGroup[]>([]);
    const [processos, setProcessos] = useState<Pick<IProcessoDB, 'id' | 'numero'>[]>([]);
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);

    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroProcesso, setFiltroProcesso] = useState('todos');
    const [paginaAtual, setPaginaAtual] = useState(1);

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

    useEffect(() => {
        setPaginaAtual(1);
    }, [termoBusca, filtroCodigo, filtroProcesso, filtroLei, filtroCategoria, filtroSubcategoria]);

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
            const estruturasFinal = Array.from(gruposMap.values())
                .map((grupo) => ({
                    ...grupo,
                    categorias: grupo.categorias
                        .map((categoria) => ({
                            ...categoria,
                            subcategorias: [...categoria.subcategorias].sort((a, b) => compareNormativoLabels(a.nome, b.nome)),
                        }))
                        .sort((a, b) => compareNormativoLabels(a.nome, b.nome)),
                }))
                .sort((a, b) => a.tituloNome.localeCompare(b.tituloNome));

            setDocumentos(docsData);
            setEstruturasMenu(estruturasFinal);
            setProcessos(procsData);
            
            // Ordem das leis: Lei 14.133/2021 | Lei 13.019/14 | Lei 8.666/93
            const orderList = ['14.133', '13.019', '8.666'];
            const leisFinal = [...leisData].sort((a, b) => {
                const aIdx = orderList.findIndex(o => a.nome.includes(o));
                const bIdx = orderList.findIndex(o => b.nome.includes(o));
                const realAIdx = aIdx === -1 ? 99 : aIdx;
                const realBIdx = bIdx === -1 ? 99 : bIdx;
                return realAIdx - realBIdx;
            });
            setLeis(leisFinal);

            const leiPadrao = leisFinal.find(l => l.nome.includes('14.133')) || (leisFinal.length > 0 ? leisFinal[0] : null);

            if (leiPadrao) {
                setFiltroLei(leiPadrao.id);
            }

            // Auto-expand o primeiro título se existir, considerando a lei padrão
            if (estruturasFinal.length > 0 && leiPadrao) {
                const titulosDaLei = estruturasFinal.filter(group => group.categorias.some(c => c.titulo?.lei_id === leiPadrao.id));
                if (titulosDaLei.length > 0) {
                    setTituloExpandido(titulosDaLei[0].tituloId);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const subcategoriaParaCategoriaMap = new Map(
        estruturasMenu.flatMap((group) =>
            group.categorias.flatMap((categoria) =>
                categoria.subcategorias.map((subcategoria) => [subcategoria.id, categoria.id] as const)
            )
        )
    );

    // Lógica de Filtragem Client-side
    const documentosFiltrados = documentos.filter((doc) => {
        // Busca textual
        const searchLower = termoBusca.toLowerCase();
        const codigoLower = filtroCodigo.toLowerCase();
        const tituloMatch = doc.titulo.toLowerCase().includes(searchLower);
        const numeroMatch = doc.numero ? doc.numero.toLowerCase().includes(searchLower) : false;
        const processoMatch = doc.processo?.numero ? doc.processo.numero.toLowerCase().includes(searchLower) : false;
        const codigoMatch = !filtroCodigo || (doc.numero ? doc.numero.toLowerCase().includes(codigoLower) : false);

        const matchesBusca = !termoBusca || tituloMatch || numeroMatch || processoMatch;

        // Filtro de Processo
        const matchesProcesso = filtroProcesso === 'todos' || doc.processo_id === filtroProcesso;

        // Filtros Hierárquicos (Sidebar)
        const categoriaRelacionadaId = doc.categoria_id || (doc.subcategoria_id ? subcategoriaParaCategoriaMap.get(doc.subcategoria_id) : null);
        const matchesCategoria = !filtroCategoria || categoriaRelacionadaId === filtroCategoria;
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
                .find(c => c.id === categoriaRelacionadaId);

            const leiCatId = catDoc?.titulo?.lei_id;
            matchesLei = leiCatId === filtroLei;
        }

        return matchesBusca && codigoMatch && matchesProcesso && matchesCategoria && matchesSubcategoria && matchesLei;
    }).sort((a, b) => compareNormativoLabels(a.numero || '', b.numero || ''));

    const totalPaginas = Math.max(1, Math.ceil(documentosFiltrados.length / documentosPorPagina));
    const paginaNormalizada = Math.min(paginaAtual, totalPaginas);
    const indiceInicial = (paginaNormalizada - 1) * documentosPorPagina;
    const documentosPaginados = documentosFiltrados.slice(indiceInicial, indiceInicial + documentosPorPagina);

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

    const abrirDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const baixarArquivo = async (doc: IDocumentoDB) => {
        try {
            let signedUrl: string | null = null;
            const documentoCompleto = await documentosService.obterPorId(doc.id);

            if (!documentoCompleto) {
                throw new Error('Documento nao encontrado.');
            }

            try {
                const primeiroAnexo = documentoCompleto.anexos?.find((anexo) => Boolean(anexo.url));

                if (primeiroAnexo?.url) {
                    signedUrl = await documentosService.gerarUrlDownloadAnexo(primeiroAnexo.url);
                } else {
                    signedUrl = await documentosService.gerarUrlDownloadPDF(documentoCompleto.id);
                }
            } catch {
                signedUrl = await documentosService.gerarUrlDownloadPDF(documentoCompleto.id);
            }

            if (!signedUrl) {
                throw new Error('Arquivo nao disponivel para download.');
            }

            abrirDownload(signedUrl);

            try {
                await documentosService.registrarDownload(documentoCompleto.id);
            } catch (logError) {
                console.warn('Falha ao registrar log de download:', logError);
            }
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            alert('Nao foi possivel baixar o arquivo deste documento.');
        }
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
                        Documentos cadastrados no sistema
                    </p>
                </div>
            </div>

            {/* Main Area: Sidebar + Content */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* Sidebar - Categorias via Menus */}
                <Card className="w-full xl:w-[300px] shrink-0 h-fit border-border bg-card shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/30 px-4 pb-3">
                        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            <PanelLeft className="h-3.5 w-3.5" />
                            Titulos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-2 pb-6">
                        {/* Botão Global - Limpar Seleção */}
                        <div className="px-2">
                            <Button
                                onClick={selecionarTudoGlobal}
                                variant={!filtroCategoria && !filtroSubcategoria ? 'default' : 'outline'}
                                className={`w-full justify-start rounded-lg ${!filtroCategoria && !filtroSubcategoria
                                    ? 'border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                Todos os Titulos
                            </Button>
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando menu...
                            </div>
                        ) : estruturasExibidas.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Nenhum titulo encontrado para as leis selecionadas.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {estruturasExibidas.map((grupo) => (
                                    <div key={grupo.tituloId} className="flex flex-col">

                                        {/* Nível 1: Título (Accordion button) */}
                                        <button
                                            onClick={() => toggleTitulo(grupo.tituloId)}
                                            className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
                                        >
                                            <span className="text-left w-[90%] truncate">{stripNormativoCode(grupo.tituloNome)}</span>
                                            {tituloExpandido === grupo.tituloId ? (
                                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                        </button>

                                        {/* Exibição interna do Título expandido */}
                                        {tituloExpandido === grupo.tituloId && (
                                            <div className="ml-2 space-y-4 border-l-2 border-border/80 bg-muted/20 pb-4 pl-4 pr-2 pt-3">
                                                {grupo.categorias.map(cat => (
                                                    <div key={cat.id} className="flex flex-col space-y-1">

                                                        {/* Nível 2: Categoria (Label escuro, não clicável para filtrar exclusivamente se quiserem modelo da imagem, mas faremos clicável na linha de cima da sub) */}
                                                        <div className="px-2 py-1 text-xs font-bold leading-tight text-foreground">
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
                                                                                ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30 font-semibold'
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
                                        className={`rounded-full border px-4 font-medium text-xs ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                             }`}
                                    >
                                        {lei.nome}
                                    </Button>
                                );
                            })
                        )}
                    </div>

                    {/* Barra de Busca Avançada */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardContent className="p-2 sm:p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative w-full lg:flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título ou número..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="h-10 border-border bg-background pl-9"
                                    />
                                </div>
                                <Input
                                    placeholder="Filtrar por código"
                                    value={filtroCodigo}
                                    onChange={(e) => setFiltroCodigo(e.target.value)}
                                    className="h-10 w-full border-border bg-background lg:w-[220px]"
                                />
                                <Select value={filtroProcesso} onValueChange={setFiltroProcesso}>
                                    <SelectTrigger className="h-10 w-full border-border bg-background lg:w-[220px]">
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
                    <Card className="overflow-hidden border-border bg-card shadow-sm">
                        <div className="overflow-x-auto rounded-md">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-b border-border">
                                        <TableHead className="min-w-[320px] font-semibold text-foreground">Título do Documento</TableHead>
                                        <TableHead className="hidden min-w-[200px] font-semibold text-foreground md:table-cell">Categoria</TableHead>
                                        <TableHead className="hidden min-w-[200px] font-semibold text-foreground xl:table-cell">Subcategoria</TableHead>
                                        <TableHead className="w-[100px] text-center font-semibold text-foreground">Arquivo</TableHead>
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
                                    ) : documentosPaginados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                Nenhum documento encontrado com os filtros selecionados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        documentosPaginados.map((doc) => (
                                            <TableRow
                                                key={doc.id}
                                                className="group cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/30"
                                                onClick={() => router.push(`/documentos/${doc.id}`)}
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="min-w-[108px] rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-center dark:border-sky-400/30 dark:bg-sky-500/15">
                                                            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600 dark:text-sky-200/80">
                                                                Codigo
                                                            </span>
                                                            <span className="block text-sm font-semibold text-sky-950 dark:text-sky-100">
                                                                {doc.numero || '-'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="line-clamp-2 font-medium leading-tight text-foreground">
                                                                {doc.titulo}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(new Date(doc.created_at))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden align-top py-4 text-sm text-muted-foreground md:table-cell">
                                                    <div className="line-clamp-2">
                                                        {doc.categoria?.nome || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden align-top py-4 text-sm text-muted-foreground xl:table-cell">
                                                    <div className="line-clamp-2">
                                                        {doc.subcategoria?.nome || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-middle text-center py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Baixar Arquivo"
                                                        className="h-9 w-9 text-sky-600 hover:bg-sky-100 hover:text-sky-900 dark:text-sky-200 dark:hover:bg-sky-500/15 dark:hover:text-sky-100"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            baixarArquivo(doc);
                                                        }}
                                                    >
                                                        <Download className="h-5 w-5" strokeWidth={1.8} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {!loading && documentosFiltrados.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-border/60 pt-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {indiceInicial + 1}-{Math.min(indiceInicial + documentosPorPagina, documentosFiltrados.length)} de {documentosFiltrados.length} documentos
                            </p>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                                    disabled={paginaNormalizada === 1}
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Anterior
                                </Button>
                                <div className="min-w-[96px] text-center text-sm text-muted-foreground">
                                    Pagina {paginaNormalizada} de {totalPaginas}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                                    disabled={paginaNormalizada === totalPaginas}
                                >
                                    Proxima
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
