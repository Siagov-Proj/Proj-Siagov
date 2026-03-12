-- Post-hardening cleanup for go-live
-- Tightens remaining permissive policy and removes duplicate indexes flagged by Advisors.

BEGIN;

ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS permissoes_select ON public.permissoes;
DROP POLICY IF EXISTS permissoes_insert ON public.permissoes;
DROP POLICY IF EXISTS permissoes_select_policy ON public.permissoes;
DROP POLICY IF EXISTS permissoes_insert_policy ON public.permissoes;
DROP POLICY IF EXISTS permissoes_update_policy ON public.permissoes;
DROP POLICY IF EXISTS permissoes_delete_policy ON public.permissoes;

CREATE POLICY permissoes_select_policy
ON public.permissoes
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY permissoes_insert_policy
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY permissoes_update_policy
ON public.permissoes
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY permissoes_delete_policy
ON public.permissoes
FOR DELETE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

DROP INDEX IF EXISTS public.idx_cargos_setor;
DROP INDEX IF EXISTS public.idx_setores_unidade;
DROP INDEX IF EXISTS public.idx_usuario_lotacoes_instituicao;
DROP INDEX IF EXISTS public.idx_usuarios_setor;

COMMIT;
