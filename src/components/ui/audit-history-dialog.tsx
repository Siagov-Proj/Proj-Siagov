'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Loader2, ArrowRight } from 'lucide-react';
import { auditService, IAuditLog } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditHistoryDialogProps {
    tableName: string;
    recordId?: string;
    buttonText?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AuditHistoryDialog({
    tableName,
    recordId,
    buttonText = 'Histórico',
    variant = 'outline',
    size = 'sm',
}: AuditHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState<IAuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);

    useEffect(() => {
        if (open) {
            carregarLogs();
        } else {
            setSelectedLog(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, tableName, recordId]);

    const carregarLogs = async () => {
        try {
            setLoading(true);
            const dados = await auditService.listarLogs(tableName, recordId);
            setLogs(dados);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT':
                return <Badge className="bg-green-500 hover:bg-green-600">Criação</Badge>;
            case 'UPDATE':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Edição</Badge>;
            case 'DELETE':
                return <Badge variant="destructive">Exclusão</Badge>;
            default:
                return <Badge variant="secondary">{action}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className="gap-2">
                    <History className="h-4 w-4" />
                    {buttonText && <span className={size === 'icon' ? 'sr-only' : ''}>{buttonText}</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Alterações {recordId ? '(Registro)' : `(${tableName})`}
                    </DialogTitle>
                    <DialogDescription>
                        Visualize quem, quando e o que foi alterado.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden min-h-[400px] gap-4">
                    {/* Lista de Logs - Esquerda */}
                    <div className="w-1/3 border rounded-md flex flex-col">
                        <div className="bg-muted p-2 border-b font-medium text-sm">
                            Linha do Tempo
                        </div>
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                Nenhum log encontrado.
                            </div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-2">
                                    {logs.map((log) => (
                                        <button
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className={`w-full text-left p-3 rounded-md border text-sm transition-colors ${selectedLog?.id === log.id
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'hover:bg-muted'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                {getActionBadge(log.action)}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </span>
                                            </div>
                                            <div className="text-muted-foreground text-xs truncate">
                                                Por: {log.usuario?.nome || log.usuario?.email || 'Sistema'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Detalhes do Log - Direita */}
                    <div className="flex-1 border rounded-md flex flex-col bg-muted/20">
                        {selectedLog ? (
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-1 flex items-center gap-2">
                                            Detalhes da {getActionBadge(selectedLog.action)}
                                        </h3>
                                        <div className="text-sm text-muted-foreground flex gap-4">
                                            <span>
                                                <strong>Por:</strong> {selectedLog.usuario?.nome || selectedLog.usuario?.email || 'Usuário Desconhecido'}
                                            </span>
                                            <span>
                                                <strong>Em:</strong> {formatDate(selectedLog.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {(selectedLog.action === 'UPDATE') && selectedLog.old_data && selectedLog.new_data && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm border-b pb-2">Campos Alterados</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.keys(selectedLog.new_data).map((key) => {
                                                    const oldVal = selectedLog.old_data[key];
                                                    const newVal = selectedLog.new_data[key];
                                                    // Only show fields that actually changed
                                                    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                                                        return (
                                                            <div key={key} className="bg-background border rounded p-3 text-sm">
                                                                <div className="font-mono font-bold mb-2">{key}:</div>
                                                                <div className="flex items-center gap-4 text-xs font-mono break-all">
                                                                    <div className="flex-1 bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 p-2 rounded">
                                                                        {oldVal === null || oldVal === undefined ? 'null' : (typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal))}
                                                                    </div>
                                                                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    <div className="flex-1 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 p-2 rounded">
                                                                        {newVal === null || newVal === undefined ? 'null' : (typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.action === 'INSERT' && selectedLog.new_data && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm border-b pb-2">Dados Criados</h4>
                                            <div className="bg-background border rounded p-4 text-xs font-mono overflow-auto max-h-[400px]">
                                                <pre>{JSON.stringify(selectedLog.new_data, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {selectedLog.action === 'DELETE' && selectedLog.old_data && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm border-b pb-2">Dados Excluídos</h4>
                                            <div className="bg-background border rounded p-4 text-xs font-mono overflow-auto max-h-[400px]">
                                                <pre>{JSON.stringify(selectedLog.old_data, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                <History className="h-12 w-12 mb-4 opacity-20" />
                                <p>Selecione um registro na linha do tempo para ver os detalhes da alteração.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
