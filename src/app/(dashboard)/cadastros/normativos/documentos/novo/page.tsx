'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { ArrowLeft, FileText, Upload, X, Target, FileUp, Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DOCUMENT_FILE_INPUT_ACCEPT } from '@/utils';

// Services
import { documentosService } from '@/services/api/documentosService';
import { categoriasDocService, ICategoriaDocumentoDB, ISubcategoriaDocumentoDB } from '@/services/api/categoriasDocService';
import { processosService, IProcessoDB } from '@/services/api/processosService';
import { useSafeSubmit } from '@/hooks/useSafeSubmit';
import { criarDocumentoComAnexosAction } from './actions';

const TIPOS_DOCUMENTO = [
    'Parecer',
    'Nota Técnica',
    'Relatório',
    'Termo de Referência',
    'Edital',
    'Ata',
    'Minuta',
    'DFD',
    'Memorando',
    'Ofício',
];

interface Anexo {
    id: string;
    nome: string;
    tamanho: string;
    file: File;
}

function buildDocumentoFormData(data: DocumentoFormValues, anexos: Anexo[], options: {
    tituloPadrao: string;
    status: string;
    conteudo?: string;
    tokensUtilizados: number;
}) {
    const formData = new FormData();

    formData.append('titulo', data.titulo || options.tituloPadrao);
    formData.append('tipo', data.tipo);
    formData.append('categoriaId', data.categoriaId);
    formData.append('subcategoriaId', data.subcategoriaId);
    formData.append('processoId', data.processoId || '');
    formData.append('objetivo', data.objetivo);
    formData.append('contexto', data.contexto || '');
    formData.append('status', options.status);
    formData.append('conteudo', options.conteudo || '');
    formData.append('versao', '1');
    formData.append('tokensUtilizados', String(options.tokensUtilizados));

    for (const anexo of anexos) {
        formData.append('anexos', anexo.file, anexo.file.name);
    }

    return formData;
}

const documentoSchema = z.object({
    titulo: z.string().trim().max(200, 'Titulo deve ter no maximo 200 caracteres').optional(),
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    categoriaId: z.string().uuid('Categoria invalida'),
    subcategoriaId: z.string().uuid('Subcategoria invalida'),
    processoId: z.string().uuid('Processo invalido').optional().or(z.literal('')),
    objetivo: z.string().trim().min(10, 'Objetivo muito curto, forneca mais detalhes').max(2000, 'Objetivo deve ter no maximo 2000 caracteres'),
    contexto: z.string().trim().max(5000, 'Contexto deve ter no maximo 5000 caracteres').optional(),
});

type DocumentoFormValues = z.infer<typeof documentoSchema>;

