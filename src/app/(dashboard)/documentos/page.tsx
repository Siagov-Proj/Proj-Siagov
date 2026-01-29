'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

// Tipos
interface IDocumento {
    id: string;
    numero: string;
    titulo: string;
    tipo: string;
    categoria: string;
    subcategoria: string;
    lei: string;
    processoId: string;
    processoNumero: string;
    status: 'Rascunho' | 'Em Revisão' | 'Concluído';
    criadoEm: Date;
}

interface ICategoria {
    nome: string;
    lei: string;
    subcategorias: string[];
}

// Dados mock
const mockDocumentos: IDocumento[] = [
    {
        id: 'd1',
        numero: '2024-001',
        titulo: 'Parecer Técnico - Pregão 15/2024',
        tipo: 'Parecer',
        categoria: 'Licitações',
        subcategoria: 'Pregão Eletrônico',
        lei: 'Lei 14.133/2021',
        processoId: '1',
        processoNumero: '001/2024',
        status: 'Concluído',
        criadoEm: new Date('2025-01-18'),
    },
    {
        id: 'd2',
        numero: '2024-002',
        titulo: 'Nota Técnica - Dispensa 08/2024',
        tipo: 'Nota Técnica',
        categoria: 'Licitações',
        subcategoria: 'Dispensa de Licitação',
        lei: 'Lei 14.133/2021',
        processoId: '1',
        processoNumero: '001/2024',
        status: 'Em Revisão',
        criadoEm: new Date('2025-01-17'),
    },
    {
        id: 'd3',
        numero: '2024-003',
        titulo: 'Relatório de Gestão RH - Jan/2025',
        tipo: 'Relatório',
        categoria: 'Recursos Humanos',
        subcategoria: 'Relatórios',
        lei: 'Lei 13.019/14',
        processoId: '2',
        processoNumero: '002/2024',
        status: 'Rascunho',
        criadoEm: new Date('2025-01-16'),
    },
    {
        id: 'd4',
        numero: '2024-004',
        titulo: 'DFD - Documento de Formalização de Demanda',
        tipo: 'DFD',
        categoria: 'Licitações',
        subcategoria: 'Contratação Direta',
        lei: 'Lei 14.133/2021',
        processoId: '1',
        processoNumero: '001/2024',
        status: 'Concluído',
        criadoEm: new Date('2025-01-15'),
    },
    {
        id: 'd5',
        numero: '2024-005',
        titulo: 'Termo de Referência - Material de Expediente',
        tipo: 'Termo de Referência',
        categoria: 'Licitações',
        subcategoria: 'Pregão Eletrônico',
        lei: 'Lei 8.666/93',
        processoId: '1',
        processoNumero: '001/2024',
        status: 'Em Revisão',
        criadoEm: new Date('2025-01-16'),
    },
    {
        id: 'd6',
        numero: '2024-006',
        titulo: 'Edital Pregão Eletrônico 10/2024',
        tipo: 'Edital',
        categoria: 'Licitações',
        subcategoria: 'Pregão Eletrônico',
        lei: 'Lei 8.666/93',
        processoId: '3',
        processoNumero: '003/2024',
        status: 'Concluído',
        criadoEm: new Date('2025-01-14'),
    },
    {
        id: 'd7',
        numero: '2024-007',
        titulo: 'Ata de Registro de Preços 05/2024',
        tipo: 'Ata',
        categoria: 'Contratos',
        subcategoria: 'Atas de Registro',
        lei: 'Lei 8.666/93',
        processoId: '4',
        processoNumero: '004/2024',
        status: 'Concluído',
        criadoEm: new Date('2025-01-13'),
    },
    {
        id: 'd8',
        numero: '2024-008',
        titulo: 'Minuta Contratual - Serviços de Limpeza',
        tipo: 'Minuta',
        categoria: 'Contratos',
        subcategoria: 'Minutas',
        lei: 'Lei 14.133/2021',
        processoId: '5',
        processoNumero: '005/2024',
        status: 'Em Revisão',
        criadoEm: new Date('2025-01-12'),
    },
];

const categorias: ICategoria[] = [
    {
        nome: 'Licitações',
        lei: 'Lei 14.133/2021',
        subcategorias: [
            'Pregão Eletrônico',
            'Dispensa de Licitação',
            'Contratação Direta',
            'Inexigibilidade',
        ],
    },
    {
        nome: 'Contratos',
        lei: 'Lei 8.666/93',
        subcategorias: ['Minutas', 'Atas de Registro', 'Aditivos', 'Rescisões'],
    },
    {
        nome: 'Recursos Humanos',
        lei: 'Lei 13.019/14',
        subcategorias: ['Relatórios', 'Portarias', 'Pareceres'],
    },
    {
        nome: 'Orçamento e Finanças',
        lei: 'Lei 14.133/2021',
        subcategorias: [
            'Notas Técnicas',
            'Relatórios Financeiros',
            'Prestação de Contas',
        ],
    },
];

