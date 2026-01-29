'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileText, Plus, Link2 } from 'lucide-react';

interface Documento {
    id: string;
    numero: string;
    titulo: string;
    tipo: string;
    status: string;
    criadoEm: Date;
}

interface VincularDocumentoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processoId: string;
    processoNumero: string;
    onVincular: (documentoIds: string[]) => void;
    onCriarNovo: () => void;
}

// Documentos mock disponíveis para vinculação
const mockDocumentos: Documento[] = [
    {
        id: 'd1',
        numero: '2024-001',
        titulo: 'Parecer Técnico - Pregão 15/2024',
        tipo: 'Parecer',
        status: 'Concluído',
        criadoEm: new Date('2025-01-18'),
    },
    {
        id: 'd2',
        numero: '2024-002',
        titulo: 'Nota Técnica - Análise de Preços',
        tipo: 'Nota Técnica',
        status: 'Em Revisão',
        criadoEm: new Date('2025-01-20'),
    },
    {
        id: 'd3',
        numero: '2024-003',
        titulo: 'Termo de Referência - Materiais',
        tipo: 'Termo de Referência',
        status: 'Concluído',
        criadoEm: new Date('2025-01-15'),
    },
    {
        id: 'd4',
        numero: '2024-004',
        titulo: 'Relatório de Pesquisa de Preços',
        tipo: 'Relatório',
        status: 'Rascunho',
        criadoEm: new Date('2025-01-22'),
    },
    {
        id: 'd5',
        numero: '2024-005',
        titulo: 'Edital - Pregão Eletrônico',
        tipo: 'Edital',
        status: 'Concluído',
        criadoEm: new Date('2025-01-10'),
    },
];

export function VincularDocumentoModal({
    open,
    onOpenChange,
    processoId,
    processoNumero,
    onVincular,
    onCriarNovo,
}: VincularDocumentoModalProps) {
    const [termoBusca, setTermoBusca] = useState('');
    const [selecionados, setSelecionados] = useState<string[]>([]);

    const documentosFiltrados = mockDocumentos.filter(
        (doc) =>
            doc.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
            doc.numero.includes(termoBusca) ||
            doc.tipo.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const toggleSelecao = (id: string) => {
        if (selecionados.includes(id)) {
            setSelecionados(selecionados.filter((s) => s !== id));
        } else {
            setSelecionados([...selecionados, id]);
        }
    };

    const handleVincular = () => {
        if (selecionados.length > 0) {
            onVincular(selecionados);
            setSelecionados([]);
            setTermoBusca('');
            onOpenChange(false);
        }
    };

    const handleCriarNovo = () => {
        onCriarNovo();
        onOpenChange(false);
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Vincular Documento
                    </DialogTitle>
                    <DialogDescription>
                        Selecione documentos existentes para vincular ao Processo {processoNumero}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Busca e Criar Novo */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por título, número ou tipo..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" onClick={handleCriarNovo}>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Novo
                        </Button>
                    </div>

                    {/* Lista de Documentos */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead className="w-24">Número</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead className="w-32">Tipo</TableHead>
                                    <TableHead className="w-24">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documentosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum documento encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documentosFiltrados.map((doc) => (
                                        <TableRow
                                            key={doc.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleSelecao(doc.id)}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selecionados.includes(doc.id)}
                                                    onCheckedChange={() => toggleSelecao(doc.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{doc.numero}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="line-clamp-1">{doc.titulo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{doc.tipo}</TableCell>
                                            <TableCell>
                                                <Badge variant={obterCorStatus(doc.status)}>{doc.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Selecionados */}
                    {selecionados.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {selecionados.length} documento(s) selecionado(s)
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleVincular} disabled={selecionados.length === 0}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Vincular ({selecionados.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
