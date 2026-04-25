'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { chamadosService, IChamadoDB, IChamadoAnexoDB } from '@/services/api/chamadosService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, MessageSquare, Clock, User, AlertCircle, Building2, Users, Download, FileText, Image, Video, Paperclip, FolderOpen, XCircle, Pencil } from 'lucide-react';
import { formatDateTimeBR } from '@/utils/formatters';

type IChamadoMensagem = Awaited<ReturnType<typeof chamadosService.listarMensagens>>[number];

function obterIconeArquivo(tipo?: string) {
    if (!tipo) return <FileText className="h-4 w-4 text-blue-500" />;
    if (tipo.startsWith('image/')) return <Image className="h-4 w-4 text-green-500" />;
    if (tipo.startsWith('video/')) return <Video className="h-4 w-4 text-purple-500" />;
    return <FileText className="h-4 w-4 text-blue-500" />;
}

export default function DetalheChamadoPage() {
    const params = useParams();
    const id = params.id as string;
    const [chamado, setChamado] = useState<IChamadoDB | null>(null);
    const [mensagens, setMensagens] = useState<IChamadoMensagem[]>([]);
    const [anexos, setAnexos] = useState<IChamadoAnexoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [baixando, setBaixando] = useState<string | null>(null);
    const [encerrando, setEncerrando] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState('Usuário');

    // Estados de Edição
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editSituacao, setEditSituacao] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPrioridade, setEditPrioridade] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    useEffect(() => {
        if (chamado) {
            setEditSituacao(chamado.situacao);
            setEditStatus(chamado.status);
            setEditPrioridade(chamado.prioridade);
        }
    }, [chamado]);

    const carregarDados = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [chamadoData, msgData, anexosData] = await Promise.all([
                chamadosService.obterPorId(id),
                chamadosService.listarMensagens(id),
                chamadosService.listarAnexos(id),
            ]);
            setChamado(chamadoData);
            setMensagens(msgData);
            setAnexos(anexosData);
        } catch (error) {
            console.error('Erro ao carregar detalhe:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Carregar nome do usuário logado
    useEffect(() => {
        async function carregarUsuario() {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user?.email) return;
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('nome')
                    .eq('email_institucional', user.email)
                    .eq('ativo', true)
                    .eq('excluido', false)
                    .maybeSingle();
                if (userData?.nome) setNomeUsuario(userData.nome);
            } catch { /* silent */ }
        }
        carregarUsuario();
    }, []);

    const enviarMensagem = async () => {
        if (!novaMensagem.trim() || !id) return;

        setEnviando(true);
        try {
            await chamadosService.enviarMensagem(id, novaMensagem, nomeUsuario);
            setNovaMensagem('');
            const msgs = await chamadosService.listarMensagens(id);
            setMensagens(msgs);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            setEnviando(false);
        }
    };

    const encerrarChamado = async () => {
        if (!id || !chamado) return;
        setEncerrando(true);
        try {
            await chamadosService.atualizar(id, { status: 'Fechado' });
            // Refresh
            const chamadoAtualizado = await chamadosService.obterPorId(id);
            setChamado(chamadoAtualizado);
        } catch (error) {
            console.error('Erro ao encerrar chamado:', error);
        } finally {
            setEncerrando(false);
        }
    };

    const salvarEdicao = async () => {
        if (!id) return;
        setSalvandoEdicao(true);
        try {
            await chamadosService.atualizar(id, {
                situacao: editSituacao as IChamadoDB['situacao'],
                status: editStatus as IChamadoDB['status'],
                prioridade: editPrioridade as IChamadoDB['prioridade'],
            });
            setEditModalOpen(false);
            const chamadoAtualizado = await chamadosService.obterPorId(id);
            setChamado(chamadoAtualizado);
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
        } finally {
            setSalvandoEdicao(false);
        }
    };

    const baixarAnexo = async (anexo: IChamadoAnexoDB) => {
        if (!anexo.url) return;
        setBaixando(anexo.id);
        try {
            // URL é o storage path direto (bucket é privado)
            const signedUrl = await chamadosService.gerarUrlDownloadAnexo(anexo.url);
            window.open(signedUrl, '_blank');
        } catch (error) {
            console.error('Erro ao baixar anexo:', error);
        } finally {
            setBaixando(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando detalhes do chamado...</div>;
    if (!chamado) return <div className="p-8 text-center text-red-500">Chamado não encontrado.</div>;

    const obterCorStatus = (status: string) => {
        switch (status) {
            case 'Aberto':
                return 'destructive';
            case 'Em Atendimento':
                return 'default';
            case 'Aguardando Resposta':
                return 'secondary';
            case 'Resolvido':
            case 'Fechado':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/chamados">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <MessageSquare className="h-6 w-6" />
                                Chamado #{chamado.protocolo}
                            </h1>
                            <Badge variant={obterCorStatus(chamado.status)}>
                                {chamado.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{chamado.assunto}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setEditModalOpen(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    {chamado.status !== 'Fechado' && chamado.status !== 'Resolvido' && (
                        <Button
                            variant="outline"
                            onClick={encerrarChamado}
                            disabled={encerrando}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {encerrando ? 'Encerrando...' : 'Encerrar Chamado'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline e Chat */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline de Mensagens */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Linha do Tempo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mensagens.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-lg ${msg.tipo === 'suporte'
                                        ? 'bg-primary/10 border-l-4 border-primary'
                                        : 'bg-muted'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {msg.autor}
                                                {msg.tipo === 'suporte' && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        Suporte
                                                    </Badge>
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTimeBR(msg.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {msg.mensagem}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Anexos */}
                    {anexos.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Paperclip className="h-5 w-5" />
                                    Anexos
                                </CardTitle>
                                <CardDescription>
                                    {anexos.length} arquivo(s) anexado(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {anexos.map((anexo) => (
                                        <div
                                            key={anexo.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex-shrink-0">
                                                {obterIconeArquivo(anexo.tipo_mime)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{anexo.nome}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {anexo.tamanho || '-'} • {formatDateTimeBR(anexo.created_at)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => baixarAnexo(anexo)}
                                                disabled={baixando === anexo.id}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                {baixando === anexo.id ? 'Baixando...' : 'Baixar'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Adicionar Mensagem */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Mensagem</CardTitle>
                            <CardDescription>
                                Envie informações adicionais ou responda ao suporte
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Digite sua mensagem..."
                                rows={4}
                                value={novaMensagem}
                                onChange={(e) => setNovaMensagem(e.target.value)}
                            />
                            <Button onClick={enviarMensagem} disabled={enviando || !novaMensagem.trim()}>
                                <Send className="mr-2 h-4 w-4" />
                                {enviando ? 'Enviando...' : 'Enviar Mensagem'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Informações Laterais */}
                <div className="space-y-6">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Protocolo</p>
                                <p className="font-mono font-medium">#{chamado.protocolo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Situação</p>
                                <Badge variant="secondary">{chamado.situacao}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Prioridade</p>
                                <Badge variant={chamado.prioridade === 'Alta' ? 'destructive' : 'outline'}>
                                    {chamado.prioridade}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Aberto por</p>
                                <p>{chamado.criado_por}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Data de Abertura</p>
                                <p>{formatDateTimeBR(chamado.data_abertura)}</p>
                            </div>
                            {chamado.sla_restante && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">SLA</span>
                                    </div>
                                    <p className="text-sm mt-1">{chamado.sla_restante}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Órgão e Setor */}
                    {(chamado.orgao_nome || chamado.setor_nome) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Lotação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {chamado.orgao_nome && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5" />
                                            Órgão
                                        </p>
                                        <p className="font-medium text-sm">{chamado.orgao_nome}</p>
                                    </div>
                                )}
                                {chamado.setor_nome && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            Setor
                                        </p>
                                        <p className="font-medium text-sm">{chamado.setor_nome}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Categoria/Subcategoria do Documento */}
                    {(chamado.categoria_documento_nome || chamado.subcategoria_documento_nome) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5" />
                                    Documento Relacionado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {chamado.categoria_documento_nome && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                                        <p className="font-medium text-sm">{chamado.categoria_documento_nome}</p>
                                    </div>
                                )}
                                {chamado.subcategoria_documento_nome && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Subcategoria</p>
                                        <p className="font-medium text-sm">{chamado.subcategoria_documento_nome}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal de Edição */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Chamado #{chamado.protocolo}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Situação</label>
                            <Select value={editSituacao} onValueChange={setEditSituacao}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a situação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bug">Bug/Erro</SelectItem>
                                    <SelectItem value="Dúvida">Dúvida</SelectItem>
                                    <SelectItem value="Melhoria">Sugestão de Melhoria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Aberto">Aberto</SelectItem>
                                    <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                                    <SelectItem value="Aguardando Resposta">Aguardando Resposta</SelectItem>
                                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                                    <SelectItem value="Fechado">Fechado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prioridade</label>
                            <Select value={editPrioridade} onValueChange={setEditPrioridade}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Baixa">Baixa</SelectItem>
                                    <SelectItem value="Média">Média</SelectItem>
                                    <SelectItem value="Alta">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={salvarEdicao} disabled={salvandoEdicao}>
                            {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
