'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface IListPaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
}

export function ListPagination({
    currentPage,
    totalItems,
    itemsPerPage = 10,
    onPageChange,
    itemLabel = 'itens',
}: IListPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const normalizedPage = Math.min(currentPage, totalPages);
    const start = totalItems === 0 ? 0 : (normalizedPage - 1) * itemsPerPage + 1;
    const end = Math.min(normalizedPage * itemsPerPage, totalItems);

    if (totalItems <= itemsPerPage) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Mostrando {start}-{end} de {totalItems} {itemLabel}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, normalizedPage - 1))}
                    disabled={normalizedPage === 1}
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                </Button>
                <div className="min-w-[96px] text-center text-sm text-muted-foreground">
                    Página {normalizedPage} de {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, normalizedPage + 1))}
                    disabled={normalizedPage === totalPages}
                >
                    Próxima
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
