'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, OctagonX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type ICadastroDialogVariant = 'info' | 'success' | 'error' | 'warning' | 'danger';
type ICadastroDialogMode = 'alert' | 'confirm' | 'prompt';

interface ICadastroDialogOptions {
    title?: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ICadastroDialogVariant;
    defaultValue?: string;
    placeholder?: string;
}

interface ICadastroDialogState extends ICadastroDialogOptions {
    open: boolean;
    mode: ICadastroDialogMode;
}

interface ICadastroDialogContextValue {
    showAlert: (options: ICadastroDialogOptions) => Promise<void>;
    showConfirm: (options: ICadastroDialogOptions) => Promise<boolean>;
    showPrompt: (options: ICadastroDialogOptions) => Promise<string | null>;
    showSuccess: (options: Omit<ICadastroDialogOptions, 'variant'>) => Promise<void>;
    showError: (options: Omit<ICadastroDialogOptions, 'variant'>) => Promise<void>;
    showWarning: (options: Omit<ICadastroDialogOptions, 'variant'>) => Promise<void>;
}

const CadastroDialogContext = createContext<ICadastroDialogContextValue | null>(null);

const initialState: ICadastroDialogState = {
    open: false,
    mode: 'alert',
    description: '',
    title: 'Aviso',
    confirmLabel: 'OK',
    cancelLabel: 'Cancelar',
    variant: 'info',
};

function getVariantStyles(variant: ICadastroDialogVariant) {
    switch (variant) {
        case 'success':
            return {
                icon: CheckCircle2,
                iconClassName: 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
                accentClassName: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
                confirmVariant: 'default' as const,
            };
        case 'error':
        case 'danger':
            return {
                icon: OctagonX,
                iconClassName: 'border border-red-400/30 bg-red-500/15 text-red-300',
                accentClassName: 'from-red-500/20 via-red-500/5 to-transparent',
                confirmVariant: 'destructive' as const,
            };
        case 'warning':
            return {
                icon: AlertTriangle,
                iconClassName: 'border border-amber-400/30 bg-amber-500/15 text-amber-300',
                accentClassName: 'from-amber-500/20 via-amber-500/5 to-transparent',
                confirmVariant: 'default' as const,
            };
        default:
            return {
                icon: CircleHelp,
                iconClassName: 'border border-sky-400/30 bg-sky-500/15 text-sky-300',
                accentClassName: 'from-sky-500/20 via-sky-500/5 to-transparent',
                confirmVariant: 'default' as const,
            };
    }
}

function inferAlertVariant(message: string): ICadastroDialogVariant {
    const normalized = message.toLowerCase();

    if (normalized.includes('sucesso') || normalized.includes('criado') || normalized.includes('salvo') || normalized.includes('atualizado') || normalized.includes('excluído') || normalized.includes('excluido')) {
        return 'success';
    }

    if (normalized.includes('erro') || normalized.includes('não foi possível') || normalized.includes('nao foi possivel') || normalized.includes('falhou')) {
        return 'error';
    }

    if (normalized.includes('atenção') || normalized.includes('atencao') || normalized.includes('não é possível') || normalized.includes('nao e possivel') || normalized.includes('limite')) {
        return 'warning';
    }

    return 'info';
}

export function CadastroDialogProvider({ children }: { children: React.ReactNode }) {
    const resolverRef = useRef<((value: boolean | string | null) => void) | null>(null);
    const [dialogState, setDialogState] = useState<ICadastroDialogState>(initialState);
    const [promptValue, setPromptValue] = useState('');

    const closeDialog = useCallback((result: boolean | string | null) => {
        setDialogState((current) => ({ ...current, open: false }));
        resolverRef.current?.(result);
        resolverRef.current = null;
    }, []);

    const openDialog = useCallback((mode: ICadastroDialogMode, options: ICadastroDialogOptions) => {
        return new Promise<boolean | string | null>((resolve) => {
            resolverRef.current = resolve;
            setPromptValue(options.defaultValue || '');
            setDialogState({
                open: true,
                mode,
                title: options.title || (mode === 'confirm' ? 'Confirmar ação' : 'Aviso'),
                description: options.description,
                confirmLabel: options.confirmLabel || (mode === 'confirm' ? 'Confirmar' : 'OK'),
                cancelLabel: options.cancelLabel || 'Cancelar',
                variant: options.variant || (mode === 'confirm' ? 'warning' : 'info'),
                placeholder: options.placeholder,
                defaultValue: options.defaultValue,
            });
        });
    }, []);

    const value = useMemo<ICadastroDialogContextValue>(() => ({
        showAlert: async (options) => {
            await openDialog('alert', options);
        },
        showConfirm: async (options) => Boolean(await openDialog('confirm', options)),
        showPrompt: async (options) => {
            const result = await openDialog('prompt', options);
            return typeof result === 'string' ? result : null;
        },
        showSuccess: async (options) => {
            await openDialog('alert', { ...options, variant: 'success' });
        },
        showError: async (options) => {
            await openDialog('alert', { ...options, variant: 'error' });
        },
        showWarning: async (options) => {
            await openDialog('alert', { ...options, variant: 'warning' });
        },
    }), [openDialog]);

    useEffect(() => {
        const originalAlert = window.alert;

        window.alert = (message?: string) => {
            const text = typeof message === 'string' ? message : 'Ocorreu uma acao no sistema.';
            void openDialog('alert', {
                title: inferAlertVariant(text) === 'success' ? 'Sucesso' : inferAlertVariant(text) === 'error' ? 'Erro' : inferAlertVariant(text) === 'warning' ? 'Atenção' : 'Aviso',
                description: text,
                confirmLabel: 'OK',
                variant: inferAlertVariant(text),
            });
        };

        return () => {
            window.alert = originalAlert;
        };
    }, [openDialog]);

    const variantStyles = getVariantStyles(dialogState.variant || 'info');
    const Icon = variantStyles.icon;

    return (
        <CadastroDialogContext.Provider value={value}>
            {children}
            <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog(false)}>
                <DialogContent className="max-w-md overflow-hidden border-border bg-card p-0 shadow-2xl" showCloseButton={false}>
                    <div className={`h-1.5 bg-gradient-to-r ${variantStyles.accentClassName}`} />
                    <div className="p-6">
                        <DialogHeader className="gap-4 text-left">
                            <div className="flex items-start gap-4">
                                <div className={`rounded-xl p-3 ${variantStyles.iconClassName}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <DialogTitle>{dialogState.title}</DialogTitle>
                                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                                        {dialogState.description}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        {dialogState.mode === 'prompt' && (
                            <div className="mt-5">
                                <Input
                                    value={promptValue}
                                    onChange={(event) => setPromptValue(event.target.value)}
                                    placeholder={dialogState.placeholder || 'Digite um valor'}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4 sm:justify-end">
                        {(dialogState.mode === 'confirm' || dialogState.mode === 'prompt') && (
                            <Button variant="outline" onClick={() => closeDialog(false)}>
                                {dialogState.cancelLabel}
                            </Button>
                        )}
                        <Button variant={variantStyles.confirmVariant} onClick={() => closeDialog(dialogState.mode === 'prompt' ? promptValue : true)}>
                            {dialogState.confirmLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CadastroDialogContext.Provider>
    );
}

export function useCadastroDialogs() {
    const context = useContext(CadastroDialogContext);

    if (!context) {
        throw new Error('useCadastroDialogs deve ser usado dentro de CadastroDialogProvider.');
    }

    return context;
}
