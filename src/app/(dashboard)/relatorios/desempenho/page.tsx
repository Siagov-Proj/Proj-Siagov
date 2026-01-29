'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Download, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

// Dados mock
const metricas = {
    uptime: 99.8,
    tempoMedioResposta: 245,
    processosHoje: 23,
    errosHoje: 2,
};

const desempenhoPorModulo = [
    { modulo: 'Processos', tempo: 180, status: 'ok' },
    { modulo: 'Documentos', tempo: 320, status: 'warning' },
    { modulo: 'Cadastros', tempo: 95, status: 'ok' },
    { modulo: 'Relatórios', tempo: 450, status: 'warning' },
    { modulo: 'Chamados', tempo: 120, status: 'ok' },
];

const ultimosErros = [
    { hora: '09:45', modulo: 'Documentos', erro: 'Timeout na geração de PDF', impacto: 'Baixo' },
    { hora: '08:12', modulo: 'Processos', erro: 'Falha ao salvar tramitação', impacto: 'Médio' },
];

export default function RelatorioDesempenhoPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/relatorios">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            Relatório de Desempenho
                        </h1>
                        <p className="text-muted-foreground">
                            Métricas de desempenho do sistema em tempo real
                        </p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            Uptime
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metricas.uptime}%</div>
                        <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Tempo Médio de Resposta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metricas.tempoMedioResposta}ms</div>
                        <p className="text-xs text-muted-foreground">Média geral</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                            Operações Hoje
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metricas.processosHoje}</div>
                        <p className="text-xs text-muted-foreground">processos tramitados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Erros
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metricas.errosHoje}</div>
                        <p className="text-xs text-muted-foreground">nas últimas 24h</p>
                    </CardContent>
                </Card>
            </div>

            {/* Desempenho por Módulo */}
            <Card>
                <CardHeader>
                    <CardTitle>Desempenho por Módulo</CardTitle>
                    <CardDescription>Tempo médio de resposta de cada módulo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {desempenhoPorModulo.map((item) => (
                            <div key={item.modulo} className="flex items-center gap-4">
                                <div className="w-28 font-medium">{item.modulo}</div>
                                <div className="flex-1">
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${item.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}
                                            style={{ width: `${Math.min((item.tempo / 500) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-20 text-right">
                                    <span className="text-sm font-medium">{item.tempo}ms</span>
                                </div>
                                <Badge variant={item.status === 'ok' ? 'default' : 'secondary'}>
                                    {item.status === 'ok' ? 'Normal' : 'Lento'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        * Tempos acima de 300ms são considerados lentos
                    </p>
                </CardContent>
            </Card>

            {/* Últimos Erros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Últimos Erros
                    </CardTitle>
                    <CardDescription>Erros registrados nas últimas 24 horas</CardDescription>
                </CardHeader>
                <CardContent>
                    {ultimosErros.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            Nenhum erro registrado
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {ultimosErros.map((erro, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground font-mono">
                                            {erro.hora}
                                        </span>
                                        <Badge variant="outline">{erro.modulo}</Badge>
                                        <span className="text-sm">{erro.erro}</span>
                                    </div>
                                    <Badge
                                        variant={erro.impacto === 'Alto' ? 'destructive' : 'secondary'}
                                    >
                                        {erro.impacto}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Status Geral */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-full">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                                Sistema Operacional
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Todos os serviços funcionando normalmente
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
