import { createClient } from '@/lib/supabase/client';

export interface IAuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: any | null;
    new_data: any | null;
    changed_by: string | null;
    created_at: string;
    usuario?: {
        nome: string;
        email: string;
    };
}

class AuditService {
    private get supabase() {
        return createClient();
    }

    /**
     * Busca os logs de auditoria de uma determinada tabela.
     * @param tableName Nome da tabela no banco de dados
     * @param recordId (Opcional) ID específico do registro para filtrar
     */
    async listarLogs(tableName: string, recordId?: string): Promise<IAuditLog[]> {
        let query = this.supabase
            .from('audit_logs')
            .select('*')
            .eq('table_name', tableName)
            .order('created_at', { ascending: false });

        if (recordId) {
            query = query.eq('record_id', recordId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar logs de auditoria:', error);
            throw new Error(`Erro ao carregar o histórico: ${error.message}`);
        }

        return (data || []) as IAuditLog[];
    }

    /**
     * Busca todos os logs de auditoria do sistema, com paginação.
     * @param limit Número máximo de registros a retornar
     * @param offset Número de registros para pular
     * @param filters Filtros opcionais (tabela, ação, usuário)
     */
    async listarTodosLogs(
        limit = 100,
        offset = 0,
        filters?: { tableName?: string; action?: string; userId?: string }
    ): Promise<IAuditLog[]> {
        let query = this.supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (filters?.tableName && filters.tableName !== 'all') {
            query = query.eq('table_name', filters.tableName);
        }
        if (filters?.action && filters.action !== 'all') {
            query = query.eq('action', filters.action);
        }
        if (filters?.userId) {
            query = query.eq('changed_by', filters.userId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar todos os logs:', error);
            throw new Error(`Erro ao carregar os logs do sistema: ${error.message}`);
        }

        return (data || []) as IAuditLog[];
    }
}

export const auditService = new AuditService();

