'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

interface SmartDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    onConfirm: () => Promise<void>;
    onCheckDependencies: () => Promise<{ podeExcluir: boolean; relatorios: string[] }>;
}

export function SmartDeleteDialog({
    open,
    onOpenChange,
    title,
    description = "Tem certeza que deseja excluir este item? Esta ação não poderá ser desfeita.",
    onConfirm,
    onCheckDependencies,
}: SmartDeleteDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dependencias, setDependencias] = useState<{ podeExcluir: boolean; relatorios: string[] } | null>(null);

    useEffect(() => {
        if (open) {
            let isMounted = true;
            setLoading(true);
            setDependencias(null);
            onCheckDependencies()
                .then(res => {
                    if (isMounted) setDependencias(res);
                })
                .catch(err => {
                    console.error(err);
                    if (isMounted) setDependencias({ podeExcluir: false, relatorios: ['Erro ao verificar dependências. Tente novamente.'] });
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });

            return () => {
                isMounted = false;
            };
        }
    }, [open, onCheckDependencies]);

    const handleConfirm = async () => {
        try {
            setDeleting(true);
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={!deleting ? onOpenChange : undefined}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {dependencias && !dependencias.podeExcluir ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        ) : (
                            <Trash2 className="h-5 w-5 text-destructive" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-sm">Verificando dependências...</p>
                        </div>
                    ) : dependencias && !dependencias.podeExcluir ? (
                        <div className="space-y-4 rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                Não é possível excluir. Existem dependências ativas:
                            </h4>
                            <ul className="list-disc pl-5 text-sm text-amber-800 dark:text-amber-300">
                                {dependencias.relatorios.map((relatorio, index) => (
                                    <li key={index}>{relatorio}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                                Remova ou reatribua os itens acima antes de tentar excluir.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma dependência ativa encontrada. O item pode ser excluído com segurança.
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading || deleting || (dependencias && !dependencias.podeExcluir) || false}
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            'Confirmar Exclusão'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
