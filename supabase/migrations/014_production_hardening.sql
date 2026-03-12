-- Production hardening for go-live
-- Enables RLS on exposed tables, normalizes policies, fixes function search_path,
-- and adds missing foreign-key indexes reported by Supabase Advisors.

BEGIN;

DO $$
DECLARE
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'agencias',
        'audit_logs',
        'bancos',
        'cargo_permissao',
        'cargos',
        'categorias_documentos',
        'categorias_orgaos',
        'chamado_mensagens',
        'chamados',
        'configuracoes',
        'credores',
        'documento_anexos',
        'documento_historico',
        'documentos',
        'esferas',
        'exercicios_financeiros',
        'instituicoes',
        'leis_normativas',
        'ordenadores',
        'orgaos',
        'processos',
        'setores',
        'subcategorias_documentos',
        'titulos_normativos',
        'tramitacoes',
        'unidades_gestoras',
        'usuario_lotacoes',
        'usuarios'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

DO $$
DECLARE
    table_name text;
    policy_name text;
BEGIN
    FOR table_name, policy_name IN
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'agencias','audit_logs','bancos','cargo_permissao','cargos','categorias_documentos','categorias_orgaos',
            'chamado_mensagens','chamados','configuracoes','credores','documento_anexos','documento_historico',
            'documentos','esferas','exercicios_financeiros','instituicoes','leis_normativas','ordenadores','orgaos',
            'processos','setores','subcategorias_documentos','titulos_normativos','tramitacoes','unidades_gestoras',
            'usuario_lotacoes','usuarios'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    END LOOP;
END $$;

-- Standard authenticated CRUD policies for operational tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'agencias',
        'bancos',
        'cargo_permissao',
        'cargos',
        'categorias_documentos',
        'categorias_orgaos',
        'chamado_mensagens',
        'chamados',
        'configuracoes',
        'credores',
        'documento_anexos',
        'esferas',
        'exercicios_financeiros',
        'instituicoes',
        'leis_normativas',
        'ordenadores',
        'orgaos',
        'processos',
        'setores',
        'subcategorias_documentos',
        'titulos_normativos',
        'tramitacoes',
        'unidades_gestoras',
        'usuario_lotacoes',
        'usuarios'
    ] LOOP
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ((SELECT auth.role()) = ''authenticated'')',
            table_name || '_select_policy', table_name
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT auth.role()) = ''authenticated'')',
            table_name || '_insert_policy', table_name
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((SELECT auth.role()) = ''authenticated'') WITH CHECK ((SELECT auth.role()) = ''authenticated'')',
            table_name || '_update_policy', table_name
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((SELECT auth.role()) = ''authenticated'')',
            table_name || '_delete_policy', table_name
        );
    END LOOP;
END $$;

-- audit_logs should be read-only from the client side
CREATE POLICY audit_logs_select_policy
ON public.audit_logs
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

-- documento_historico is written by app flow and read by authenticated users
CREATE POLICY documento_historico_select_policy
ON public.documento_historico
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY documento_historico_insert_policy
ON public.documento_historico
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- documentos has custom delete restriction for admins only
CREATE POLICY documentos_select_policy
ON public.documentos
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY documentos_insert_policy
ON public.documentos
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY documentos_update_policy
ON public.documentos
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY documentos_delete_policy
ON public.documentos
FOR DELETE
TO authenticated
USING (
    ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
    OR COALESCE((((SELECT auth.jwt()) -> 'app_metadata' ->> 'claims_admin'))::boolean, false)
);

ALTER FUNCTION public.audit_trigger_function() SET search_path = public, auth, extensions;
ALTER FUNCTION public.gerar_codigo_documento(uuid) SET search_path = public, auth, extensions;
ALTER FUNCTION public.gerar_codigo_sequencial(text, integer, text, uuid) SET search_path = public, auth, extensions;
ALTER FUNCTION public.update_leis_normativas_updated_at() SET search_path = public, auth, extensions;
ALTER FUNCTION public.update_titulos_normativos_updated_at() SET search_path = public, auth, extensions;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, auth, extensions;
ALTER FUNCTION public.update_usuario_lotacoes_updated_at() SET search_path = public, auth, extensions;

CREATE INDEX IF NOT EXISTS idx_cargos_instituicao_id ON public.cargos (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_cargos_orgao_id ON public.cargos (orgao_id);
CREATE INDEX IF NOT EXISTS idx_cargos_setor_id ON public.cargos (setor_id);
CREATE INDEX IF NOT EXISTS idx_cargos_unidade_gestora_id ON public.cargos (unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_credores_agencia_id ON public.credores (agencia_id);
CREATE INDEX IF NOT EXISTS idx_credores_banco_id ON public.credores (banco_id);
CREATE INDEX IF NOT EXISTS idx_documentos_processo_id ON public.documentos (processo_id);
CREATE INDEX IF NOT EXISTS idx_ordenadores_unidade_gestora_id ON public.ordenadores (unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_setores_instituicao_id ON public.setores (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_setores_orgao_id ON public.setores (orgao_id);
CREATE INDEX IF NOT EXISTS idx_setores_unidade_gestora_id ON public.setores (unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_cargo_id ON public.usuario_lotacoes (cargo_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_instituicao_id ON public.usuario_lotacoes (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_orgao_id ON public.usuario_lotacoes (orgao_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_setor_id ON public.usuario_lotacoes (setor_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_ug_origem_id ON public.usuario_lotacoes (ug_origem_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_unidade_gestora_id ON public.usuario_lotacoes (unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cargo_id ON public.usuarios (cargo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_instituicao_id ON public.usuarios (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_orgao_id ON public.usuarios (orgao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_setor_id ON public.usuarios (setor_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ug_origem_id ON public.usuarios (ug_origem_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_unidade_gestora_id ON public.usuarios (unidade_gestora_id);

COMMIT;
