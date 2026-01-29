'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import { formatDateTimeBR } from '@/utils/formatters';

// Tipos
interface IMensagem {
    id: string;
    usuario: string;
    conteudo: string;
    criadoEm: Date;
    isAdmin: boolean;
}

interface IChamadoDetalhe {
    id: string;
    protocolo: string;
    assunto: string;
    categoria: 'Bug' | 'Dúvida' | 'Melhoria';
    status: 'Aberto' | 'Em Atendimento' | 'Aguardando Resposta' | 'Resolvido' | 'Fechado';
    prioridade: 'Alta' | 'Média' | 'Baixa';
    criadoPor: string;
    criadoEm: Date;
    slaRestante?: string;
    mensagens: IMensagem[];
}

// Dados mock
const mockChamado: IChamadoDetalhe = {
    id: '1',
    protocolo: '2025-001',
    assunto: 'Erro na geração de documento',
    categoria: 'Bug',
    status: 'Aberto',
    prioridade: 'Alta',
    criadoPor: 'João Silva',
    criadoEm: new Date('2025-01-29T10:30:00'),
    slaRestante: '2h restantes',
    mensagens: [
        {
            id: '1',
            usuario: 'João Silva',
            conteudo: 'Ao tentar gerar um documento do tipo Parecer, o sistema apresentou erro após 30 segundos de processamento. A mensagem exibida foi "Erro interno do servidor". Isso aconteceu 3 vezes consecutivas.',
            criadoEm: new Date('2025-01-29T10:30:00'),
            isAdmin: false,
        },
        {
            id: '2',
            usuario: 'Suporte SIAGOV',
            conteudo: 'Olá João, obrigado por reportar o problema. Estamos analisando o erro e retornaremos em breve com uma solução.',
            criadoEm: new Date('2025-01-29T11:00:00'),
            isAdmin: true,
        },
    ],
};

export default function DetalheChamadoPage() {
    const params = useParams();
    const [novaMensagem, setNovaMensagem] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Em produção, buscaria o chamado pelo ID
    const chamado = mockChamado;

    const enviarMensagem = async () => {
        if (!novaMensagem.trim()) return;

        setEnviando(true);

        // Simula envio
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('Mensagem enviada:', novaMensagem);
        setNovaMensagem('');
        setEnviando(false);
    };

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
                            {chamado.mensagens.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-lg ${msg.isAdmin
                                            ? 'bg-primary/10 border-l-4 border-primary'
                                            : 'bg-muted'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {msg.usuario}
                                                {msg.isAdmin && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        Suporte
                                                    </Badge>
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTimeBR(msg.criadoEm)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {msg.conteudo}
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
                                <p>{chamado.criadoPor}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Data de Abertura</p>
                                <p>{formatDateTimeBR(chamado.criadoEm)}</p>
                            </div>
                            {chamado.slaRestante && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">SLA</span>
                                    </div>
                                    <p className="text-sm mt-1">{chamado.slaRestante}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
