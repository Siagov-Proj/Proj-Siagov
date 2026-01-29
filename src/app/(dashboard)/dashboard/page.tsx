'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Users,
    Building,
    TrendingUp,
    Clock,
    ArrowUpRight,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import Link from 'next/link';

// Mock data for dashboard
const stats = [
    {
        title: 'Processos Ativos',
        value: '127',
        change: '+12%',
        changeType: 'positive' as const,
        icon: FileText,
        description: 'Total em tramitação',
    },
    {
        title: 'Credores Cadastrados',
        value: '2.458',
        change: '+5%',
        changeType: 'positive' as const,
        icon: Users,
        description: 'Cadastros ativos',
    },
    {
        title: 'Órgãos Vinculados',
        value: '34',
        change: '0%',
        changeType: 'neutral' as const,
        icon: Building,
        description: 'Estrutura organizacional',
    },
    {
        title: 'Taxa de Conformidade',
        value: '94%',
        change: '+3%',
        changeType: 'positive' as const,
        icon: TrendingUp,
        description: 'Documentos aprovados',
    },
];

const recentProcesses = [
    {
        id: '1',
        numero: '2024/001234',
        assunto: 'Aquisição de Materiais de Escritório',
        status: 'Em Tramitação',
        prioridade: 'Normal',
        data: '29/01/2026',
    },
    {
        id: '2',
        numero: '2024/001233',
        assunto: 'Contratação de Serviços de Limpeza',
        status: 'Aguardando Aprovação',
        prioridade: 'Alta',
        data: '28/01/2026',
    },
    {
        id: '3',
        numero: '2024/001232',
        assunto: 'Reforma da Sala de Reuniões',
        status: 'Em Análise',
        prioridade: 'Urgente',
        data: '27/01/2026',
    },
    {
        id: '4',
        numero: '2024/001231',
        assunto: 'Compra de Equipamentos de TI',
        status: 'Concluído',
        prioridade: 'Normal',
        data: '26/01/2026',
    },
];

const pendingTasks = [
    { id: '1', title: 'Aprovar processo 2024/001233', deadline: 'Hoje', urgent: true },
    { id: '2', title: 'Revisar cadastro de credor', deadline: 'Amanhã', urgent: false },
    { id: '3', title: 'Atualizar dados da UG', deadline: '31/01', urgent: false },
];

export default function DashboardPage() {
    const { user, exercicioCorrente } = useAuth();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Concluído':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            case 'Em Tramitação':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'Aguardando Aprovação':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Em Análise':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getPrioridadeColor = (prioridade: string) => {
        switch (prioridade) {
            case 'Urgente':
                return 'bg-red-500';
            case 'Alta':
                return 'bg-orange-500';
            case 'Normal':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Bem-vindo, {user?.nome?.split(' ')[0] || 'Usuário'}!
                    </h1>
                    <p className="text-muted-foreground">
                        Exercício Financeiro {exercicioCorrente} • Visão geral do sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/processos/novo">
                        <Button>
                            <FileText className="mr-2 h-4 w-4" />
                            Novo Processo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span
                                    className={
                                        stat.changeType === 'positive'
                                            ? 'text-green-600'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    {stat.change}
                                </span>
                                <span className="text-muted-foreground">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Processes */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Processos Recentes</CardTitle>
                            <CardDescription>Últimos processos cadastrados no sistema</CardDescription>
                        </div>
                        <Link href="/processos">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Ver todos
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentProcesses.map((processo) => (
                                <div
                                    key={processo.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-1 h-10 rounded-full ${getPrioridadeColor(
                                                processo.prioridade
                                            )}`}
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{processo.numero}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                                                {processo.assunto}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="secondary"
                                            className={getStatusColor(processo.status)}
                                        >
                                            {processo.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">
                                            {processo.data}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Tarefas Pendentes
                        </CardTitle>
                        <CardDescription>Ações que requerem sua atenção</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    {task.urgent ? (
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Prazo: {task.deadline}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            Ver todas as tarefas
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
