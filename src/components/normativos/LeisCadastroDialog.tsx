'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Scale, Loader2, Save, X } from 'lucide-react';
import { leisNormativasService, ILeiNormativaDB } from '@/services/api';

interface LeisCadastroDialogProps {
    onLeisChanged?: () => void;
}

export function LeisCadastroDialog({ onLeisChanged }: LeisCadastroDialogProps) {
    const [open, setOpen] = useState(false);
    const [leis, setLeis] = useState<ILeiNormativaDB[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Form state
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [formNome, setFormNome] = useState('');
    const [formDescricao, setFormDescricao] = useState('');
    const [erroNome, setErroNome] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    const carregarLeis = useCallback(async () => {
        try {
            setLoading(true);
            const dados = await leisNormativasService.listar();
            setLeis(dados);
        } catch (err) {
            console.error('Erro ao carregar leis:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            carregarLeis();
        }
    }, [open, carregarLeis]);

    const limparForm = () => {
        setEditandoId(null);
        setFormNome('');
        setFormDescricao('');
        setErroNome('');
        setMostrarForm(false);
    };

    const iniciarEdicao = (lei: ILeiNormativaDB) => {
        setEditandoId(lei.id);
        setFormNome(lei.nome);
        setFormDescricao(lei.descricao || '');
        setErroNome('');
        setMostrarForm(true);
    };

    const iniciarNovo = () => {
        limparForm();
        setMostrarForm(true);
    };

    const handleSalvar = async () => {
        if (!formNome.trim()) {
            setErroNome('Nome da lei é obrigatório');
            return;
        }

        try {
            setSaving(true);
            if (editandoId) {
                await leisNormativasService.atualizar(editandoId, {
                    nome: formNome.trim(),
                    descricao: formDescricao.trim() || undefined,
                });
            } else {
                await leisNormativasService.criar({
                    nome: formNome.trim(),
                    descricao: formDescricao.trim() || undefined,
                    ativo: true,
                });
            }
            await carregarLeis();
            limparForm();
            onLeisChanged?.();
        } catch (err) {
            console.error('Erro ao salvar lei:', err);
            alert('Erro ao salvar lei. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta lei?')) return;

        try {
            setDeleting(id);
            await leisNormativasService.excluir(id);
            await carregarLeis();
            onLeisChanged?.();
        } catch (err) {
            console.error('Erro ao excluir lei:', err);
            alert('Erro ao excluir lei. Verifique se não há títulos vinculados.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Scale className="h-4 w-4" />
                    Gerenciar Leis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Gerenciar Leis Normativas
                    </DialogTitle>
                    <DialogDescription>
                        Cadastre, edite ou exclua as leis que serão vinculadas aos normativos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Formulário de adicionar/editar */}
                    {mostrarForm ? (
                        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <h4 className="text-sm font-medium">
                                {editandoId ? 'Editar Lei' : 'Nova Lei'}
                            </h4>
                            <div className="space-y-2">
                                <Label htmlFor="lei-nome">
                                    Nome da Lei <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="lei-nome"
                                    placeholder="Ex: Lei 14.133/2021"
                                    value={formNome}
                                    onChange={(e) => {
                                        setFormNome(e.target.value);
                                        setErroNome('');
                                    }}
                                    className={erroNome ? 'border-red-500' : ''}
                                />
                                {erroNome && <p className="text-sm text-red-500">{erroNome}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lei-descricao">Descrição</Label>
                                <Input
                                    id="lei-descricao"
                                    placeholder="Descrição da lei (opcional)"
                                    value={formDescricao}
                                    onChange={(e) => setFormDescricao(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Button
                                    size="sm"
                                    onClick={handleSalvar}
                                    disabled={saving}
                                    className="gap-1"
                                >
                                    {saving ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Save className="h-3 w-3" />
                                    )}
                                    {editandoId ? 'Atualizar' : 'Cadastrar'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={limparForm}
                                    className="gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={iniciarNovo}
                            className="gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            Adicionar Lei
                        </Button>
                    )}

                    {/* Lista de leis */}
                    <div className="rounded-md border">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : leis.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Nenhuma lei cadastrada.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="w-[80px] text-center">Status</TableHead>
                                        <TableHead className="w-[80px] text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leis.map((lei) => (
                                        <TableRow key={lei.id}>
                                            <TableCell className="font-medium">{lei.nome}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {lei.descricao || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={lei.ativo ? 'default' : 'destructive'}
                                                    className={
                                                        lei.ativo
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                            : ''
                                                    }
                                                >
                                                    {lei.ativo ? 'Ativa' : 'Inativa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                        onClick={() => iniciarEdicao(lei)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleExcluir(lei.id)}
                                                        disabled={deleting === lei.id}
                                                    >
                                                        {deleting === lei.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
