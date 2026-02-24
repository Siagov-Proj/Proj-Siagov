'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionBar } from '@/components/ui/action-bar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowLeft, FolderOpen, Loader2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    categoriasDocService,
    leisNormativasService,
    titulosNormativosService,
    orgaosService,
    ILeiNormativaDB,
    IOrgaoDB,
} from '@/services/api';

const formVazio = {
    nome: '',
    descricao: '',
    leiId: '',
    tituloNome: '',
    tituloId: '',
    ativo: true,
};

export default function EditarCategoriaPage() {
    const router = useRouter();
    const params = useParams();
    const [formData, setFormData] = useState(formVazio);
    const [originalData, setOriginalData] = useState(formVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dados carregados
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);
    const [orgaos, setOrgaos] = useState<IOrgaoDB[]>([]);
    const [orgaosSelecionados, setOrgaosSelecionados] = useState<string[]>([]);
    const [orgaosOriginal, setOrgaosOriginal] = useState<string[]>([]);
    const [selecionarTodosOrgaos, setSelecionarTodosOrgaos] = useState(false);

    const carregarCategoria = useCallback(async () => {
        try {
            setLoading(true);
            const id = params.id as string;

            const [categoria, leisData, orgaosData] = await Promise.all([
                categoriasDocService.buscarCategoriaPorId(id),
                leisNormativasService.listarAtivas(),
                orgaosService.listar(),
            ]);

            setLeis(leisData);
            setOrgaos(orgaosData);

            if (categoria) {
                const data = {
                    nome: categoria.nome,
                    descricao: categoria.descricao || '',
                    leiId: categoria.titulo?.lei_id || '',
                    tituloNome: categoria.titulo?.nome || '',
                    tituloId: categoria.titulo_id || '',
                    ativo: categoria.ativo,
                };
                setFormData(data);
                setOriginalData(data);

                // Carregar órgãos vinculados
                const orgaosIds = categoria.orgaos_vinculados?.map(ov => ov.orgao_id) || [];
                setOrgaosSelecionados(orgaosIds);
                setOrgaosOriginal(orgaosIds);
                setSelecionarTodosOrgaos(orgaosIds.length === orgaosData.length && orgaosData.length > 0);
            } else {
                alert('Categoria não encontrada');
                router.push('/cadastros/normativos');
            }
        } catch (err) {
            console.error('Erro ao carregar categoria:', err);
            alert('Erro ao carregar categoria. Tente novamente.');
            router.push('/cadastros/normativos');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        carregarCategoria();
    }, [carregarCategoria]);

    // Handle selecionar todos os órgãos  
    useEffect(() => {
        if (selecionarTodosOrgaos) {
            setOrgaosSelecionados(orgaos.map(o => o.id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selecionarTodosOrgaos]);

    const handleToggleOrgao = (orgaoId: string) => {
        setOrgaosSelecionados(prev => {
            const novos = prev.includes(orgaoId)
                ? prev.filter(id => id !== orgaoId)
                : [...prev, orgaoId];
            setSelecionarTodosOrgaos(novos.length === orgaos.length);
            return novos;
        });
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};
        if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.leiId) novosErros.leiId = 'Lei é obrigatória';
        if (!formData.tituloNome.trim()) novosErros.tituloNome = 'Título é obrigatório';
        if (orgaosSelecionados.length === 0) novosErros.orgaos = 'Selecione pelo menos um órgão';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
        if (!validar()) return;

        try {
            setSaving(true);
            const id = params.id as string;

            // Buscar ou criar título
            const titulo = await titulosNormativosService.buscarOuCriarPorNome(
                formData.leiId,
                formData.tituloNome.trim()
            );

            // Atualizar categoria
            await categoriasDocService.atualizarCategoria(id, {
                nome: formData.nome,
                descricao: formData.descricao,
                titulo_id: titulo.id,
                ativo: formData.ativo,
            });

            // Atualizar órgãos vinculados
            await categoriasDocService.atualizarOrgaosVinculados(id, orgaosSelecionados);

            router.push('/cadastros/normativos');
        } catch (err) {
            console.error('Erro ao atualizar categoria:', err);
            alert('Erro ao atualizar categoria. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(originalData);
        setOrgaosSelecionados(orgaosOriginal);
        setErros({});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FolderOpen className="h-6 w-6" />
                        Editar Categoria
                    </h1>
                    <p className="text-muted-foreground">
                        Altere os dados da categoria de documentos
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Categoria</CardTitle>
                    <CardDescription>Preencha as informações da categoria de documentos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Lei */}
                        <div className="space-y-2">
                            <TooltipProvider>
                                <div className="flex items-center gap-1">
                                    <Label>Lei <span className="text-red-500">*</span></Label>
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
                            <Select
                                value={formData.leiId}
                                onValueChange={(valor) => setFormData({ ...formData, leiId: valor })}
                            >
                                <SelectTrigger className={erros.leiId ? 'border-red-500' : ''}>
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

                        {/* Título */}
                        <div className="space-y-2">
                            <TooltipProvider>
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="titulo">Nome do Título <span className="text-red-500">*</span></Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Título que agrupa as categorias dentro da lei selecionada.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                            <Input
                                id="titulo"
                                value={formData.tituloNome}
                                onChange={(e) => setFormData({ ...formData, tituloNome: e.target.value })}
                                placeholder="Ex: Dispensa"
                                className={erros.tituloNome ? 'border-red-500' : ''}
                            />
                            {erros.tituloNome && <p className="text-sm text-red-500">{erros.tituloNome}</p>}
                        </div>

                        {/* Nome da Categoria */}
                        <div className="space-y-2">
                            <TooltipProvider>
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nome">Nome da Categoria <span className="text-red-500">*</span></Label>
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
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => {
                                    if (e.target.value.length <= 100) {
                                        setFormData({ ...formData, nome: e.target.value });
                                    }
                                }}
                                placeholder="Ex: Pareceres Técnicos"
                                className={erros.nome ? 'border-red-500' : ''}
                            />
                            <div className="text-xs text-right text-muted-foreground">{formData.nome.length}/100 caracteres</div>
                            {erros.nome && <p className="text-sm text-red-500">{erros.nome}</p>}
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
                                                <p>Selecione os órgãos que terão acesso a esta categoria.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Checkbox
                                            id="todos-orgaos"
                                            checked={selecionarTodosOrgaos}
                                            onCheckedChange={(c) => {
                                                const checked = !!c;
                                                setSelecionarTodosOrgaos(checked);
                                                if (!checked) setOrgaosSelecionados([]);
                                            }}
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
                                checked={formData.ativo}
                                onCheckedChange={(c) => setFormData({ ...formData, ativo: !!c })}
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
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="edit"
                isLoading={saving}
            />
        </div>
    );
}
