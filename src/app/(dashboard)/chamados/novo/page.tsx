'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { chamadosService } from '@/services/api/chamadosService';
import { categoriasDocService, ICategoriaDocumentoDB, ISubcategoriaDocumentoDB } from '@/services/api/categoriasDocService';
import { getSupabaseClient } from '@/lib/supabase/client';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, MessageSquare, Upload, X, FileText, Image, Video, Building2, Users, Paperclip, FolderOpen } from 'lucide-react';
import type { IChamadoDB } from '@/services/api/chamadosService';

const SITUACOES = [
    { value: 'Bug', label: 'Bug/Erro' },
    { value: 'Dúvida', label: 'Dúvida' },
    { value: 'Melhoria', label: 'Sugestão de Melhoria' },
];

const PRIORIDADES = [
    { value: 'Alta', label: 'Alta - Urgente' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' },
];

type IChamadoSituacao = IChamadoDB['situacao'];
type IChamadoPrioridade = IChamadoDB['prioridade'];

interface IUsuarioContexto {
    user_id: string;
    nome: string;
    orgao_id?: string;
    orgao_nome?: string;
    setor_id?: string;
    setor_nome?: string;
}

interface IArquivoSelecionado {
    file: File;
    preview?: string;
    erro?: string;
}

const formDataVazio = {
    assunto: '',
    situacao: '',
    prioridade: 'Média',
    descricao: '',
    categoria_documento_id: '',
    subcategoria_documento_id: '',
};

function obterIconeArquivo(tipo: string) {
    if (tipo.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
    if (tipo.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
}

function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NovoChamadoPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    // Contexto do usuário logado (órgão/setor)
    const [usuario, setUsuario] = useState<IUsuarioContexto | null>(null);

    // Categorias e subcategorias de documentos
    const [categorias, setCategorias] = useState<ICategoriaDocumentoDB[]>([]);
    const [subcategorias, setSubcategorias] = useState<ISubcategoriaDocumentoDB[]>([]);
    const [carregandoSubs, setCarregandoSubs] = useState(false);

    // Arquivos anexos
    const [arquivos, setArquivos] = useState<IArquivoSelecionado[]>([]);

    // Carregar contexto do usuário (órgão/setor)
    useEffect(() => {
        async function carregarContexto() {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !user.email) return;

                // Buscar dados do usuário na tabela usuarios
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('nome, orgao_id, setor_id')
                    .eq('email_institucional', user.email)
                    .eq('ativo', true)
                    .eq('excluido', false)
                    .maybeSingle();

                if (!userData) return;

                // Buscar nomes de órgão e setor
                let orgaoNome = '';
                let setorNome = '';

                if (userData.orgao_id) {
                    const { data: orgao } = await supabase
                        .from('orgaos')
                        .select('nome')
                        .eq('id', userData.orgao_id)
                        .single();
                    orgaoNome = orgao?.nome || '';
                }

                if (userData.setor_id) {
                    const { data: setor } = await supabase
                        .from('setores')
                        .select('nome')
                        .eq('id', userData.setor_id)
                        .single();
                    setorNome = setor?.nome || '';
                }

                setUsuario({
                    user_id: user.id,
                    nome: userData.nome,
                    orgao_id: userData.orgao_id || undefined,
                    orgao_nome: orgaoNome || undefined,
                    setor_id: userData.setor_id || undefined,
                    setor_nome: setorNome || undefined,
                });
            } catch (err) {
                console.error('Erro ao carregar contexto do usuário:', err);
            }
        }
        carregarContexto();
    }, []);

    // Carregar categorias de documentos
    useEffect(() => {
        async function carregarCategorias() {
            try {
                const cats = await categoriasDocService.listarCategorias();
                setCategorias(cats.filter(c => c.ativo));
            } catch (err) {
                console.error('Erro ao carregar categorias:', err);
            }
        }
        carregarCategorias();
    }, []);

    // Carregar subcategorias quando categoria muda
    const carregarSubcategorias = useCallback(async (categoriaId: string) => {
        if (!categoriaId) {
            setSubcategorias([]);
            return;
        }
        setCarregandoSubs(true);
        try {
            const subs = await categoriasDocService.listarSubcategorias(categoriaId);
            setSubcategorias(subs.filter(s => s.ativo));
        } catch (err) {
            console.error('Erro ao carregar subcategorias:', err);
            setSubcategorias([]);
        } finally {
            setCarregandoSubs(false);
        }
    }, []);

    useEffect(() => {
        if (formData.categoria_documento_id) {
            carregarSubcategorias(formData.categoria_documento_id);
        } else {
            setSubcategorias([]);
        }
    }, [formData.categoria_documento_id, carregarSubcategorias]);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.assunto.trim()) novosErros.assunto = 'Assunto é obrigatório';
        if (!formData.situacao) novosErros.situacao = 'Situação é obrigatória';
        if (!formData.descricao.trim()) novosErros.descricao = 'Descrição é obrigatória';

        // Validar arquivos
        for (const arq of arquivos) {
            if (arq.erro) {
                novosErros.arquivos = 'Remova os arquivos inválidos antes de enviar';
                break;
            }
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleArquivoSelecionado = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const novosArquivos: IArquivoSelecionado[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validacao = chamadosService.validarAnexo(file);
            novosArquivos.push({
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                erro: validacao.valido ? undefined : validacao.mensagem,
            });
        }

        setArquivos(prev => [...prev, ...novosArquivos]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removerArquivo = (index: number) => {
        setArquivos(prev => {
            const novo = [...prev];
            // Revoke blob URL if exists
            if (novo[index].preview) {
                URL.revokeObjectURL(novo[index].preview!);
            }
            novo.splice(index, 1);
            return novo;
        });
    };

    const salvar = async () => {
        if (!validar()) return;

        setSalvando(true);
        try {
            // 1. Criar o chamado
            const chamado = await chamadosService.criar({
                assunto: formData.assunto,
                situacao: formData.situacao as IChamadoSituacao,
                prioridade: formData.prioridade as IChamadoPrioridade,
                descricao: formData.descricao,
                status: 'Aberto',
                criado_por: usuario?.nome || 'Usuário Sistema',
                user_id: usuario?.user_id || undefined,
                orgao_id: usuario?.orgao_id || undefined,
                setor_id: usuario?.setor_id || undefined,
                categoria_documento_id: formData.categoria_documento_id || null,
                subcategoria_documento_id: formData.subcategoria_documento_id || null,
            } as Partial<IChamadoDB>);

            // 2. Upload dos anexos (se houver)
            const arquivosValidos = arquivos.filter(a => !a.erro);
            for (const arq of arquivosValidos) {
                try {
                    const storagePath = await chamadosService.uploadAnexo(chamado.id, arq.file);

                    // Armazenar o storage path (bucket é privado, URL pública não funciona)
                    // O download será feito via signed URL no detalhe do chamado
                    await chamadosService.salvarAnexoDB({
                        chamado_id: chamado.id,
                        nome: arq.file.name,
                        tamanho: formatarTamanho(arq.file.size),
                        url: storagePath,
                        tipo_mime: arq.file.type,
                    });
                } catch (uploadErr) {
                    console.error('Erro ao fazer upload do anexo:', uploadErr);
                    // Continua mesmo se um anexo falhar
                }
            }

            // Redireciona para listagem
            router.push('/chamados');
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/chamados">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <MessageSquare className="h-6 w-6" />
                        Novo Chamado
                    </h1>
                    <p className="text-muted-foreground">
                        Registre uma solicitação de suporte
                    </p>
                </div>
            </div>

            {/* Informações do Servidor (Órgão/Setor) */}
            {usuario && (usuario.orgao_nome || usuario.setor_nome) && (
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                                {usuario.orgao_nome && (
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Órgão</span>
                                        <p className="font-medium text-sm">{usuario.orgao_nome}</p>
                                    </div>
                                )}
                                {usuario.setor_nome && (
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Setor</span>
                                        <p className="font-medium text-sm">{usuario.setor_nome}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Formulário */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados do Chamado</CardTitle>
                    <CardDescription>
                        Preencha as informações abaixo para abrir um novo chamado
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Assunto */}
                    <div className="space-y-2">
                        <Label htmlFor="assunto">
                            Assunto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="assunto"
                            placeholder="Ex: Erro na geração de documento"
                            value={formData.assunto}
                            onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                            className={erros.assunto ? 'border-red-500' : ''}
                        />
                        {erros.assunto && (
                            <p className="text-sm text-red-500">{erros.assunto}</p>
                        )}
                    </div>

                    {/* Situação e Prioridade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="situacao">
                                Situação <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.situacao}
                                onValueChange={(valor) => setFormData({ ...formData, situacao: valor })}
                            >
                                <SelectTrigger className={erros.situacao ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione a situação" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SITUACOES.map((sit) => (
                                        <SelectItem key={sit.value} value={sit.value}>
                                            {sit.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {erros.situacao && (
                                <p className="text-sm text-red-500">{erros.situacao}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prioridade">Prioridade</Label>
                            <Select
                                value={formData.prioridade}
                                onValueChange={(valor) => setFormData({ ...formData, prioridade: valor })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORIDADES.map((pri) => (
                                        <SelectItem key={pri.value} value={pri.value}>
                                            {pri.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Categoria e Subcategoria do Documento */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-base font-medium">Documento Relacionado</Label>
                        </div>
                        <p className="text-sm text-muted-foreground -mt-2">
                            Selecione a categoria e subcategoria do documento que será analisado (opcional)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoria_documento">Categoria do Documento</Label>
                                <Select
                                    value={formData.categoria_documento_id}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        categoria_documento_id: valor,
                                        subcategoria_documento_id: '', // Reset sub ao mudar cat
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subcategoria_documento">Subcategoria do Documento</Label>
                                <Select
                                    value={formData.subcategoria_documento_id}
                                    onValueChange={(valor) => setFormData({ ...formData, subcategoria_documento_id: valor })}
                                    disabled={!formData.categoria_documento_id || carregandoSubs}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            carregandoSubs
                                                ? 'Carregando...'
                                                : !formData.categoria_documento_id
                                                    ? 'Selecione uma categoria primeiro'
                                                    : subcategorias.length === 0
                                                        ? 'Nenhuma subcategoria'
                                                        : 'Selecione a subcategoria'
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategorias.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">
                            Descrição <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="descricao"
                            placeholder="Descreva o problema ou dúvida com o máximo de detalhes possível..."
                            rows={6}
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className={erros.descricao ? 'border-red-500' : ''}
                        />
                        {erros.descricao && (
                            <p className="text-sm text-red-500">{erros.descricao}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            Forneça informações detalhadas para agilizar o atendimento
                        </p>
                    </div>

                    {/* Anexos */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-base font-medium">Anexos</Label>
                        </div>
                        <p className="text-sm text-muted-foreground -mt-2">
                            Anexe documentos, prints ou vídeos relacionados ao chamado (opcional). Máx: 25MB por arquivo.
                        </p>

                        {/* Área de Upload */}
                        <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Clique para selecionar arquivos</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PDF, DOC, DOCX, ODT, TXT, JPG, PNG, GIF, WEBP, MP4, WEBM
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.odt,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                                onChange={handleArquivoSelecionado}
                                className="hidden"
                            />
                        </div>

                        {/* Lista de arquivos selecionados */}
                        {arquivos.length > 0 && (
                            <div className="space-y-2">
                                {arquivos.map((arq, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                                            arq.erro
                                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                                                : 'border-muted bg-muted/30'
                                        }`}
                                    >
                                        {/* Preview ou ícone */}
                                        {arq.preview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={arq.preview}
                                                alt={arq.file.name}
                                                className="h-10 w-10 rounded object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="flex-shrink-0">
                                                {obterIconeArquivo(arq.file.type)}
                                            </div>
                                        )}

                                        {/* Info do arquivo */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{arq.file.name}</p>
                                            {arq.erro ? (
                                                <p className="text-xs text-red-500">{arq.erro}</p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatarTamanho(arq.file.size)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Botão remover */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0 h-8 w-8"
                                            onClick={() => removerArquivo(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {erros.arquivos && (
                            <p className="text-sm text-red-500">{erros.arquivos}</p>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/chamados">Cancelar</Link>
                        </Button>
                        <Button onClick={salvar} disabled={salvando}>
                            <Send className="mr-2 h-4 w-4" />
                            {salvando ? 'Abrindo...' : 'Abrir Chamado'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
