'use client';

import { HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FieldTooltipProps {
    content: string;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * FieldTooltip - Ícone de ajuda com tooltip explicativo
 * 
 * Usado para campos legais conforme PROGRESSO_IMPLEMENTACAO.md:
 * - Todos os campos legais devem possuir o ícone de ajuda (HelpCircle)
 * - Com tooltips explicativos
 */
export function FieldTooltip({ content, className, side = 'top' }: FieldTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <HelpCircle
                        className={cn(
                            'h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors',
                            className
                        )}
                    />
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-xs">
                    <p className="text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default FieldTooltip;
