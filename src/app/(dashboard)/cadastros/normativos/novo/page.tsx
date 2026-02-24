'use client';

import { useState, useEffect, useCallback } from 'react';
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
    HelpCircle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    leisNormativasService,
    titulosNormativosService,
    categoriasDocService,
    orgaosService,
    ILeiNormativaDB,
    IOrgaoDB,
} from '@/services/api';
import { LeisCadastroDialog } from '@/components/normativos/LeisCadastroDialog';

const steps = [
    { id: 1, label: '01 - Dados Gerais' },
    { id: 2, label: '02 - Subcategorias' },
    { id: 3, label: '03 - Documentos' },
];

export default function NovoNormativoPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);

    // Dados carregados
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form States - Step 1
    const [leiId, setLeiId] = useState('');
    const [nomeTitulo, setNomeTitulo] = useState('');
    const [nomeCategoria, setNomeCategoria] = useState('');
    const [orgaosSelecionados, setOrgaosSelecionados] = useState<string[]>([]);
    const [selecionarTodosOrgaos, setSelecionarTodosOrgaos] = useState(false);
    const [ativo, setAtivo] = useState(true);

    // Subcategorias
    const [novaSubcategoria, setNovaSubcategoria] = useState('');
    const [subcategorias, setSubcategorias] = useState<string[]>([]);

    // Erros
    const [erros, setErros] = useState<Record<string, string>>({});

    // Carregar dados ao montar o componente
    const carregarDados = useCallback(async () => {
        try {
            setLoadingData(true);
            const [leisData, orgaosData] = await Promise.all([
                leisNormativasService.listarAtivas(),
                orgaosService.listar(),
            ]);
            setLeis(leisData);
            setOrgaos(orgaosData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Handle selecionar todos os órgãos
    useEffect(() => {
        if (selecionarTodosOrgaos) {
            setOrgaosSelecionados(orgaos.map(o => o.id));
        } else {
            // Só limpa se estava marcado antes e desmarcou
            if (orgaosSelecionados.length === orgaos.length && orgaos.length > 0) {
                setOrgaosSelecionados([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selecionarTodosOrgaos]);

    const handleToggleOrgao = (orgaoId: string) => {
        setOrgaosSelecionados(prev => {
            const novos = prev.includes(orgaoId)
                ? prev.filter(id => id !== orgaoId)
                : [...prev, orgaoId];

            // Atualizar checkbox "selecionar todos"
            setSelecionarTodosOrgaos(novos.length === orgaos.length);
            return novos;
        });
    };

    const handleAddSubcategoria = () => {
        if (novaSubcategoria.trim()) {
            setSubcategorias([...subcategorias, novaSubcategoria.trim()]);
            setNovaSubcategoria('');
        }
    };

    const handleRemoveSubcategoria = (index: number) => {
        setSubcategorias(subcategorias.filter((_, i) => i !== index));
    };

    const validarStep1 = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!leiId) novosErros.leiId = 'Lei é obrigatória';
        if (!nomeTitulo.trim()) novosErros.nomeTitulo = 'Nome do Título é obrigatório';
        if (!nomeCategoria.trim()) novosErros.nomeCategoria = 'Nome da Categoria é obrigatório';
        if (orgaosSelecionados.length === 0) novosErros.orgaos = 'Selecione pelo menos um órgão';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSave = async () => {
        if (!validarStep1()) {
            setCurrentStep(1);
            return;
        }

        try {
            setSaving(true);

            // 1. Buscar ou criar o título
            const titulo = await titulosNormativosService.buscarOuCriarPorNome(leiId, nomeTitulo.trim());

            // 2. Criar a categoria
            const categoria = await categoriasDocService.criarCategoria({
                nome: nomeCategoria.trim(),
                titulo_id: titulo.id,
                ativo,
            });

            // 3. Vincular órgãos
            await categoriasDocService.vincularOrgaos(categoria.id, orgaosSelecionados);

            // 4. Criar subcategorias
            for (const subNome of subcategorias) {
                await categoriasDocService.criarSubcategoria({
                    categoria_id: categoria.id,
                    nome: subNome,
                    ativo: true,
                });
            }

            router.push('/cadastros/normativos');
        } catch (err) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar a categoria. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleLeisChanged = () => {
        carregarDados();
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                <LeisCadastroDialog onLeisChanged={handleLeisChanged} />
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
                                {/* Lei */}
                                <div className="space-y-2">
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="lei">Lei <span className="text-red-500">*</span></Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Selecione a lei normativa à qual a categoria será vinculada.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                    <Select value={leiId} onValueChange={(v) => { setLeiId(v); setErros(prev => ({ ...prev, leiId: '' })); }}>
                                        <SelectTrigger id="lei" className={erros.leiId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione a Lei" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leis.map((lei) => (
                                                <SelectItem key={lei.id} value={lei.id}>{lei.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {erros.leiId && <p className="text-sm text-red-500">{erros.leiId}</p>}
                                </div>

                                {/* Nome do Título */}
                                <div className="space-y-2">
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="titulo">Nome do Título <span className="text-red-500">*</span></Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Título que agrupa as categorias dentro da lei selecionada. Ex: Dispensa</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                    <Input
                                        id="titulo"
                                        placeholder="Ex: Dispensa"
                                        value={nomeTitulo}
                                        onChange={(e) => { setNomeTitulo(e.target.value); setErros(prev => ({ ...prev, nomeTitulo: '' })); }}
                                        className={erros.nomeTitulo ? 'border-red-500' : ''}
                                    />
                                    {erros.nomeTitulo && <p className="text-sm text-red-500">{erros.nomeTitulo}</p>}
                                </div>

                                {/* Nome da Categoria */}
                                <div className="space-y-2">
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="categoria">Nome da Categoria <span className="text-red-500">*</span></Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Nome da categoria de documentos. Ex: Pareceres Técnicos</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                    <Input
                                        id="categoria"
                                        placeholder="Ex: Pareceres Técnicos"
                                        value={nomeCategoria}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 100) {
                                                setNomeCategoria(e.target.value);
                                                setErros(prev => ({ ...prev, nomeCategoria: '' }));
                                            }
                                        }}
                                        className={erros.nomeCategoria ? 'border-red-500' : ''}
                                    />
                                    <div className="text-xs text-right text-muted-foreground">{nomeCategoria.length}/100 caracteres</div>
                                    {erros.nomeCategoria && <p className="text-sm text-red-500">{erros.nomeCategoria}</p>}
                                </div>

                                {/* Código do Órgão */}
                                <div className="space-y-2">
                                    <TooltipProvider>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Label>Código do Órgão <span className="text-red-500">*</span></Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Selecione os órgãos que terão acesso a esta categoria. Ao selecionar um órgão, todas as UGs vinculadas são incluídas automaticamente.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Checkbox
                                                    id="todos-orgaos"
                                                    checked={selecionarTodosOrgaos}
                                                    onCheckedChange={(c) => setSelecionarTodosOrgaos(!!c)}
                                                />
                                                <Label htmlFor="todos-orgaos" className="text-sm font-normal cursor-pointer">
                                                    Selecionar todos os Órgãos
                                                </Label>
                                            </div>
                                        </div>
                                    </TooltipProvider>

                                    <div className={cn(
                                        "border rounded-md max-h-[200px] overflow-y-auto",
                                        erros.orgaos ? 'border-red-500' : ''
                                    )}>
                                        {orgaos.length === 0 ? (
                                            <div className="text-center py-4 text-sm text-muted-foreground">
                                                Nenhum órgão encontrado.
                                            </div>
                                        ) : (
                                            orgaos.map((orgao) => (
                                                <div
                                                    key={orgao.id}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                                                    onClick={() => handleToggleOrgao(orgao.id)}
                                                >
                                                    <Checkbox
                                                        checked={orgaosSelecionados.includes(orgao.id)}
                                                        onCheckedChange={() => handleToggleOrgao(orgao.id)}
                                                    />
                                                    <span className="text-sm">
                                                        <span className="font-medium">{orgao.codigo}</span>
                                                        {' - '}
                                                        {orgao.nome}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {orgaosSelecionados.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {orgaosSelecionados.length} órgão(s) selecionado(s)
                                        </p>
                                    )}
                                    {erros.orgaos && <p className="text-sm text-red-500">{erros.orgaos}</p>}
                                </div>

                                {/* Categoria Ativa */}
                                <div className="flex items-center gap-2 pt-2">
                                    <Checkbox
                                        id="ativo"
                                        checked={ativo}
                                        onCheckedChange={(c) => setAtivo(!!c)}
                                    />
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="ativo" className="font-medium cursor-pointer">Categoria Ativa</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Define se a categoria estará disponível para uso.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
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
                                    <Select disabled value={nomeCategoria ? 'current' : ''}>
                                        <SelectTrigger className="bg-muted">
                                            <SelectValue placeholder={nomeCategoria || "Categoria atual"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current">{nomeCategoria || "Categoria Atual"}</SelectItem>
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
                <Button
                    className="gap-2 bg-primary hover:opacity-90 text-primary-foreground px-6 shadow-lg"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                    Salvar
                </Button>
            </div>
        </div>
    );
}
