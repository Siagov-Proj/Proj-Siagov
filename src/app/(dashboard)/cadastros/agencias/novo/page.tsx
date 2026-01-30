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
import { maskCep, maskTelefone, maskCodigoComZeros, maskCnpj } from '@/utils/masks';
import { ESTADOS_BRASIL, FIELD_LIMITS } from '@/utils/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { agenciasService, bancosService, IBancoDB } from '@/services/api';

const emptyFormData = {
    bancoId: '',
    codigo: '',
    digitoVerificador: '',
    nome: '',
    nomeAbreviado: '',
    cnpj: '',
    praca: '',
    gerente: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    municipio: '',
    uf: '',
    telefone: '',
    email: '',
};

export default function NovaAgenciaPage() {
    const router = useRouter();
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [bancos, setBancos] = useState<IBancoDB[]>([]);
    const [loadingBancos, setLoadingBancos] = useState(true);

    const carregarBancos = useCallback(async () => {
        try {
            setLoadingBancos(true);
            const dados = await bancosService.listar();
            setBancos(dados);
        } catch (err) {
            console.error('Erro ao carregar bancos:', err);
        } finally {
            setLoadingBancos(false);
        }
    }, []);

    useEffect(() => {
        carregarBancos();
    }, [carregarBancos]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.bancoId) newErrors.bancoId = 'Banco é obrigatório';
        if (!formData.codigo) newErrors.codigo = 'Código da agência é obrigatório';
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            await agenciasService.criar({
                banco_id: formData.bancoId,
                codigo: formData.codigo,
                digito_verificador: formData.digitoVerificador,
                nome: formData.nome,
                nome_abreviado: formData.nomeAbreviado,
                cnpj: formData.cnpj,
                praca: formData.praca,
                gerente: formData.gerente,
                cep: formData.cep,
                endereco: formData.endereco,
                numero: formData.numero,
                bairro: formData.bairro,
                municipio: formData.municipio,
                uf: formData.uf,
                telefone: formData.telefone,
                email: formData.email,
                ativo: true,
            });
            router.push('/cadastros/agencias');
        } catch (err) {
            console.error('Erro ao salvar agência:', err);
            alert('Erro ao salvar agência. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        router.back();
    };

    const handleLimpar = () => {
        setFormData(emptyFormData);
        setErrors({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleCancelar}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nova Agência</h1>
                    <p className="text-muted-foreground">
                        Cadastro de agência bancária vinculada a um banco
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Agência</CardTitle>
                    <CardDescription>Informações principais e endereço</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        {/* Banco e Código */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="bancoId">
                                        Banco<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <FieldTooltip content="Selecione o banco ao qual a agência pertence" />
                                </div>
                                {loadingBancos ? (
                                    <div className="flex items-center gap-2 h-10">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.bancoId}
                                        onValueChange={(valor) => setFormData({ ...formData, bancoId: valor })}
                                    >
                                        <SelectTrigger className={errors.bancoId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione o banco" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bancos.map((banco) => (
                                                <SelectItem key={banco.id} value={banco.id}>
                                                    {banco.codigo} - {banco.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.bancoId && <p className="text-sm text-red-500">{errors.bancoId}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codigo">
                                        Código da Agência<span className="text-red-500 ml-1">*</span>
                                    </Label>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: maskCodigoComZeros(e.target.value, 4) })}
                                        maxLength={4}
                                        placeholder="0000"
                                        className={`font-mono flex-1 ${errors.codigo ? 'border-red-500' : ''}`}
                                    />
                                    <Input
                                        value={formData.digitoVerificador}
                                        onChange={(e) => setFormData({ ...formData, digitoVerificador: e.target.value.substring(0, 1) })}
                                        maxLength={1}
                                        placeholder="DV"
                                        className="w-14 font-mono text-center"
                                    />
                                </div>
                                {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
                            </div>
                        </div>

                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome da Agência<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                maxLength={FIELD_LIMITS.nome}
                                placeholder="Nome da agência"
                                className={errors.nome ? 'border-red-500' : ''}
                            />
                            {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                        </div>

                        {/* Nome Abreviado e CNPJ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeAbreviado">
                                    Nome Abreviado
                                </Label>
                                <Input
                                    id="nomeAbreviado"
                                    value={formData.nomeAbreviado}
                                    onChange={(e) => setFormData({ ...formData, nomeAbreviado: e.target.value })}
                                    maxLength={30}
                                    placeholder="Ex: AG. CENTRO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: maskCnpj(e.target.value) })}
                                    maxLength={18}
                                    placeholder="00.000.000/0001-91"
                                />
                            </div>
                        </div>

                        {/* Praça e Gerente */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="praca">
                                    Praça de Pagamento
                                </Label>
                                <Input
                                    id="praca"
                                    value={formData.praca}
                                    onChange={(e) => setFormData({ ...formData, praca: e.target.value })}
                                    maxLength={60}
                                    placeholder="Ex: SÃO PAULO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gerente">Gerente</Label>
                                <Input
                                    id="gerente"
                                    value={formData.gerente}
                                    onChange={(e) => setFormData({ ...formData, gerente: e.target.value })}
                                    maxLength={60}
                                    placeholder="Nome do gerente"
                                />
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className="border-t pt-4 mt-2">
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
                                    <Label htmlFor="endereco">Logradouro</Label>
                                    <Input
                                        id="endereco"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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
                                    <Label htmlFor="bairro">Bairro</Label>
                                    <Input
                                        id="bairro"
                                        value={formData.bairro}
                                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                        maxLength={FIELD_LIMITS.bairro}
                                        placeholder="Bairro"
                                    />
                                </div>

                                <div className="space-y-2">
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
                                        onValueChange={(valor) => setFormData({ ...formData, uf: valor })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTADOS_BRASIL.map((estado) => (
                                                <SelectItem key={estado.value} value={estado.value}>
                                                    {estado.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Contato */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-4">Contato</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                                        maxLength={15}
                                        placeholder="(00) 0000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        maxLength={FIELD_LIMITS.email}
                                        placeholder="agencia@banco.com.br"
                                    />
                                </div>
                            </div>
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

