'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search } from 'lucide-react';

export interface TransferItem {
    id: string;
    label: string;
    group?: string;
    description?: string;
}

interface TransferListProps {
    available: TransferItem[];
    assigned: TransferItem[];
    onAssign: (items: TransferItem[]) => void;
    onRemove: (items: TransferItem[]) => void;
    onAssignAll: () => void;
    onRemoveAll: () => void;
    leftTitle?: string;
    rightTitle?: string;
    groupBy?: boolean;
}

export function TransferList({
    available,
    assigned,
    onAssign,
    onRemove,
    onAssignAll,
    onRemoveAll,
    leftTitle = 'Disponíveis',
    rightTitle = 'Atribuídas',
    groupBy = true,
}: TransferListProps) {
    const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set());
    const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set());
    const [searchLeft, setSearchLeft] = useState('');
    const [searchRight, setSearchRight] = useState('');

    // Filtrar itens
    const filteredAvailable = useMemo(() => {
        if (!searchLeft) return available;
        const q = searchLeft.toLowerCase();
        return available.filter(
            (item) => item.label.toLowerCase().includes(q) || item.group?.toLowerCase().includes(q)
        );
    }, [available, searchLeft]);

    const filteredAssigned = useMemo(() => {
        if (!searchRight) return assigned;
        const q = searchRight.toLowerCase();
        return assigned.filter(
            (item) => item.label.toLowerCase().includes(q) || item.group?.toLowerCase().includes(q)
        );
    }, [assigned, searchRight]);

    // Agrupar por módulo
    const groupItems = (items: TransferItem[]) => {
        if (!groupBy) return { '': items };
        const groups: Record<string, TransferItem[]> = {};
        items.forEach((item) => {
            const key = item.group || 'Outros';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return groups;
    };

    const availableGroups = groupItems(filteredAvailable);
    const assignedGroups = groupItems(filteredAssigned);

    const toggleLeft = (id: string) => {
        setSelectedLeft((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleRight = (id: string) => {
        setSelectedRight((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAssign = () => {
        const items = available.filter((item) => selectedLeft.has(item.id));
        onAssign(items);
        setSelectedLeft(new Set());
    };

    const handleRemove = () => {
        const items = assigned.filter((item) => selectedRight.has(item.id));
        onRemove(items);
        setSelectedRight(new Set());
    };

    const toggleGroup = (
        items: TransferItem[],
        selected: Set<string>,
        setSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
    ) => {
        const allSelected = items.every((item) => selected.has(item.id));
        setSelected((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                items.forEach((item) => next.delete(item.id));
            } else {
                items.forEach((item) => next.add(item.id));
            }
            return next;
        });
    };

    const renderList = (
        groups: Record<string, TransferItem[]>,
        selected: Set<string>,
        toggle: (id: string) => void,
        search: string,
        setSearch: (val: string) => void,
        title: string,
        count: number,
        setSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
    ) => (
        <div className="flex-1 border rounded-lg overflow-hidden bg-white dark:bg-gray-950">
            {/* Header */}
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border-b">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
                    <span className="text-xs text-muted-foreground bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-7 text-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="h-[320px] overflow-y-auto">
                {Object.keys(groups).length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Nenhum item encontrado
                    </div>
                ) : (
                    Object.entries(groups).map(([group, items]) => {
                        const allGroupSelected = items.length > 0 && items.every((item) => selected.has(item.id));
                        const someGroupSelected = !allGroupSelected && items.some((item) => selected.has(item.id));

                        return (
                            <div key={group}>
                                {group && groupBy && (
                                    <div
                                        className="sticky top-0 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide border-b cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                                        onClick={() => toggleGroup(items, selected, setSelected)}
                                        title={allGroupSelected ? `Desmarcar todo o módulo ${group}` : `Selecionar todo o módulo ${group}`}
                                    >
                                        <div
                                            className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                                                ${allGroupSelected
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : someGroupSelected
                                                        ? 'bg-blue-300 border-blue-400 dark:bg-blue-700 dark:border-blue-600'
                                                        : 'border-blue-400 dark:border-blue-500'
                                                }`}
                                        >
                                            {allGroupSelected && (
                                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            {someGroupSelected && (
                                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            )}
                                        </div>
                                        {group}
                                    </div>
                                )}
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggle(item.id)}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm border-b border-gray-50 dark:border-gray-900 transition-colors
                                            ${selected.has(item.id)
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                            }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                                                ${selected.has(item.id)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            {selected.has(item.id) && (
                                                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate">{item.label}</p>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            {renderList(availableGroups, selectedLeft, toggleLeft, searchLeft, setSearchLeft, leftTitle, available.length, setSelectedLeft)}

            {/* Central buttons */}
            <div className="flex sm:flex-col items-center justify-center gap-1.5 py-2 sm:py-0">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onAssignAll}
                    title="Mover todos para a direita"
                    disabled={available.length === 0}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleAssign}
                    title="Mover selecionados para a direita"
                    disabled={selectedLeft.size === 0}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRemove}
                    title="Mover selecionados para a esquerda"
                    disabled={selectedRight.size === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onRemoveAll}
                    title="Mover todos para a esquerda"
                    disabled={assigned.length === 0}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </div>

            {renderList(assignedGroups, selectedRight, toggleRight, searchRight, setSearchRight, rightTitle, assigned.length, setSelectedRight)}
        </div>
    );
}
