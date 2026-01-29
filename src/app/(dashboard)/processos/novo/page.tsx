'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { FileText, ArrowLeft } from 'lucide-react';
import { FIELD_LIMITS } from '@/utils/constants';

// Mocks para os seletores
const mockInstituicoes = [
    { id: '1', nome: 'Ministério da Fazenda' },
    { id: '2', nome: 'Ministério da Educação' },
    { id: '3', nome: 'PMSP' },
];

const mockOrgaos = [
    { id: '1', instituicaoId: '1', nome: 'Secretaria de Finanças' },
    { id: '2', instituicaoId: '1', nome: 'Secretaria de Administração' },
    { id: '3', instituicaoId: '2', nome: 'Secretaria de Ensino' },
    { id: '4', instituicaoId: '3', nome: 'DER - Departamento de Estradas e Rodagens' },
];

const mockUnidadesGestoras = [
    { id: '1', orgaoId: '1', nome: 'UG Central' },
    { id: '2', orgaoId: '1', nome: 'UG Regional SP' },
    { id: '3', orgaoId: '2', nome: 'UG Administrativa' },
    { id: '4', orgaoId: '4', nome: 'Unidade de Licitações' },
];

const mockSetores = [
    { id: '1', unidadeId: '1', nome: 'Setor de Contabilidade' },
    { id: '2', unidadeId: '1', nome: 'Setor de Finanças' },
    { id: '3', unidadeId: '4', nome: 'Setor de Compras' },
    { id: '4', unidadeId: '4', nome: 'Setor Jurídico' },
];

const TIPOS_PROCESSO = [
    { value: 'Contratação Direta - Dispensa por Valor', label: 'Contratação Direta - Dispensa por Valor' },
    { value: 'Contratação Direta - Inexigibilidade', label: 'Contratação Direta - Inexigibilidade' },
    { value: 'Licitação - Pregão Eletrônico', label: 'Licitação - Pregão Eletrônico' },
    { value: 'Licitação - Concorrência', label: 'Licitação - Concorrência' },
    { value: 'Licitação - Concurso', label: 'Licitação - Concurso' },
    { value: 'Licitação - Leilão', label: 'Licitação - Leilão' },
    { value: 'Adesão à Ata de Registro de Preços', label: 'Adesão à Ata de Registro de Preços' },
    { value: 'Credenciamento', label: 'Credenciamento' },
    { value: 'Suprimento de Fundos', label: 'Suprimento de Fundos' },
    { value: 'Pagamento', label: 'Pagamento' },
    { value: 'Administrativo', label: 'Administrativo' },
];

