'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { ordenadoresService, IOrdenadorDB } from '@/services/api/ordenadoresService';

interface OrdenadoresTabProps {
    unidadeGestoraId: string;
}

const emptyOrdenador = {
    codigo_credor: '',
    nome: '',
    tipo: '',
    cargo: '',

    data_nomeacao: '',
    ato_nomeacao: '',
    numero_diario_oficial_nomeacao: '',
    data_publicacao_nomeacao: '',

    data_exoneracao: '',
    ato_exoneracao: '',
    numero_diario_oficial_exoneracao: '',
    data_publicacao_exoneracao: '',
};

export function OrdenadoresTab({ unidadeGestoraId }: OrdenadoresTabProps) {
    const [ordenadores, setOrdenadores] = useState<IOrdenadorDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState(emptyOrdenador);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const carregarOrdenadores = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await ordenadoresService.listarPorUnidadeGestora(unidadeGestoraId);
            setOrdenadores(dados);
        } catch (err) {
            console.error('Erro ao carregar ordenadores:', err);
        } finally {
            setLoading(false);
        }
    }, [unidadeGestoraId]);

    useEffect(() => {
        if (unidadeGestoraId) {
            carregarOrdenadores();
        }
    }, [carregarOrdenadores, unidadeGestoraId]);

    const handleOpenModal = (ordenador?: IOrdenadorDB) => {
        if (ordenador) {
            setFormData({
                codigo_credor: ordenador.codigo_credor || '',
                nome: ordenador.nome || '',
                tipo: ordenador.tipo || '',
                cargo: ordenador.cargo || '',
                data_nomeacao: ordenador.data_nomeacao || '',
                ato_nomeacao: ordenador.ato_nomeacao || '',
                numero_diario_oficial_nomeacao: ordenador.numero_diario_oficial_nomeacao || '',
                data_publicacao_nomeacao: ordenador.data_publicacao_nomeacao || '',
                data_exoneracao: ordenador.data_exoneracao || '',
                ato_exoneracao: ordenador.ato_exoneracao || '',
                numero_diario_oficial_exoneracao: ordenador.numero_diario_oficial_exoneracao || '',
                data_publicacao_exoneracao: ordenador.data_publicacao_exoneracao || '',
            });
            setEditingId(ordenador.id);
        } else {
            setFormData(emptyOrdenador);
            setEditingId(null);
        }
        setErrors({});
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setFormData(emptyOrdenador);
        setEditingId(null);
        setErrors({});
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
        if (!formData.codigo_credor) newErrors.codigo_credor = 'Código Credor é obrigatório';
        if (!formData.tipo) newErrors.tipo = 'Tipo é obrigatório';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            setSaving(true);
            const payload = {
                unidade_gestora_id: unidadeGestoraId,
                codigo_credor: formData.codigo_credor,
                nome: formData.nome,
                tipo: formData.tipo,
                cargo: formData.cargo,

                data_nomeacao: formData.data_nomeacao || undefined,
                ato_nomeacao: formData.ato_nomeacao,
                numero_diario_oficial_nomeacao: formData.numero_diario_oficial_nomeacao,
                data_publicacao_nomeacao: formData.data_publicacao_nomeacao || undefined,

                data_exoneracao: formData.data_exoneracao || undefined,
                ato_exoneracao: formData.ato_exoneracao,
                numero_diario_oficial_exoneracao: formData.numero_diario_oficial_exoneracao,
                data_publicacao_exoneracao: formData.data_publicacao_exoneracao || undefined,
                ativo: true,
            };

            if (editingId) {
                await ordenadoresService.atualizar(editingId, payload);
            } else {
                await ordenadoresService.criar(payload);
            }

            handleCloseModal();
            carregarOrdenadores();
        } catch (err) {
            console.error('Erro ao salvar ordenador:', err);
            alert('Erro ao salvar ordenador. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleExcluir = async (id: string, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o ordenador ${nome}?`)) {
            return;
        }

        try {
            await ordenadoresService.excluir(id);
            carregarOrdenadores();
        } catch (err) {
            console.error('Erro ao excluir ordenador:', err);
            alert('Erro ao excluir ordenador.');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ordenadores</CardTitle>
                    <CardDescription>Gerencie os ordenadores de despesa vinculados a esta unidade</CardDescription>
                </div>
                <Button onClick={() => handleOpenModal()} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Ordenador
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : ordenadores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Nenhum ordenador cadastrado.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Cód. Credor</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordenadores.map((ord) => (
                                <TableRow key={ord.id}>
                                    <TableCell className="font-medium">{ord.nome}</TableCell>
                                    <TableCell>{ord.codigo_credor}</TableCell>
                                    <TableCell>{ord.tipo}</TableCell>
                                    <TableCell>{ord.cargo || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ord)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleExcluir(ord.id, ord.nome)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Ordenador' : 'Novo Ordenador'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Atualize os dados' : 'Preencha os dados'} do ordenador de despesa.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Dados Básicos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b pb-2">Dados Básicos</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome<span className="text-red-500 ml-1">*</span></Label>
                                    <Input
                                        id="nome"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className={errors.nome ? 'border-red-500' : ''}
                                    />
                                    {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="codigo_credor">Cód. Credor<span className="text-red-500 ml-1">*</span></Label>
                                    <Input
                                        id="codigo_credor"
                                        value={formData.codigo_credor}
                                        onChange={(e) => setFormData({ ...formData, codigo_credor: e.target.value })}
                                        className={errors.codigo_credor ? 'border-red-500' : ''}
                                    />
                                    {errors.codigo_credor && <p className="text-sm text-red-500">{errors.codigo_credor}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo<span className="text-red-500 ml-1">*</span></Label>
                                    <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                                        <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Titular">Titular</SelectItem>
                                            <SelectItem value="Substituto">Substituto</SelectItem>
                                            <SelectItem value="Co-responsável">Co-responsável</SelectItem>
                                            <SelectItem value="Delegado">Delegado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cargo">Cargo</Label>
                                    <Input
                                        id="cargo"
                                        value={formData.cargo}
                                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nomeação */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b pb-2">Nomeação</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_nomeacao">Data</Label>
                                    <Input
                                        id="data_nomeacao"
                                        type="date"
                                        value={formData.data_nomeacao}
                                        onChange={(e) => setFormData({ ...formData, data_nomeacao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ato_nomeacao">Ato</Label>
                                    <Input
                                        id="ato_nomeacao"
                                        value={formData.ato_nomeacao}
                                        onChange={(e) => setFormData({ ...formData, ato_nomeacao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numero_diario_oficial_nomeacao">Nº D.O.</Label>
                                    <Input
                                        id="numero_diario_oficial_nomeacao"
                                        value={formData.numero_diario_oficial_nomeacao}
                                        onChange={(e) => setFormData({ ...formData, numero_diario_oficial_nomeacao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_publicacao_nomeacao">Publ. D.O.</Label>
                                    <Input
                                        id="data_publicacao_nomeacao"
                                        type="date"
                                        value={formData.data_publicacao_nomeacao}
                                        onChange={(e) => setFormData({ ...formData, data_publicacao_nomeacao: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Exoneração */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium border-b pb-2">Exoneração</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_exoneracao">Data</Label>
                                    <Input
                                        id="data_exoneracao"
                                        type="date"
                                        value={formData.data_exoneracao}
                                        onChange={(e) => setFormData({ ...formData, data_exoneracao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ato_exoneracao">Ato</Label>
                                    <Input
                                        id="ato_exoneracao"
                                        value={formData.ato_exoneracao}
                                        onChange={(e) => setFormData({ ...formData, ato_exoneracao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numero_diario_oficial_exoneracao">Nº D.O.</Label>
                                    <Input
                                        id="numero_diario_oficial_exoneracao"
                                        value={formData.numero_diario_oficial_exoneracao}
                                        onChange={(e) => setFormData({ ...formData, numero_diario_oficial_exoneracao: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_publicacao_exoneracao">Publ. D.O.</Label>
                                    <Input
                                        id="data_publicacao_exoneracao"
                                        type="date"
                                        value={formData.data_publicacao_exoneracao}
                                        onChange={(e) => setFormData({ ...formData, data_publicacao_exoneracao: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseModal} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSalvar} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
