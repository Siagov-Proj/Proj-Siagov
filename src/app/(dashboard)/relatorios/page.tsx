'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    TrendingUp,
    Zap,
    FileText,
    Users,
    Clock,
    ArrowRight,
} from 'lucide-react';

interface IRelatorio {
    id: string;
    titulo: string;
    descricao: string;
    icone: React.ReactNode;
    cor: string;
    path: string;
    categoria: string;
}

const relatorios: IRelatorio[] = [
    {
        id: 'consumo',
        titulo: 'Relatório de Consumo',
        descricao: 'Acompanhe o consumo de tokens e recursos de IA',
        icone: <Zap className="h-6 w-6" />,
        cor: 'text-yellow-500',
        path: '/relatorios/consumo',
        categoria: 'IA',
    },
    {
        id: 'desempenho',
        titulo: 'Relatório de Desempenho',
        descricao: 'Métricas de desempenho do sistema e usuários',
        icone: <TrendingUp className="h-6 w-6" />,
        cor: 'text-green-500',
        path: '/relatorios/desempenho',
        categoria: 'Sistema',
    },
    {
        id: 'processos',
        titulo: 'Relatório de Processos',
        descricao: 'Estatísticas de processos por período e status',
        icone: <FileText className="h-6 w-6" />,
        cor: 'text-blue-500',
        path: '/relatorios/processos',
        categoria: 'Operacional',
    },
    {
        id: 'usuarios',
        titulo: 'Relatório de Usuários',
        descricao: 'Atividades e acessos dos usuários do sistema',
        icone: <Users className="h-6 w-6" />,
        cor: 'text-purple-500',
        path: '/relatorios/usuarios',
        categoria: 'Acesso',
    },
    {
        id: 'sla',
        titulo: 'Relatório de SLA',
        descricao: 'Indicadores de tempo de atendimento e resolução',
        icone: <Clock className="h-6 w-6" />,
        cor: 'text-orange-500',
        path: '/relatorios/sla',
        categoria: 'Suporte',
    },
];

export default function RelatoriosPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Relatórios
                </h1>
                <p className="text-muted-foreground">
                    Visualize métricas e indicadores do sistema
                </p>
            </div>

            {/* Grid de Relatórios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatorios.map((relatorio) => (
                    <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-lg bg-muted ${relatorio.cor}`}>
                                    {relatorio.icone}
                                </div>
                                <Badge variant="outline">{relatorio.categoria}</Badge>
                            </div>
                            <CardTitle className="mt-4">{relatorio.titulo}</CardTitle>
                            <CardDescription>{relatorio.descricao}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={relatorio.path}>
                                    Visualizar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Resumo Rápido */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Período</CardTitle>
                    <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold text-blue-600">142</p>
                            <p className="text-sm text-muted-foreground">Processos Abertos</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold text-green-600">89</p>
                            <p className="text-sm text-muted-foreground">Processos Concluídos</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold text-yellow-600">15,432</p>
                            <p className="text-sm text-muted-foreground">Tokens Consumidos</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold text-purple-600">98.5%</p>
                            <p className="text-sm text-muted-foreground">Uptime do Sistema</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
