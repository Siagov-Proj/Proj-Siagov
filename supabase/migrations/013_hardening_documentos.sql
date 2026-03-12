-- Hardening de documentos, auditoria e politicas

-- 1. Garantir unicidade de numero de documento entre registros ativos
CREATE UNIQUE INDEX IF NOT EXISTS idx_documentos_numero_unique_ativos
ON documentos (numero)
WHERE excluido = false AND numero IS NOT NULL;

-- 2. Garantir unicidade basica de codigos nos cadastros principais ativos
CREATE UNIQUE INDEX IF NOT EXISTS idx_instituicoes_codigo_unique_ativos
ON instituicoes (codigo)
WHERE excluido = false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orgaos_instituicao_codigo_unique_ativos
ON orgaos (instituicao_id, codigo)
WHERE excluido = false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unidades_orgao_codigo_unique_ativos
ON unidades_gestoras (orgao_id, codigo)
WHERE excluido = false;

-- 3. Cobrir anexos na auditoria
DROP TRIGGER IF EXISTS audit_documento_anexos ON documento_anexos;
CREATE TRIGGER audit_documento_anexos
AFTER INSERT OR UPDATE OR DELETE ON documento_anexos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 4. Endurecer policy de delete em documentos removendo confianca em user_metadata
DROP POLICY IF EXISTS "documentos_delete_policy" ON documentos;
CREATE POLICY "documentos_delete_policy"
ON documentos
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    ((auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true)
);
