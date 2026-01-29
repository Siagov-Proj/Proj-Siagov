'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { maskCodigoComZeros, maskCnpj } from '@/utils/masks';
import { FIELD_LIMITS } from '@/utils/constants';
import { ArrowLeft } from 'lucide-react';

const emptyFormData = {
    codigo: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
};

export default function NovoBancoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.codigo) newErrors.codigo = 'Código FEBRABAN é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = () => {
        if (!validate()) return;
        console.log('Salvando novo banco:', formData);
        router.push('/cadastros/bancos');
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(emptyFormData);
        setErrors({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Banco</h1>
                    <p className="text-muted-foreground">
                        Cadastro de banco com código FEBRABAN
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Banco</CardTitle>
                    <CardDescription>Informações principais</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código FEBRABAN<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Código de 3 dígitos do banco conforme FEBRABAN" />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: maskCodigoComZeros(e.target.value, 3) })}
                                    maxLength={3}
                                    placeholder="000"
                                    className={errors.codigo ? 'border-red-500 font-mono' : 'font-mono'}
                                />
                                {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeAbreviado">Sigla</Label>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })}
                                    maxLength={20}
                                    placeholder="SIGLA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="nome">
                                    Nome do Banco<span className="text-red-500 ml-1">*</span>
                                </Label>
                            </div>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                maxLength={FIELD_LIMITS.nome}
                                placeholder="Nome completo do banco"
                                className={errors.nome ? 'border-red-500' : ''}
                            />
                            {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                                id="cnpj"
                                value={formData.cnpj}
                                onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                maxLength={18}
                                placeholder="00.000.000/0001-91"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
            />
        </div>
    );
}