const LEIS = ['Lei 14.133/2021', 'Lei 8.666/93', 'Lei 13.019/14'];

export default function DocumentosPage() {
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroProcesso, setFiltroProcesso] = useState('todos');
    const [filtroLei, setFiltroLei] = useState<string | null>(null);
    const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(
        'Licitações'
    );
    const [filtroCategoria, setFiltroCategoria] = useState('Todas');
    const [filtroSubcategoria, setFiltroSubcategoria] = useState('Todas');

    // Processos únicos para filtro
    const processosUnicos = Array.from(
        new Set(mockDocumentos.map((d) => d.processoNumero))
    );

    // Filtrar categorias baseado na lei
    const categoriasFiltradas = filtroLei
        ? categorias.filter((cat) => cat.lei === filtroLei)
        : categorias;

    // Filtrar documentos
    const documentosFiltrados = mockDocumentos.filter((doc) => {
        const matchesBusca =
            doc.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
            doc.numero.includes(termoBusca) ||
            doc.processoNumero.includes(termoBusca);
        const matchesProcesso =
            filtroProcesso === 'todos' ||
            doc.processoNumero === filtroProcesso;
        const matchesCategoria =
            filtroCategoria === 'Todas' || doc.categoria === filtroCategoria;
        const matchesSubcategoria =
            filtroSubcategoria === 'Todas' ||
            doc.subcategoria === filtroSubcategoria;
        const matchesLei = !filtroLei || doc.lei === filtroLei;
        return (
            matchesBusca &&
            matchesProcesso &&
            matchesCategoria &&
            matchesSubcategoria &&
            matchesLei
        );
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
            case 'Concluído':
                return 'default';
            case 'Em Revisão':
                return 'secondary';
            case 'Rascunho':
                return 'outline';
            default:
                return 'outline';
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

            </div>

            {/* Layout Two-Column */}
            <div className="flex gap-6">
                {/* Sidebar de Categorias */}
                <Card className="w-64 shrink-0">
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

                        {/* Accordion de Categorias */}
                        {categoriasFiltradas.map((cat) => (
                            <div key={cat.nome}>
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
                                                key={sub}
                                                onClick={() =>
                                                    selecionarFiltro(
                                                        cat.nome,
                                                        sub
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filtroCategoria ===
                                                    cat.nome &&
                                                    filtroSubcategoria === sub
                                                    ? 'bg-secondary text-secondary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {sub}
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
                    <div className="flex gap-3">
                        {LEIS.map((lei) => (
                            <Button
                                key={lei}
                                variant={
                                    filtroLei === lei ? 'default' : 'secondary'
                                }
                                size="sm"
                                onClick={() =>
                                    setFiltroLei(
                                        filtroLei === lei ? null : lei
                                    )
                                }
                                className="transition-all"
                            >
                                {lei}
                            </Button>
                        ))}
                    </div>

                    {/* Barra de Filtros */}
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por título ou número..."
                                        value={termoBusca}
                                        onChange={(e) =>
                                            setTermoBusca(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filtroProcesso}
                                    onValueChange={setFiltroProcesso}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por processo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">
                                            Todos os Processos
                                        </SelectItem>
                                        {processosUnicos.map((proc) => (
                                            <SelectItem key={proc} value={proc}>
                                                Processo {proc}
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
                                {documentosFiltrados.length} documento(s)
                                encontrado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Título do Documento
                                            </TableHead>
                                            <TableHead className="w-32">
                                                Categoria
                                            </TableHead>
                                            <TableHead className="w-40">
                                                Subcategoria
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Status
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                Ações
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documentosFiltrados.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center py-8 text-muted-foreground"
                                                >
                                                    Nenhum documento encontrado
                                                    com os filtros aplicados.
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
                                                                Nº {doc.numero}{' '}
                                                                •{' '}
                                                                {formatDate(
                                                                    doc.criadoEm
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.categoria}
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.subcategoria}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={obterCorStatus(
                                                                doc.status
                                                            )}
                                                        >
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
                                                                <Link
                                                                    href={`/documentos/${doc.id}`}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Baixar"
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
