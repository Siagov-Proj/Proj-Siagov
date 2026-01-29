'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Check,
    RotateCcw,
    X,
    Folder,
    Plus,
    Trash2,
    Pencil,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const steps = [
    { id: 1, label: '01 - Dados Gerais' },
    { id: 2, label: '02 - Subcategorias' },
    { id: 3, label: '03 - Documentos' },
];

export default function NovoNormativoPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Form States
    const [nome, setNome] = useState('');
    const [unidadeGestora, setUnidadeGestora] = useState('');
    const [lei, setLei] = useState('');
    const [ativo, setAtivo] = useState(true);

    // Subcategorias
    const [novaSubcategoria, setNovaSubcategoria] = useState('');
    const [subcategorias, setSubcategorias] = useState<string[]>(['teste']);

    const handleAddSubcategoria = () => {
        if (novaSubcategoria.trim()) {
            setSubcategorias([...subcategorias, novaSubcategoria.trim()]);
            setNovaSubcategoria('');
        }
    };

    const handleRemoveSubcategoria = (index: number) => {
        setSubcategorias(subcategorias.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        // Here we would save the data
        router.push('/cadastros/normativos');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
                    <Link href="/cadastros/normativos">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Incluir Nova Categoria de Documento</h1>
                <p className="text-muted-foreground">Preencha os dados da categoria</p>
            </div>

            {/* Wizard Steps */}
            <div className="flex gap-2">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all text-center cursor-pointer",
                            currentStep === step.id
                                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        onClick={() => setCurrentStep(step.id)}
                    >
                        {step.label}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card>
                <CardContent className="pt-6">

                    {/* STEP 1: DADOS GERAIS */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Folder className="h-5 w-5 text-amber-500" />
                                Informações da Categoria
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome da Categoria <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nome"
                                        placeholder="Ex: Pareceres Técnicos"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                    />
                                    <div className="text-xs text-right text-muted-foreground">0/100 caracteres</div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ug">Unidade Gestora <span className="text-red-500">*</span></Label>
                                    <Select value={unidadeGestora} onValueChange={setUnidadeGestora}>
                                        <SelectTrigger id="ug">
                                            <SelectValue placeholder="Selecione a Unidade Gestora" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planejamento">Secretaria de Planejamento</SelectItem>
                                            <SelectItem value="administracao">Secretaria de Administração</SelectItem>
                                            <SelectItem value="financas">Secretaria de Finanças</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lei">Lei <span className="text-red-500">*</span></Label>
                                    <Select value={lei} onValueChange={setLei}>
                                        <SelectTrigger id="lei">
                                            <SelectValue placeholder="Selecione a Lei" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="14133">Lei 14.133/2021</SelectItem>
                                            <SelectItem value="8666">Lei 8.666/93</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Checkbox
                                        id="ativo"
                                        checked={ativo}
                                        onCheckedChange={(c) => setAtivo(!!c)}
                                    />
                                    <Label htmlFor="ativo" className="font-medium cursor-pointer">Categoria Ativa</Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SUBCATEGORIAS */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Folder className="h-5 w-5 text-amber-500" />
                                Subcategorias
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Adicionar Nova Subcategoria</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ex: Parecer Jurídico"
                                            value={novaSubcategoria}
                                            onChange={(e) => setNovaSubcategoria(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategoria()}
                                        />
                                        <Button className="bg-primary hover:opacity-90 text-primary-foreground" onClick={handleAddSubcategoria}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <Label>Subcategorias Cadastradas ({subcategorias.length})</Label>
                                    <div className="rounded-md border p-4 space-y-2 min-h-[200px] bg-muted/20">
                                        {subcategorias.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-8">
                                                Nenhuma subcategoria adicionada.
                                            </div>
                                        ) : (
                                            subcategorias.map((sub, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm">
                                                    <span className="text-sm font-medium">{index + 1}. {sub}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleRemoveSubcategoria(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DOCUMENTOS */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <FileText className="h-5 w-5 text-purple-500" />
                                Configuração de Documentos
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Tipo de Documento <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="docx">Word (DOCX)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Especialista <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o especialista" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="juridico">Jurídico</SelectItem>
                                            <SelectItem value="tecnico">Técnico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoria <span className="text-red-500">*</span></Label>
                                    <Select disabled value={nome ? 'current' : ''}>
                                        <SelectTrigger className="bg-muted">
                                            <SelectValue placeholder={nome || "Categoria atual"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current">{nome || "Categoria Atual"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subcategoria <span className="text-red-500">*</span></Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a subcategoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subcategorias.map((sub, i) => (
                                                <SelectItem key={i} value={sub}>{sub}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Objetivo do Documento <span className="text-red-500">*</span></Label>
                                <Input placeholder="Ex: Analisar legalidade do Pregão 15/2024" />
                            </div>

                            <div className="space-y-2">
                                <Label>Contexto e Detalhes <span className="text-red-500">*</span></Label>
                                <Textarea
                                    placeholder="Descreva o contexto, dados relevantes e informações adicionais..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : currentStep)}>
                    <RotateCcw className="h-4 w-4" />
                    {currentStep > 1 ? 'Voltar' : 'Limpar'}
                </Button>
                <Link href="/cadastros/normativos">
                    <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                </Link>
                <Button className="gap-2 bg-primary hover:opacity-90 text-primary-foreground px-6 shadow-lg" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                    Salvar
                </Button>
            </div>
        </div>
    );
}