export default function NovoDocumentoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoriaIdParam = searchParams.get('categoriaId');
    const returnPath = categoriaIdParam ? `/cadastros/categorias-documentos/${categoriaIdParam}` : '/cadastros/normativos';

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [anexos, setAnexos] = useState<Anexo[]>([]);
    const [codigoPreview, setCodigoPreview] = useState<string>('');
    const [loadingCodigo, setLoadingCodigo] = useState(false);

    const form = useForm<DocumentoFormValues>({
        resolver: zodResolver(documentoSchema),
        defaultValues: {
            titulo: '',
            tipo: '',
            categoriaId: categoriaIdParam || '',
            subcategoriaId: '',
            processoId: '',
            objetivo: '',
            contexto: '',
        },
        mode: 'onChange'
    });

    const watchCategoriaId = form.watch('categoriaId');
    const watchSubcategoriaId = form.watch('subcategoriaId');

    // Data Sources
    const [categorias, setCategorias] = useState<ICategoriaDocumentoDB[]>([]);
    const [subcategorias, setSubcategorias] = useState<ISubcategoriaDocumentoDB[]>([]);
    const [processos, setProcessos] = useState<Pick<IProcessoDB, 'id' | 'numero' | 'assunto'>[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (watchCategoriaId) {
            loadSubcategorias(watchCategoriaId);
        } else {
            setSubcategorias([]);
        }
        // Limpar código ao trocar de categoria
        setCodigoPreview('');
    }, [watchCategoriaId]);

    // Gerar preview do código ao selecionar subcategoria
    useEffect(() => {
        const gerarPreview = async () => {
            if (watchSubcategoriaId) {
                try {
                    setLoadingCodigo(true);
                    const codigo = await documentosService.gerarProximoCodigo(watchSubcategoriaId);
                    setCodigoPreview(codigo);
                } catch (err) {
                    console.error('Erro ao gerar preview do código:', err);
                    setCodigoPreview('');
                } finally {
                    setLoadingCodigo(false);
                }
            } else {
                setCodigoPreview('');
            }
        };
        gerarPreview();
    }, [watchSubcategoriaId]);

    const loadInitialData = async () => {
        try {
            const [cats, procs] = await Promise.all([
                categoriasDocService.listarCategorias(),
                processosService.listarParaSelect()
            ]);
            setCategorias(cats);
            setProcessos(procs);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        }
    };

    const loadSubcategorias = async (catId: string) => {
        try {
            const subs = await categoriasDocService.listarSubcategorias(catId);
            setSubcategorias(subs);
        } catch (error) {
            console.error('Erro ao carregar subcategorias:', error);
        }
    };

    const limpar = () => {
        form.reset({
            titulo: '',
            tipo: '',
            categoriaId: categoriaIdParam || '',
            subcategoriaId: '',
            processoId: '',
            objetivo: '',
            contexto: '',
        });
        setAnexos([]);
        setCodigoPreview('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const novosAnexos: Anexo[] = [];
        const errosEncontrados: string[] = [];

        Array.from(files).forEach((file) => {
            const validacao = documentosService.validarAnexo(file);
            if (!validacao.valido) {
                errosEncontrados.push(validacao.mensagem || 'Arquivo inválido.');
                return;
            }

            novosAnexos.push({
                id: crypto.randomUUID(),
                nome: file.name,
                tamanho: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                file,
            });
        });

        if (errosEncontrados.length > 0) {
            alert(`Alguns arquivos não puderam ser adicionados:\n\n${errosEncontrados.join('\n')}`);
        }

        setAnexos([...anexos, ...novosAnexos]);
    };

    const removerAnexo = (id: string) => {
        setAnexos(anexos.filter((a) => a.id !== id));
    };

    const salvarDocumento = async (data: DocumentoFormValues) => {
        try {
            const resultado = await criarDocumentoComAnexosAction(buildDocumentoFormData(data, anexos, {
                tituloPadrao: 'Documento sem titulo',
                status: 'Rascunho',
                tokensUtilizados: 0,
            }));

            if (!resultado.success) {
                throw new Error(resultado.error);
            }

            toast.success('Documento salvo com sucesso!');
            if ('warning' in resultado && resultado.warning) {
                toast.warning(resultado.warning);
            }
            router.push(returnPath);
        } catch (error) {
            console.warn('Falha ao salvar documento:', error);
            toast.error(error instanceof Error ? error.message : 'Erro ao criar o documento base. Verifique os dados e tente novamente.');
        }
    };

    const { isSaving: loading, safeSubmit: safeSalvar } = useSafeSubmit(salvarDocumento, 1000);

    const onSubmitSalvar = (data: DocumentoFormValues) => {
        safeSalvar(data);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={returnPath}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Novo Documento
                    </h1>
                    <p className="text-muted-foreground">
                        Cadastre um novo documento vinculado aos normativos
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <Form {...form}>
                <form className="grid gap-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>Dados de identificação do documento</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {/* Título */}
                            <FormField
                                control={form.control}
                                name="titulo"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Título do Documento</FormLabel>
                                            <FieldTooltip content="Título descritivo do documento (Opcional)" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Parecer Técnico - Pregão 15/2024"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tipo */}
                                <FormField
                                    control={form.control}
                                    name="tipo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <FormLabel>
                                                    Tipo de Documento<span className="text-red-500 ml-1">*</span>
                                                </FormLabel>
                                                <FieldTooltip content="Classificação do tipo de documento" />
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TIPOS_DOCUMENTO.map((tipo) => (
                                                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Processo */}
                                <FormField
                                    control={form.control}
                                    name="processoId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <div className="flex items-center gap-1">
                                                <FormLabel>Processo Vinculado</FormLabel>
                                                <FieldTooltip content="Processo ao qual o documento será vinculado (Opcional)" />
                                            </div>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o processo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {processos.map((proc) => (
                                                        <SelectItem key={proc.id} value={proc.id}>
                                                            {proc.numero} - {proc.assunto}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categorização */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorização</CardTitle>
                            <CardDescription>Classificação hierárquica do documento</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Categoria */}
                            <FormField
                                control={form.control}
                                name="categoriaId"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>
                                                Categoria<span className="text-red-500 ml-1">*</span>
                                            </FormLabel>
                                            <FieldTooltip content="Categoria principal do documento" />
                                        </div>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                form.setValue('subcategoriaId', ''); // limpa subcategoria ao trocar cateoria
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a categoria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categorias.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.nome} {cat.lei ? `(${cat.lei})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Subcategoria */}
                            <FormField
                                control={form.control}
                                name="subcategoriaId"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>
                                                Subcategoria<span className="text-red-500 ml-1">*</span>
                                            </FormLabel>
                                            <FieldTooltip content="Subcategoria do documento" />
                                        </div>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            disabled={!watchCategoriaId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a subcategoria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subcategorias.length === 0 ? (
                                                    <SelectItem value="none" disabled>Nenhuma subcategoria disponível</SelectItem>
                                                ) : (
                                                    subcategorias.map((sub) => (
                                                        <SelectItem key={sub.id} value={sub.id}>{sub.nome}</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Preview do Código Auto-Gerado */}
                            {(codigoPreview || loadingCodigo) && (
                                <div className="md:col-span-2 mt-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="p-1.5 bg-green-100 dark:bg-green-800/50 rounded">
                                            <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-700 dark:text-green-400 font-medium">Código do Documento (auto-gerado)</p>
                                            {loadingCodigo ? (
                                                <p className="text-sm text-green-600 dark:text-green-300 flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Gerando código...
                                                </p>
                                            ) : (
                                                <p className="text-lg font-mono font-bold text-green-800 dark:text-green-200">{codigoPreview}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Objetivo e Contexto */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Objetivo e Contexto
                            </CardTitle>
                            <CardDescription>
                                Informações complementares para elaboração do documento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Objetivo */}
                            <FormField
                                control={form.control}
                                name="objetivo"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>
                                                Objetivo do Documento<span className="text-red-500 ml-1">*</span>
                                            </FormLabel>
                                            <FieldTooltip content="Descreva de forma clara o objetivo principal do documento" />
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex: Elaborar parecer técnico favorável à continuidade do procedimento licitatório..."
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Contexto */}
                            <FormField
                                control={form.control}
                                name="contexto"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            <FormLabel>Contexto e Detalhes</FormLabel>
                                            <FieldTooltip content="Informações adicionais que ajudarão na elaboração do documento" />
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Forneça informações adicionais, como valores, prazos, partes envolvidas, fundamentação legal específica..."
                                                rows={5}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                {/* Upload de Anexos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Anexos
                        </CardTitle>
                        <CardDescription>
                             Anexe documentos de referência para complementar o cadastro
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Lista de Anexos */}
                        {anexos.length > 0 && (
                            <div className="space-y-2">
                                {anexos.map((anexo) => (
                                    <div
                                        key={anexo.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{anexo.nome}</p>
                                                <p className="text-xs text-muted-foreground">{anexo.tamanho}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removerAnexo(anexo.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Área de Upload */}
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                                Arraste arquivos ou{' '}
                                <span className="text-primary font-medium">clique para fazer upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                PDF, DOC, DOCX, DOCM, DOT, DOTX, DOTM, ODT, RTF, TXT e Markdown ate 50MB cada
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={DOCUMENT_FILE_INPUT_ACCEPT}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" type="button" onClick={limpar}>
                        Limpar Formulário
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" type="button" onClick={() => router.push(returnPath)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={form.handleSubmit(onSubmitSalvar)} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar documento'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
        </div>
    );
}
