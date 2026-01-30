'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { chamadosService } from '@/services/api/chamadosService';
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
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';

const CATEGORIAS = [
    { value: 'Bug', label: 'Bug/Erro' },
    { value: 'Dúvida', label: 'Dúvida' },
    { value: 'Melhoria', label: 'Sugestão de Melhoria' },
];

const PRIORIDADES = [
    { value: 'Alta', label: 'Alta - Urgente' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' },
];

const formDataVazio = {
    assunto: '',
    categoria: '',
    prioridade: 'Média',
    descricao: '',
};

export default function NovoChamadoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.assunto.trim()) novosErros.assunto = 'Assunto é obrigatório';
        if (!formData.categoria) novosErros.categoria = 'Categoria é obrigatória';
        if (!formData.descricao.trim()) novosErros.descricao = 'Descrição é obrigatória';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    // ...

    const salvar = async () => {
        if (!validar()) return;

        setSalvando(true);
        try {
            await chamadosService.criar({
                assunto: formData.assunto,
                categoria: formData.categoria as any, // Cast to enum
                prioridade: formData.prioridade as any,
                descricao: formData.descricao,
                status: 'Aberto',
                criado_por: 'Administrador Sistema' // Hardcoded for now, ideal: fetching from Auth
            });

            // Redireciona para listagem
            router.push('/chamados');
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            // Optional: show error toast
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

                    {/* Categoria e Prioridade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoria">
                                Categoria <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.categoria}
                                onValueChange={(valor) => setFormData({ ...formData, categoria: valor })}
                            >
                                <SelectTrigger className={erros.categoria ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIAS.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {erros.categoria && (
                                <p className="text-sm text-red-500">{erros.categoria}</p>
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