const PRIORIDADES = [
    { value: 'Alta', label: 'Alta - Urgente' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Baixa', label: 'Baixa' },
];

const formDataVazio = {
    numero: '', // Manual input
    titulo: '',
    objeto: '',
    assunto: '',
    tipo: '',
    interessado: '',
    cpfCnpjInteressado: '',
    instituicaoId: '',
    orgaoId: '',
    unidadeGestoraId: '',
    setorDestinoId: '',
    dataPrazo: '',
    volumesAnexos: '1',
    observacoes: '',
};

export default function NovoProcessoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(formDataVazio);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    // Filtra órgãos pela instituição
    const orgaosFiltrados = mockOrgaos.filter((o) => o.instituicaoId === formData.instituicaoId);

    // Filtra unidades gestoras pelo órgão
    const unidadesFiltradas = mockUnidadesGestoras.filter((u) => u.orgaoId === formData.orgaoId);

    // Filtra setores pela unidade gestora
    const setoresFiltrados = mockSetores.filter((s) => s.unidadeId === formData.unidadeGestoraId);

    const limpar = () => {
        setFormData(formDataVazio);
        setErros({});
    };

    const validar = (): boolean => {
        const novosErros: Record<string, string> = {};

        if (!formData.numero.trim()) novosErros.numero = 'Número é obrigatório';
        if (!formData.titulo.trim()) novosErros.titulo = 'Título é obrigatório';
        if (!formData.objeto.trim()) novosErros.objeto = 'Objeto da contratação é obrigatório';
        if (!formData.tipo) novosErros.tipo = 'Tipo é obrigatório';
        if (!formData.interessado) novosErros.interessado = 'Interessado é obrigatório';
        if (!formData.instituicaoId) novosErros.instituicaoId = 'Instituição é obrigatória';
        if (!formData.orgaoId) novosErros.orgaoId = 'Órgão é obrigatório';
        if (!formData.unidadeGestoraId) novosErros.unidadeGestoraId = 'Unidade Gestora é obrigatória';
        if (!formData.setorDestinoId) novosErros.setorDestinoId = 'Setor de destino é obrigatório';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const salvar = async () => {
        if (!validar()) return;

        setSalvando(true);

        // Simula salvamento
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Log com dados completos
        const processoData = {
            ...formData,
            ...formData,
            // numero: formData.numero, (Already in formData)
            criadoEm: new Date().toLocaleString('pt-BR'),
            criadoPor: 'admin@siagov.com',
            status: 'Em Andamento',
            historico: [
                {
                    id: 1,
                    acao: 'Criação',
                    usuario: 'admin@siagov.com',
                    data: new Date().toLocaleString('pt-BR'),
                    observacao: 'Processo iniciado',
                },
            ],
        };
        console.log('Processo criado:', processoData);

        // Redireciona para listagem
        router.push('/processos');
    };

    // const gerarNumeroProcesso = () => { ... } // Removed auto generation

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/processos">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Novo Processo Administrativo
                    </h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para abertura de um novo processo
                    </p>
                </div>
            </div>

            {/* Formulário */}
            <div className="space-y-6">
                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                        <CardDescription>
                            Informe os dados iniciais do processo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="numero">
                                    Número do Processo<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Número de identificação do processo (Ex: 001/2026)" />
                            </div>
                            <Input
                                id="numero"
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                maxLength={20}
                                placeholder="Ex: 001/2026"
                                className={erros.numero ? 'border-red-500' : ''}
                            />
                            {erros.numero && <p className="text-sm text-red-500">{erros.numero}</p>}
                        </div>

                        {/* Título do Processo */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="titulo">
                                    Título do Processo<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Título curto e descritivo para identificação do processo" />
                            </div>
                            <Input
                                id="titulo"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                maxLength={150}
                                placeholder="Ex: Aquisição de Material de Expediente"
                                className={erros.titulo ? 'border-red-500' : ''}
                            />
                            {erros.titulo && <p className="text-sm text-red-500">{erros.titulo}</p>}
                        </div>

                        {/* Objeto da Contratação */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="objeto">
                                    Objeto da Contratação<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <FieldTooltip content="Descrição detalhada do objeto a ser contratado ou adquirido" />
                            </div>
                            <Textarea
                                id="objeto"
                                value={formData.objeto}
                                onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                                maxLength={1000}
                                rows={4}
                                placeholder="Descreva detalhadamente o objeto da contratação..."
                                className={erros.objeto ? 'border-red-500' : ''}
                            />
                            <div className="flex justify-between">
                                {erros.objeto && <p className="text-sm text-red-500">{erros.objeto}</p>}
                                <span className="text-xs text-muted-foreground ml-auto">{formData.objeto.length}/1000</span>
                            </div>
                        </div>

                        {/* Tipo e Prioridade */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo">
                                    Tipo de Processo<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(valor) => setFormData({ ...formData, tipo: valor })}
                                >
                                    <SelectTrigger className={erros.tipo ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_PROCESSO.map((tipo) => (
                                            <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.tipo && <p className="text-sm text-red-500">{erros.tipo}</p>}
                            </div>

                            {/* Prioridade removed to match legacy */}
                        </div>
                    </CardContent>
                </Card>

                {/* Interessado removed to match legacy */}\n

                {/* Vinculação Organizacional */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vinculação Organizacional</CardTitle>
                        <CardDescription>Hierarquia de origem e destino do processo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>
                                    Instituição<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    value={formData.instituicaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        instituicaoId: valor,
                                        orgaoId: '',
                                        unidadeGestoraId: '',
                                        setorDestinoId: '',
                                    })}
                                >
                                    <SelectTrigger className={erros.instituicaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockInstituicoes.map((i) => (
                                            <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.instituicaoId && <p className="text-sm text-red-500">{erros.instituicaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Órgão<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    value={formData.orgaoId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        orgaoId: valor,
                                        unidadeGestoraId: '',
                                        setorDestinoId: '',
                                    })}
                                    disabled={!formData.instituicaoId}
                                >
                                    <SelectTrigger className={erros.orgaoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.instituicaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orgaosFiltrados.map((o) => (
                                            <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.orgaoId && <p className="text-sm text-red-500">{erros.orgaoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Unidade Gestora<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    value={formData.unidadeGestoraId}
                                    onValueChange={(valor) => setFormData({
                                        ...formData,
                                        unidadeGestoraId: valor,
                                        setorDestinoId: '',
                                    })}
                                    disabled={!formData.orgaoId}
                                >
                                    <SelectTrigger className={erros.unidadeGestoraId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.orgaoId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidadesFiltradas.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.unidadeGestoraId && <p className="text-sm text-red-500">{erros.unidadeGestoraId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Setor Inicial<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    value={formData.setorDestinoId}
                                    onValueChange={(valor) => setFormData({ ...formData, setorDestinoId: valor })}
                                    disabled={!formData.unidadeGestoraId}
                                >
                                    <SelectTrigger className={erros.setorDestinoId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={formData.unidadeGestoraId ? 'Selecione' : 'Aguarde...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {setoresFiltrados.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {erros.setorDestinoId && <p className="text-sm text-red-500">{erros.setorDestinoId}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informações Complementares */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Complementares</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Data Prazo and Volumes removed to match legacy */}\n

                        {/* Observações */}
                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Descrição Detalhada</Label>
                            <Textarea
                                id="observacoes"
                                value={formData.observacoes}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                maxLength={1000}
                                rows={5}
                                placeholder="Informações adicionais sobre o processo..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ActionBar */}
            <ActionBar
                onSalvar={salvar}
                onCancelar={() => router.push('/processos')}
                onLimpar={limpar}
                mode="create"
                loading={salvando}
                salvarLabel="Criar Processo"
            />
        </div>
    );
}
