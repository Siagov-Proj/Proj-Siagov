'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Palette,
    Bell,
    Link2,
    Shield,
    Save,
    RefreshCw,
} from 'lucide-react';

export default function ConfiguracoesPage() {
    const [salvando, setSalvando] = useState(false);

    // Estados de configuração
    const [configGeral, setConfigGeral] = useState({
        nomeInstituicao: 'SIAGOV - Sistema Integrado',
        sigla: 'SIAGOV',
        cnpj: '00.000.000/0001-00',
        email: 'contato@siagov.gov.br',
        telefone: '(11) 1234-5678',
    });

    const [configTema, setConfigTema] = useState({
        tema: 'system',
        corPrimaria: '#003366',
        compacto: false,
    });

    const [configNotificacoes, setConfigNotificacoes] = useState({
        emailTramitacao: true,
        emailPrazo: true,
        emailChamado: true,
        pushBrowser: false,
        resumoDiario: true,
    });

    const [configIntegracoes, setConfigIntegracoes] = useState({
        supabaseConectado: true,
        iaHabilitada: true,
        emailHabilitado: false,
    });

    const salvarConfiguracoes = async () => {
        setSalvando(true);
        // Simula salvamento
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Configurações salvas:', {
            configGeral,
            configTema,
            configNotificacoes,
            configIntegracoes,
        });
        setSalvando(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Configurações
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie as configurações do sistema
                    </p>
                </div>
                <Button onClick={salvarConfiguracoes} disabled={salvando}>
                    <Save className="mr-2 h-4 w-4" />
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {/* Tabs de Configuração */}
            <Tabs defaultValue="geral" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="geral" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Geral
                    </TabsTrigger>
                    <TabsTrigger value="tema" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Tema
                    </TabsTrigger>
                    <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notificações
                    </TabsTrigger>
                    <TabsTrigger value="integracoes" className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Integrações
                    </TabsTrigger>
                </TabsList>

                {/* Configurações Gerais */}
                <TabsContent value="geral">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações Gerais</CardTitle>
                            <CardDescription>
                                Informações básicas da instituição
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomeInstituicao">Nome da Instituição</Label>
                                    <Input
                                        id="nomeInstituicao"
                                        value={configGeral.nomeInstituicao}
                                        onChange={(e) =>
                                            setConfigGeral({ ...configGeral, nomeInstituicao: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sigla">Sigla</Label>
                                    <Input
                                        id="sigla"
                                        value={configGeral.sigla}
                                        onChange={(e) =>
                                            setConfigGeral({ ...configGeral, sigla: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input
                                        id="cnpj"
                                        value={configGeral.cnpj}
                                        onChange={(e) =>
                                            setConfigGeral({ ...configGeral, cnpj: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={configGeral.email}
                                        onChange={(e) =>
                                            setConfigGeral({ ...configGeral, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        value={configGeral.telefone}
                                        onChange={(e) =>
                                            setConfigGeral({ ...configGeral, telefone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Configurações de Tema */}
                <TabsContent value="tema">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aparência</CardTitle>
                            <CardDescription>Personalize a aparência do sistema</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Tema</Label>
                                <Select
                                    value={configTema.tema}
                                    onValueChange={(value) =>
                                        setConfigTema({ ...configTema, tema: value })
                                    }
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Claro</SelectItem>
                                        <SelectItem value="dark">Escuro</SelectItem>
                                        <SelectItem value="system">Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Cor Primária</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="color"
                                        value={configTema.corPrimaria}
                                        onChange={(e) =>
                                            setConfigTema({ ...configTema, corPrimaria: e.target.value })
                                        }
                                        className="w-16 h-10 p-1"
                                    />
                                    <Input
                                        value={configTema.corPrimaria}
                                        onChange={(e) =>
                                            setConfigTema({ ...configTema, corPrimaria: e.target.value })
                                        }
                                        className="w-32 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Modo Compacto</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Reduz o espaçamento entre elementos
                                    </p>
                                </div>
                                <Switch
                                    checked={configTema.compacto}
                                    onCheckedChange={(checked) =>
                                        setConfigTema({ ...configTema, compacto: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Configurações de Notificações */}
                <TabsContent value="notificacoes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificações</CardTitle>
                            <CardDescription>Configure quando deseja receber alertas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Tramitação de Processos</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber e-mail quando um processo for tramitado para você
                                    </p>
                                </div>
                                <Switch
                                    checked={configNotificacoes.emailTramitacao}
                                    onCheckedChange={(checked) =>
                                        setConfigNotificacoes({ ...configNotificacoes, emailTramitacao: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Alertas de Prazo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber e-mail quando um prazo estiver próximo do vencimento
                                    </p>
                                </div>
                                <Switch
                                    checked={configNotificacoes.emailPrazo}
                                    onCheckedChange={(checked) =>
                                        setConfigNotificacoes({ ...configNotificacoes, emailPrazo: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Atualizações de Chamados</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber e-mail quando houver resposta em seus chamados
                                    </p>
                                </div>
                                <Switch
                                    checked={configNotificacoes.emailChamado}
                                    onCheckedChange={(checked) =>
                                        setConfigNotificacoes({ ...configNotificacoes, emailChamado: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Notificações Push</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber notificações no navegador
                                    </p>
                                </div>
                                <Switch
                                    checked={configNotificacoes.pushBrowser}
                                    onCheckedChange={(checked) =>
                                        setConfigNotificacoes({ ...configNotificacoes, pushBrowser: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Resumo Diário</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber resumo diário de atividades por e-mail
                                    </p>
                                </div>
                                <Switch
                                    checked={configNotificacoes.resumoDiario}
                                    onCheckedChange={(checked) =>
                                        setConfigNotificacoes({ ...configNotificacoes, resumoDiario: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Configurações de Integrações */}
                <TabsContent value="integracoes">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supabase</CardTitle>
                                <CardDescription>Banco de dados e autenticação</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-3 h-3 rounded-full ${configIntegracoes.supabaseConectado
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                                }`}
                                        />
                                        <span>
                                            {configIntegracoes.supabaseConectado
                                                ? 'Conectado'
                                                : 'Desconectado'}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Testar Conexão
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inteligência Artificial</CardTitle>
                                <CardDescription>Geração de documentos com IA</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Habilitar IA</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Permite geração automática de documentos
                                        </p>
                                    </div>
                                    <Switch
                                        checked={configIntegracoes.iaHabilitada}
                                        onCheckedChange={(checked) =>
                                            setConfigIntegracoes({ ...configIntegracoes, iaHabilitada: checked })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Serviço de E-mail</CardTitle>
                                <CardDescription>Envio de notificações por e-mail</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            variant={
                                                configIntegracoes.emailHabilitado
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {configIntegracoes.emailHabilitado
                                                ? 'Configurado'
                                                : 'Não Configurado'}
                                        </Badge>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Configurar SMTP
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
