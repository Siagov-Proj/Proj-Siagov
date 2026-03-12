'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { documentosService, IDocumentoDB } from '@/services/api/documentosService';
import { useSafeSubmit } from '@/hooks/useSafeSubmit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const documentoSchema = z.object({
    titulo: z.string().trim().min(3, 'Informe um titulo com pelo menos 3 caracteres').max(200, 'Titulo deve ter no maximo 200 caracteres'),
    tipo: z.string().min(1, 'Tipo e obrigatorio'),
    status: z.string().min(1, 'Status e obrigatorio'),
    objetivo: z.string().trim().max(2000, 'Objetivo deve ter no maximo 2000 caracteres').optional(),
    contexto: z.string().trim().max(5000, 'Contexto deve ter no maximo 5000 caracteres').optional(),
    conteudo: z.string().trim().optional(),
});

type DocumentoFormValues = z.infer<typeof documentoSchema>;

const STATUS_OPTIONS = ['Rascunho', 'Em Revisão', 'Concluído'];

export default function EditarDocumentoPage() {
    const params = useParams();
    const router = useRouter();
    const documentoId = params.id as string;

    const [documento, setDocumento] = useState<IDocumentoDB | null>(null);
    const [loading, setLoading] = useState(true);

    const form = useForm<DocumentoFormValues>({
        resolver: zodResolver(documentoSchema),
        defaultValues: {
            titulo: '',
            tipo: '',
            status: 'Rascunho',
            objetivo: '',
            contexto: '',
            conteudo: '',
        },
    });

    useEffect(() => {
        if (!documentoId) return;

        const carregarDocumento = async () => {
            try {
                setLoading(true);
                const doc = await documentosService.obterPorId(documentoId);

                if (!doc) {
                    toast.error('Documento nao encontrado.');
                    router.push('/documentos');
                    return;
                }

                setDocumento(doc);
                form.reset({
                    titulo: doc.titulo || '',
                    tipo: doc.tipo || '',
                    status: doc.status || 'Rascunho',
                    objetivo: doc.objetivo || '',
                    contexto: doc.contexto || '',
                    conteudo: doc.conteudo || '',
                });
            } catch (error) {
                console.error('Erro ao carregar documento para edicao:', error);
                toast.error('Nao foi possivel carregar o documento para edicao.');
                router.push(`/documentos/${documentoId}`);
            } finally {
                setLoading(false);
            }
        };

        carregarDocumento();
    }, [documentoId, form, router]);

    const salvar = async (values: DocumentoFormValues) => {
        await documentosService.atualizar(documentoId, {
            titulo: values.titulo,
            tipo: values.tipo,
            status: values.status,
            objetivo: values.objetivo?.trim() || undefined,
            contexto: values.contexto?.trim() || undefined,
            conteudo: values.conteudo?.trim() || undefined,
        });

        toast.success('Documento atualizado com sucesso!');
        router.push(`/documentos/${documentoId}`);
        router.refresh();
    };

    const { isSaving, safeSubmit } = useSafeSubmit(salvar, 1000);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!documento) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/documentos/${documentoId}`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Documento</h1>
                        <p className="text-muted-foreground">Atualize os dados principais do documento {documento.numero || '-'}</p>
                    </div>
                </div>
                <Button onClick={form.handleSubmit(safeSubmit)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar alteracoes
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Conteudo e metadados</CardTitle>
                        <CardDescription>Edite as informacoes exibidas na tela de detalhes e no historico do documento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(safeSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="titulo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titulo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="tipo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="objetivo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Objetivo</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value ?? ''} rows={4} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contexto"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contexto</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value ?? ''} rows={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="conteudo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Conteudo do documento</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value ?? ''} rows={18} className="font-mono text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Resumo</CardTitle>
                        <CardDescription>Informacoes fixas para referencia durante a edicao.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Numero</p>
                            <p className="font-medium">{documento.numero || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Categoria</p>
                            <p className="font-medium">{documento.categoria?.nome || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Subcategoria</p>
                            <p className="font-medium">{documento.subcategoria?.nome || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Processo</p>
                            <p className="font-medium">{documento.processo?.numero || 'Nao vinculado'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
