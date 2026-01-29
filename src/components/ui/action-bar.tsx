'use client';

import { Button } from '@/components/ui/button';
import { Save, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionBarMode = 'create' | 'edit' | 'view';

interface ActionBarProps {
    onSalvar?: () => void;
    onCancelar?: () => void;
    onLimpar?: () => void;
    mode?: ActionBarMode;
    isLoading?: boolean;
    loading?: boolean; // Alias para isLoading
    className?: string;
    showLimpar?: boolean;
    salvarLabel?: string; // Texto customizado para o botão salvar
}

/**
 * ActionBar - Barra de ações padrão para formulários
 * 
 * Segue o padrão definido em PROGRESSO_IMPLEMENTACAO.md:
 * - Salvar (unifica Incluir + Alterar)
 * - Cancelar
 * - Limpar (opcional)
 */
export function ActionBar({
    onSalvar,
    onCancelar,
    onLimpar,
    mode = 'create',
    isLoading = false,
    loading,
    className,
    showLimpar = true,
    salvarLabel,
}: ActionBarProps) {
    const carregando = loading ?? isLoading;
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-2 pt-4 border-t',
                className
            )}
        >
            {/* Botão Limpar */}
            {showLimpar && onLimpar && mode !== 'view' && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onLimpar}
                    disabled={carregando}
                    className="gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Limpar
                </Button>
            )}

            {/* Botão Cancelar */}
            {onCancelar && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelar}
                    disabled={carregando}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </Button>
            )}

            {/* Botão Salvar */}
            {onSalvar && mode !== 'view' && (
                <Button
                    type="submit"
                    onClick={onSalvar}
                    disabled={carregando}
                    className="gap-2 bg-primary hover:bg-primary/90"
                >
                    <Save className="h-4 w-4" />
                    {carregando ? 'Salvando...' : (salvarLabel || 'Salvar')}
                </Button>
            )}
        </div>
    );
}

export default ActionBar;
