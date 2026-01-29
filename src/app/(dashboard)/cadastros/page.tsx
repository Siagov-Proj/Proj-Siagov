'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Building2,
    Building,
    Landmark,
    BriefcaseBusiness,
    UserCheck,
    Users,
    Wallet,
    Calendar,
    CreditCard,
    Folder,
    Globe,
    Info,
} from 'lucide-react';
import Link from 'next/link';

const cadastroItems = [
    {
        title: 'Esferas de Governo',
        description: 'Federal, Estadual, Municipal e Distrital',
        icon: Globe,
        path: '/cadastros/esferas',
        count: '4 registro(s)',
        color: 'bg-blue-500',
    },
    {
        title: 'Instituições',
        description: 'Gestão de instituições governamentais',
        icon: Building2,
        path: '/cadastros/instituicoes',
        count: '12 registro(s)',
        color: 'bg-purple-500',
    },
    {
        title: 'Órgãos',
        description: 'Órgãos vinculados às instituições',
        icon: Building,
        path: '/cadastros/orgaos',
        count: '28 registro(s)',
        color: 'bg-green-500',
    },
    {
        title: 'Unidades Gestoras',
        description: 'Unidades administrativas dos órgãos',
        icon: Landmark,
        path: '/cadastros/unidades',
        count: '45 registro(s)',
        color: 'bg-orange-500',
    },
    {
        title: 'Setores Administrativos',
        description: 'Setores vinculados às unidades',
        icon: BriefcaseBusiness,
        path: '/cadastros/setores',
        count: '87 registro(s)',
        color: 'bg-amber-600',
    },
    {
        title: 'Cargos Administrativos',
        description: 'Cargos vinculados aos setores',
        icon: UserCheck,
        path: '/cadastros/cargos',
        count: '24 registro(s)',
        color: 'bg-red-500',
    },
    {
        title: 'Usuários',
        description: 'Gestão de usuários do sistema',
        icon: Users,
        path: '/cadastros/usuarios',
        count: '156 registro(s)',
        color: 'bg-indigo-500',
    },
    {
        title: 'Credores',
        description: 'Pessoas físicas e jurídicas',
        icon: Wallet,
        path: '/cadastros/credores',
        count: '1.240 registro(s)',
        color: 'bg-teal-500',
    },
    {
        title: 'Exercício Financeiro',
        description: 'Gestão de anos fiscais',
        icon: Calendar,
        path: '/cadastros/exercicios',
        count: '5 registro(s)',
        color: 'bg-slate-500',
    },
    {
        title: 'Rede Bancária',
        description: 'Bancos e instituições financeiras',
        icon: CreditCard,
        path: '/cadastros/bancos',
        count: '15 registro(s)',
        color: 'bg-pink-500',
    },
    {
        title: 'Agências Bancárias',
        description: 'Agências vinculadas aos bancos',
        icon: Landmark,
        path: '/cadastros/agencias',
        count: '42 registro(s)',
        color: 'bg-cyan-600',
    },
    {
        title: 'Normativos',
        description: 'Normativos e subcategorias de documentos',
        icon: Folder,
        path: '/cadastros/normativos',
        count: '5 registro(s)',
        color: 'bg-red-500',
    },
];

export default function CadastrosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Cadastros Internos</h1>
                <p className="text-muted-foreground">
                    Gerencie as tabelas e estruturas do sistema
                </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Sobre os Cadastros Internos
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Estes cadastros são utilizados como base para todo o sistema. Mantenha-os atualizados para garantir o correto funcionamento.
                        <br />
                        A hierarquia é: Esfera → Instituição → Órgão → Unidade Gestora → Setor Administrativo.
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cadastroItems.map((item) => (
                    <Link key={item.path} href={item.path} className="block group">
                        <Card className="h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.01] group-hover:shadow-xl dark:group-hover:shadow-blue-500/20 group-hover:border-primary/20 dark:group-hover:bg-blue-950/20 border-gray-100 dark:border-gray-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className={`p-2 rounded-lg ${item.color} text-white transition-transform group-hover:scale-110`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                    {item.count}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-base font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
