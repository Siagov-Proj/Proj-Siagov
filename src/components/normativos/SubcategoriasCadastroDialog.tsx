'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, ListTree } from 'lucide-react';
import { categoriasDocService, ISubcategoriaDocumentoDB } from '@/services/api/categoriasDocService';
import { useCadastroDialogs } from '@/components/cadastros/cadastro-dialog-provider';
import { buildNormativoLabel, compareNormativoLabels, extractNormativoCode, stripNormativoCode } from '@/utils';

interface SubcategoriasCadastroDialogProps {
    categoriaId: string;
    onSubcategoriasChanged?: () => void;
}

export function SubcategoriasCadastroDialog({ categoriaId, onSubcategoriasChanged }: SubcategoriasCadastroDialogProps) {
    const { showConfirm } = useCadastroDialogs();
    const [open, setOpen] = useState(false);
    const [subcategorias, setSubcategorias] = useState<ISubcategoriaDocumentoDB[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Form state
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [formNome, setFormNome] = useState('');
    const [formDescricao, setFormDescricao] = useState('');
    const [erroNome, setErroNome] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [codigoCategoria, setCodigoCategoria] = useState('');

    const carregarSubcategorias = useCallback(async () => {
        if (!categoriaId) return;
        try {
            setLoading(true);
            const [dados, categoria] = await Promise.all([
                categoriasDocService.listarSubcategorias(categoriaId),
                categoriasDocService.buscarCategoriaPorId(categoriaId),
            ]);
            setSubcategorias(dados.sort((a, b) => compareNormativoLabels(a.nome, b.nome)));
            setCodigoCategoria(extractNormativoCode(categoria?.nome || '') || '');
        } catch (err) {
            console.error('Erro ao carregar subcategorias:', err);
        } finally {
            setLoading(false);
        }
    }, [categoriaId]);

    useEffect(() => {
        if (open) {
            carregarSubcategorias();
            limparForm();
        }
    }, [open, carregarSubcategorias]);

    const limparForm = () => {
        setEditandoId(null);
        setFormNome('');
        setFormDescricao('');
        setErroNome('');
        setMostrarForm(false);
    };

    const iniciarEdicao = (subcat: ISubcategoriaDocumentoDB) => {
        setEditandoId(subcat.id);
        setFormNome(stripNormativoCode(subcat.nome));
        setFormDescricao(subcat.descricao || '');
        setErroNome('');
        setMostrarForm(true);
    };

    const iniciarNovo = () => {
        limparForm();
        setMostrarForm(true);
    };

    const handleSalvar = async () => {
        if (!formNome.trim()) {
            setErroNome('Nome da subcategoria é obrigatório');
            return;
        }

        try {
            setSaving(true);
            if (editandoId) {
                const subcategoriaAtual = subcategorias.find((item) => item.id === editandoId);
                const codigoAtual = extractNormativoCode(subcategoriaAtual?.nome || '');
                await categoriasDocService.atualizarSubcategoria(editandoId, {
                    nome: codigoAtual ? buildNormativoLabel(codigoAtual, formNome.trim()) : formNome.trim(),
                    descricao: formDescricao.trim() || undefined,
                });
            } else {
                const proximoCodigo = codigoCategoria ? `${codigoCategoria}.${subcategorias.length + 1}` : '';
                await categoriasDocService.criarSubcategoria({
                    categoria_id: categoriaId,
                    nome: proximoCodigo ? buildNormativoLabel(proximoCodigo, formNome.trim()) : formNome.trim(),
                    descricao: formDescricao.trim() || undefined,
                    ativo: true,
                });
            }
            await carregarSubcategorias();
            limparForm();
            onSubcategoriasChanged?.();
        } catch (err) {
            console.error('Erro ao salvar subcategoria:', err);
            alert('Erro ao salvar subcategoria. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleExcluir = async (id: string) => {
        if (!await showConfirm({
            title: 'Excluir subcategoria',
            description: 'Tem certeza que deseja excluir esta subcategoria?',
            confirmLabel: 'Excluir',
            variant: 'danger',
        })) return;

        try {
            setDeleting(id);
            await categoriasDocService.excluirSubcategoria(id);
            await carregarSubcategorias();
            onSubcategoriasChanged?.();
        } catch (err) {
            console.error('Erro ao excluir subcategoria:', err);
            alert('Erro ao excluir subcategoria.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ListTree className="h-4 w-4" />
                    Gerenciar Subcategorias
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ListTree className="h-5 w-5" />
                        Subcategorias
                    </DialogTitle>
                    <DialogDescription>
                        Gerencie as subcategorias vinculadas a esta categoria.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
                    {/* Formulário de adicionar/editar */}
                    {mostrarForm ? (
                        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <h4 className="text-sm font-medium">
                                {editandoId ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                            </h4>
                            <div className="space-y-2">
                                <Label htmlFor="subcat-nome">
                                    Nome <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="subcat-nome"
                                    placeholder={codigoCategoria ? `Ex: ${codigoCategoria}.1. Dispensa - Em Razao do Valor` : 'Ex: Dispensa - Em Razao do Valor'}
                                    value={formNome}
                                    onChange={(e) => {
                                        setFormNome(stripNormativoCode(e.target.value));
                                        if (e.target.value.trim()) setErroNome('');
                                    }}
                                    className={erroNome ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {editandoId
                                        ? `Codigo preservado: ${extractNormativoCode(subcategorias.find((item) => item.id === editandoId)?.nome || '') || 'sem codigo'}`
                                        : `Proximo codigo: ${codigoCategoria ? `${codigoCategoria}.${subcategorias.length + 1}` : 'defina o codigo da categoria'}`}
                                </p>
                                {erroNome && <p className="text-xs text-red-500">{erroNome}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subcat-desc">Descrição (opcional)</Label>
                                <Input
                                    id="subcat-desc"
                                    placeholder="Descrição detalhada..."
                                    value={formDescricao}
                                    onChange={(e) => setFormDescricao(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" size="sm" onClick={limparForm} disabled={saving}>
                                    Cancelar
                                </Button>
                                <Button size="sm" onClick={handleSalvar} disabled={saving || !formNome.trim()}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full border-dashed flex items-center gap-2 text-muted-foreground hover:text-foreground"
                            onClick={iniciarNovo}
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar Nova Subcategoria
                        </Button>
                    )}

                    {/* Lista de Subcategorias */}
                    <div className="space-y-2 pt-2 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Subcategorias Cadastradas</h4>

                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : subcategorias.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4 bg-muted/20 rounded-lg">
                                Nenhuma subcategoria cadastrada para esta categoria.
                            </p>
                        ) : (
                            subcategorias.map((subcat) => (
                                <div
                                    key={subcat.id}
                                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors bg-card"
                                >
                                    <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                                        <span className="font-medium text-sm truncate">{subcat.nome}</span>
                                        {subcat.descricao && (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {subcat.descricao}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                            onClick={() => iniciarEdicao(subcat)}
                                            disabled={saving || deleting === subcat.id}
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                            onClick={() => handleExcluir(subcat.id)}
                                            disabled={saving || deleting === subcat.id}
                                            title="Excluir"
                                        >
                                            {deleting === subcat.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
