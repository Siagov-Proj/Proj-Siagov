-- Migration: 012_rls_admin_policies.sql
-- Description: Enable RLS on 'documentos' table and create policies for authenticated users and admins

-- Enable Row Level Security
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Policy: Select (Leitura)
-- Todos os usuários autenticados podem ver documentos
CREATE POLICY "documentos_select_policy"
ON documentos
FOR SELECT
TO authenticated
USING (true);

-- Policy: Insert (Criação)
-- Todos os usuários autenticados podem criar documentos
CREATE POLICY "documentos_insert_policy"
ON documentos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Update (Edição)
-- Todos os usuários autenticados podem editar os documentos
CREATE POLICY "documentos_update_policy"
ON documentos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Delete (Exclusao)
-- APENAS perfis com app_metadata->>'role' = 'admin' ou app_metadata->>'claims_admin' = true podem excluir
CREATE POLICY "documentos_delete_policy"
ON documentos
FOR DELETE
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR
    ((auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true)
);
