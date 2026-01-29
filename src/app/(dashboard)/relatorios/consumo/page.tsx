'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Download } from 'lucide-react';

// Dados mock
const consumoPorDia = [
    { data: '29/01/2025', tokens: 1245, documentos: 8, custo: 'R$ 2,49' },
    { data: '28/01/2025', tokens: 2130, documentos: 12, custo: 'R$ 4,26' },
    { data: '27/01/2025', tokens: 1890, documentos: 10, custo: 'R$ 3,78' },
    { data: '26/01/2025', tokens: 956, documentos: 5, custo: 'R$ 1,91' },
    { data: '25/01/2025', tokens: 1678, documentos: 9, custo: 'R$ 3,36' },
    { data: '24/01/2025', tokens: 2456, documentos: 14, custo: 'R$ 4,91' },
    { data: '23/01/2025', tokens: 1234, documentos: 7, custo: 'R$ 2,47' },
];

const consumoPorEspecialista = [
    { especialista: 'Licitações Públicas', tokens: 8543, percentual: 45 },
    { especialista: 'Recursos Humanos', tokens: 4231, percentual: 22 },
    { especialista: 'Contratos', tokens: 3456, percentual: 18 },
    { especialista: 'Legislação Tributária', tokens: 2890, percentual: 15 },
];

export default function RelatorioConsumoPage() {
    const totalTokens = consumoPorDia.reduce((acc, item) => acc + item.tokens, 0);
    const mediaTokens = Math.round(totalTokens / consumoPorDia.length);
    const totalDocumentos = consumoPorDia.reduce((acc, item) => acc + item.documentos, 0);

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
                            <Zap className="h-6 w-6 text-yellow-500" />
                            Relatório de Consumo
                        </h1>
                        <p className="text-muted-foreground">
                            Consumo de tokens e recursos de IA nos últimos 7 dias
                        </p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total de Tokens</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            +12% vs período anterior
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Média Diária</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mediaTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">tokens/dia</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Documentos Gerados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDocumentos}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            -5% vs período anterior
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Custo Estimado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ 23,18</div>
                        <p className="text-xs text-muted-foreground">no período</p>
                    </CardContent>
                </Card>
            </div>

            {/* Consumo por Especialista */}
            <Card>
                <CardHeader>
                    <CardTitle>Consumo por Especialista</CardTitle>
                    <CardDescription>Distribuição de tokens entre especialistas de IA</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {consumoPorEspecialista.map((item) => (
                            <div key={item.especialista} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{item.especialista}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {item.tokens.toLocaleString()} tokens ({item.percentual}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${item.percentual}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tabela Detalhada */}
            <Card>
                <CardHeader>
                    <CardTitle>Consumo Diário</CardTitle>
                    <CardDescription>Detalhamento do consumo por dia</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Tokens</TableHead>
                                    <TableHead className="text-right">Documentos</TableHead>
                                    <TableHead className="text-right">Custo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumoPorDia.map((item) => (
                                    <TableRow key={item.data}>
                                        <TableCell>{item.data}</TableCell>
                                        <TableCell className="text-right">
                                            {item.tokens.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">{item.documentos}</TableCell>
                                        <TableCell className="text-right">{item.custo}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
