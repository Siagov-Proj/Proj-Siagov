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
    unidadesService,
    setoresService,
    ILeiNormativaDB,
    IOrgaoDB,
    IUnidadeGestoraDB,
    ISetorDB,
} from '@/services/api';
import { LeisCadastroDialog } from '@/components/normativos/LeisCadastroDialog';
import { buildNormativoLabel, stripNormativoCode } from '@/utils';
import { toast } from 'sonner';

interface ISubcategoriaDraft {
    codigo: string;
    nome: string;
}

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
    const [unidadesGestoras, setUnidadesGestoras] = useState<IUnidadeGestoraDB[]>([]);
    const [setores, setSetores] = useState<ISetorDB[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form States - Step 1
    const [leiId, setLeiId] = useState('');
    const [nomeTitulo, setNomeTitulo] = useState('');
    const [codigoCategoria, setCodigoCategoria] = useState('');
    const [nomeCategoria, setNomeCategoria] = useState('');
    const [orgaosSelecionados, setOrgaosSelecionados] = useState<string[]>([]);
    const [selecionarTodosOrgaos, setSelecionarTodosOrgaos] = useState(false);
    const [ativo, setAtivo] = useState(true);

    // Subcategorias
    const [novaSubcategoria, setNovaSubcategoria] = useState('');
    const [subcategorias, setSubcategorias] = useState<ISubcategoriaDraft[]>([]);

    // Documentos (Step 3)
    const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('');
    const [unidadeGestoraId, setUnidadeGestoraId] = useState('');
    const [setorId, setSetorId] = useState('');

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

    // Carregar Unidades Gestoras quando os órgãos mudam
    useEffect(() => {
        let isMounted = true;
        async function fetchUnidades() {
            if (orgaosSelecionados.length > 0) {
                try {
                    const promises = orgaosSelecionados.map(orgaoId =>
                        unidadesService.listarPorOrgao(orgaoId)
                    );
                    const results = await Promise.all(promises);
                    if (isMounted) {
                        const combined = results.flat();
                        // Remover duplicados baseados no id, caso os órgãos retornem a mesma UG
                        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                        setUnidadesGestoras(unique);
                    }
                } catch (error) {
                    console.error('Erro ao buscar unidades gestoras:', error);
                }
            } else {
                if (isMounted) {
                    setUnidadesGestoras([]);
                }
            }
            if (isMounted) {
                setUnidadeGestoraId('');
                setSetorId('');
            }
        }
        fetchUnidades();
        return () => { isMounted = false; };
    }, [orgaosSelecionados]);

    // Carregar Setores quando a Unidade Gestora muda
    useEffect(() => {
        let isMounted = true;
        async function fetchSetores() {
            if (unidadeGestoraId) {
                try {
                    const setoresData = await setoresService.listarPorUnidadeGestora(unidadeGestoraId);
                    if (isMounted) {
                        setSetores(setoresData);
                    }
                } catch (error) {
                    console.error('Erro ao buscar setores:', error);
                }
            } else {
                if (isMounted) {
                    setSetores([]);
                }
            }
            if (isMounted) {
                setSetorId('');
            }
        }
        fetchSetores();
        return () => { isMounted = false; };
    }, [unidadeGestoraId]);

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

    const validarStep1 = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!leiId) novosErros.leiId = 'Lei é obrigatória';
        if (!nomeTitulo.trim()) novosErros.nomeTitulo = 'Nome do Título é obrigatório';
        if (!/^\d+$/.test(codigoCategoria.trim())) novosErros.codigoCategoria = 'Codigo da categoria deve ser numerico';
        if (!nomeCategoria.trim()) novosErros.nomeCategoria = 'Nome da Categoria é obrigatório';
        if (orgaosSelecionados.length === 0) novosErros.orgaos = 'Selecione pelo menos um órgão';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const categoriaFormatada = codigoCategoria.trim() && nomeCategoria.trim()
        ? buildNormativoLabel(codigoCategoria.trim(), nomeCategoria)
        : nomeCategoria.trim();

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
                nome: buildNormativoLabel(codigoCategoria.trim(), nomeCategoria.trim()),
                titulo_id: titulo.id,
                ativo,
            });

            // 3. Vincular órgãos
            await categoriasDocService.vincularOrgaos(categoria.id, orgaosSelecionados);

            // 4. Criar subcategorias
            for (const subcategoria of subcategorias) {
                await categoriasDocService.criarSubcategoria({
                    categoria_id: categoria.id,
                    nome: buildNormativoLabel(subcategoria.codigo, subcategoria.nome),
                    ativo: true,
                });
            }

            toast.success('Categoria salva com sucesso!');
            router.push('/cadastros/normativos');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar a categoria. Tente novamente.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleLeisChanged = () => {
        carregarDados();
    };

    const handleAddSubcategoria = () => {
        const nomeLimpo = stripNormativoCode(novaSubcategoria);
        if (!nomeLimpo.trim() || !codigoCategoria.trim()) {
            return;
        }

        const proximoCodigo = `${codigoCategoria.trim()}.${subcategorias.length + 1}`;
        setSubcategorias([...subcategorias, { codigo: proximoCodigo, nome: nomeLimpo.trim() }]);
        setNovaSubcategoria('');
    };

    const handleRemoveSubcategoria = (index: number) => {
        const atualizadas = subcategorias
            .filter((_, currentIndex) => currentIndex !== index)
            .map((subcategoria, currentIndex) => ({
                ...subcategoria,
                codigo: `${codigoCategoria.trim()}.${currentIndex + 1}`,
            }));

        setSubcategorias(atualizadas);
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
                                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)]">
                                    <div className="space-y-2">
                                        <TooltipProvider>
                                            <div className="flex items-center gap-1">
                                                <Label htmlFor="codigoCategoria">Codigo da Categoria <span className="text-red-500">*</span></Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Codigo numerico base da categoria. Ex: 4 para gerar subcategorias 4.1, 4.2, 4.3...</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                        <Input
                                            id="codigoCategoria"
                                            placeholder="Ex: 4"
                                            value={codigoCategoria}
                                            onChange={(e) => {
                                                setCodigoCategoria(e.target.value.replace(/\D/g, ''));
                                                setErros(prev => ({ ...prev, codigoCategoria: '' }));
                                            }}
                                            className={`font-mono ${erros.codigoCategoria ? 'border-red-500' : ''}`}
                                        />
                                        {erros.codigoCategoria && <p className="text-sm text-red-500">{erros.codigoCategoria}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <TooltipProvider>
                                            <div className="flex items-center gap-1">
                                                <Label htmlFor="categoria">Nome da Categoria <span className="text-red-500">*</span></Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Nome da categoria de documentos. Ex: Contratação Direta - Dispensas - Lei 14.133/21 - GOVPB</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                        <Input
                                            id="categoria"
                                            placeholder="Ex: Contratação Direta - Dispensas - Lei 14.133/21 - GOVPB"
                                            value={nomeCategoria}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 100) {
                                                    setNomeCategoria(e.target.value);
                                                    setErros(prev => ({ ...prev, nomeCategoria: '' }));
                                                }
                                            }}
                                            className={erros.nomeCategoria ? 'border-red-500' : ''}
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Preview: {categoriaFormatada || 'A categoria sera exibida com o codigo informado.'}</span>
                                            <span>{nomeCategoria.length}/100 caracteres</span>
                                        </div>
                                        {erros.nomeCategoria && <p className="text-sm text-red-500">{erros.nomeCategoria}</p>}
                                    </div>
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
                                            placeholder={codigoCategoria ? `Ex: ${codigoCategoria}.1. Dispensa - Obras e Servicos de Engenharia` : 'Informe primeiro o codigo da categoria'}
                                            value={novaSubcategoria}
                                            onChange={(e) => setNovaSubcategoria(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategoria()}
                                            disabled={!codigoCategoria}
                                        />
                                        <Button className="bg-primary hover:opacity-90 text-primary-foreground" onClick={handleAddSubcategoria} disabled={!codigoCategoria}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        As subcategorias serao numeradas automaticamente seguindo o prefixo da categoria.
                                    </p>
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
                                                    <span className="text-sm font-medium">{buildNormativoLabel(sub.codigo, sub.nome)}</span>
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
                                Resumo e Documentos
                            </div>

                            {/* Resumo da Categoria */}
                            <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Resumo da Categoria</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Categoria:</span>{' '}
                                        <span className="font-medium">{categoriaFormatada || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Lei:</span>{' '}
                                        <span className="font-medium">{leis.find(l => l.id === leiId)?.nome || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Título:</span>{' '}
                                        <span className="font-medium">{nomeTitulo || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Órgãos Vinculados:</span>{' '}
                                        <span className="font-medium">{orgaosSelecionados.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Subcategorias:</span>{' '}
                                        <span className="font-medium">{subcategorias.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>{' '}
                                        <span className="font-medium">{ativo ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </div>

                                {subcategorias.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subcategorias cadastradas:</span>
                                        <ul className="mt-1.5 space-y-1">
                                            {subcategorias.map((sub, i) => (
                                                <li key={i} className="text-sm flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{sub.codigo}</span>
                                                    <span>{sub.nome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Orientação de documentos */}
                            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-primary">Cadastro de Documentos</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Após salvar a categoria, você poderá cadastrar documentos vinculados diretamente
                                            pela tela de edição da categoria ou pela seção
                                            <span className="font-medium"> Normativos → Documentos → Novo Documento</span>.
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Cada documento terá os campos de <strong>Formato</strong> (PDF, Word, Excel),
                                            <strong> Tipo</strong> (Parecer, Nota Técnica, Checklist, etc.), objetivo e anexos.
                                        </p>
                                    </div>
                                </div>
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
