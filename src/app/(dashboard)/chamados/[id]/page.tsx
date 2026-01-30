'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { chamadosService, IChamadoDB } from '@/services/api/chamadosService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import { formatDateTimeBR } from '@/utils/formatters';

// (Mock data removed)

export default function DetalheChamadoPage() {
    const params = useParams();
    const id = params.id as string;
    const [chamado, setChamado] = useState<IChamadoDB | null>(null);
    const [mensagens, setMensagens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [enviando, setEnviando] = useState(false);

    const carregarDados = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [chamadoData, msgData] = await Promise.all([
                chamadosService.obterPorId(id),
                chamadosService.listarMensagens(id)
            ]);
            setChamado(chamadoData);
            setMensagens(msgData);
        } catch (error) {
            console.error('Erro ao carregar detalhe:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const enviarMensagem = async () => {
        if (!novaMensagem.trim() || !id) return;

        setEnviando(true);
        try {
            await chamadosService.enviarMensagem(id, novaMensagem, 'Usuario Teste'); // TODO: Get from Auth
            setNovaMensagem('');
            // Refresh messages
            const msgs = await chamadosService.listarMensagens(id);
            setMensagens(msgs);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        } finally {
            setEnviando(false);
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
                <Button variant="outline">Encerrar Chamado</Button>
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
                <div>
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
                                <p className="text-sm text-muted-foreground mb-1">Categoria</p>
                                <Badge variant="secondary">{chamado.categoria}</Badge>
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
                </div>
            </div>
        </div>
    );
}
