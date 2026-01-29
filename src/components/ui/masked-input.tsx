'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    tooltip?: string;
    required?: boolean;
    error?: string;
    mask?: (value: string) => string;
    onChange?: (value: string) => void;
}

/**
 * MaskedInput - Input com suporte a máscaras e label
 * 
 * Uso:
 * - Com máscara: <MaskedInput mask={maskCnpj} onChange={setValue} />
 * - Sem máscara: <MaskedInput onChange={setValue} />
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    (
        {
            label,
            tooltip,
            required,
            error,
            mask,
            onChange,
            className,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;

            if (mask) {
                value = mask(value);
            }

            if (onChange) {
                onChange(value);
            }
        };

        return (
            <div className="space-y-2">
                {label && (
                    <div className="flex items-center gap-1">
                        <Label htmlFor={inputId}>
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {tooltip && <FieldTooltip content={tooltip} />}
                    </div>
                )}
                <Input
                    ref={ref}
                    id={inputId}
                    onChange={handleChange}
                    className={cn(error && 'border-red-500', className)}
                    {...props}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
