'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ActionBar } from '@/components/ui/action-bar';
import { FieldTooltip } from '@/components/ui/field-tooltip';
import { maskCnpj, maskCep } from '@/utils/masks';
import { ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { instituicoesService, esferasService, IEsferaDB } from '@/services/api';

const emptyFormData = {
    codigo: '',
    nome: '',
    nomeAbreviado: '',
    esferaId: '',
    cnpj: '',
    email: '',
    codigoSiasg: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
};

export default function NovaInstituicaoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [esferas, setEsferas] = useState<IEsferaDB[]>([]);
    const [loadingEsferas, setLoadingEsferas] = useState(true);

    const carregarEsferas = useCallback(async () => {
        try {
            setLoadingEsferas(true);
            const dados = await esferasService.listar();
            setEsferas(dados);
        } catch (err) {
            console.error('Erro ao carregar esferas:', err);
        } finally {
            setLoadingEsferas(false);
        }
    }, []);

    const gerarProximoCodigo = useCallback(async () => {
        try {
            const count = await instituicoesService.contar();
            const codigo = String(count + 1).padStart(3, '0');
            setFormData(prev => ({ ...prev, codigo }));
        } catch (err) {
            console.error('Erro ao gerar código:', err);
            setFormData(prev => ({ ...prev, codigo: '001' }));
        }
    }, []);

    useEffect(() => {
        carregarEsferas();
        gerarProximoCodigo();
    }, [carregarEsferas, gerarProximoCodigo]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.esferaId) newErrors.esfera = 'Esfera é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await instituicoesService.criar({
                codigo: formData.codigo,
                nome: formData.nome,
                nome_abreviado: formData.nomeAbreviado,
                esfera_id: formData.esferaId,
                cnpj: formData.cnpj,
                email: formData.email,
                codigo_siasg: formData.codigoSiasg,
                cep: formData.cep,
                logradouro: formData.logradouro,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                municipio: formData.municipio,
                uf: formData.uf,
                ativo: true,
            });
            router.push('/cadastros/instituicoes');
        } catch (err) {
            console.error('Erro ao salvar instituição:', err);
            alert('Erro ao salvar instituição. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData({ ...emptyFormData, codigo: formData.codigo });
        setErrors({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nova Instituição</h1>
                    <p className="text-muted-foreground">
                        Preencha os dados para cadastrar uma nova instituição
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Instituição</CardTitle>
                    <CardDescription>Informações gerais e endereço</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* Código (readonly), Nome e Nome Abreviado */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">Código</Label>
                                    <FieldTooltip content="Código sequencial gerado automaticamente" />
                                </div>
                                <Input
                                    id="codigo"
                                    value={formData.codigo}
                                    readOnly
                                    className="bg-muted font-mono"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nome">
                                        Nome<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    maxLength={FIELD_LIMITS.nome}
                                    placeholder="Nome da instituição"
                                    className={errors.nome ? 'border-red-500' : ''}
                                />
                                {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                            </div>
                        </div>

                        {/* Nome Abreviado e Esfera */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="nomeAbreviado">Nome Abreviado</Label>
                                    <FieldTooltip content="Sigla ou nome abreviado (máx. 30 caracteres)" />
                                </div>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nomeAbreviado: e.target.value.toUpperCase() })
                                    }
                                    maxLength={FIELD_LIMITS.nomeAbreviado}
                                    placeholder="SIGLA"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="esfera">
                                        Esfera<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Esfera de governo: Federal, Estadual, Municipal ou Distrital" />
                                </div>
                                {loadingEsferas ? (
                                    <div className="flex items-center gap-2 h-10">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.esferaId}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, esferaId: value })
                                        }
                                    >
                                        <SelectTrigger className={errors.esfera ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione a esfera" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {esferas.map((esfera) => (
                                                <SelectItem key={esfera.id} value={esfera.id}>
                                                    {esfera.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.esfera && <p className="text-sm text-red-500">{errors.esfera}</p>}
                            </div>
                        </div>

                        {/* CNPJ e Código SIASG */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <FieldTooltip content="CNPJ da instituição" />
                                </div>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                    maxLength={18}
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigoSiasg">Código SIASG</Label>
                                    <FieldTooltip content="Código no Sistema Integrado de Administração de Serviços Gerais" />
                                </div>
                                <Input
                                    id="codigoSiasg"
                                    value={formData.codigoSiasg}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            codigoSiasg: e.target.value.replace(/\D/g, '').substring(0, 6),
                                        })
                                    }
                                    maxLength={6}
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-4">Endereço</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <Input
                                        id="cep"
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: maskCep(e.target.value) })}
                                        maxLength={9}
                                        placeholder="00000-000"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="logradouro">Logradouro</Label>
                                    <Input
                                        id="logradouro"
                                        value={formData.logradouro}
                                        onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                                        maxLength={FIELD_LIMITS.logradouro}
                                        placeholder="Rua, Avenida, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        maxLength={FIELD_LIMITS.numero}
                                        placeholder="Nº"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="complemento">Complemento</Label>
                                    <Input
                                        id="complemento"
                                        value={formData.complemento}
                                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                        maxLength={FIELD_LIMITS.complemento}
                                        placeholder="Apto, Sala, etc."
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        maxLength={FIELD_LIMITS.bairro}
                                        placeholder="Bairro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="municipio">Município</Label>
                                    <Input
                                        id="municipio"
                                        value={formData.municipio}
                                        onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                                        maxLength={FIELD_LIMITS.municipio}
                                        placeholder="Cidade"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="uf">UF</Label>
                                    <Select
                                        value={formData.uf}
                                        onValueChange={(value) => setFormData({ ...formData, uf: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((estado) => (
                                                <SelectItem key={estado.value} value={estado.value}>
                                                    {estado.value} - {estado.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                maxLength={FIELD_LIMITS.email}
                                placeholder="contato@instituicao.gov.br"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ActionBar
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
                onLimpar={handleLimpar}
                mode="create"
                isLoading={saving}
            />
        </div>
    );
}
