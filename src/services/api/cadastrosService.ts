
import { getSupabaseClient } from '@/lib/supabase/client';

export interface IDashboardCounts {
    esferas: number;
    instituicoes: number;
    orgaos: number;
    unidades: number;
    setores: number;
    cargos: number;
    usuarios: number;
    credores: number;
    exercicios: number;
    bancos: number;
    agencias: number;
    normativos: number;
}

const initialCounts: IDashboardCounts = {
    esferas: 0,
    instituicoes: 0,
    orgaos: 0,
    unidades: 0,
    setores: 0,
    cargos: 0,
    usuarios: 0,
    credores: 0,
    exercicios: 0,
    bancos: 0,
    agencias: 0,
    normativos: 0
};

export const cadastrosService = {
    async getDashboardCounts(): Promise<IDashboardCounts> {
        const supabase = getSupabaseClient();

        try {
            const [
                esferas,
                instituicoes,
                orgaos,
                unidades,
                setores,
                cargos,
                usuarios,
                credores,
                exercicios,
                bancos,
                agencias,
                normativos
            ] = await Promise.all([
                supabase.from('esferas').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('instituicoes').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('orgaos').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('unidades_gestoras').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('setores').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('cargos').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('credores').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('exercicios_financeiros').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('bancos').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('agencias').select('*', { count: 'exact', head: true }).eq('excluido', false),
                supabase.from('categorias_documentos').select('*', { count: 'exact', head: true }).eq('excluido', false)
            ]);

            return {
                esferas: esferas.count || 0,
                instituicoes: instituicoes.count || 0,
                orgaos: orgaos.count || 0,
                unidades: unidades.count || 0,
                setores: setores.count || 0,
                cargos: cargos.count || 0,
                usuarios: usuarios.count || 0,
                credores: credores.count || 0,
                exercicios: exercicios.count || 0,
                bancos: bancos.count || 0,
                agencias: agencias.count || 0,
                normativos: normativos.count || 0
            };
        } catch (error) {
            console.error('Error fetching dashboard counts:', error);
            return initialCounts;
        }
    }
};
