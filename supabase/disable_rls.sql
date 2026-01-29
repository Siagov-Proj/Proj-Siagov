-- ============================================
-- SIAGOV - Desabilitar Row Level Security (RLS)
-- ============================================
-- Execute este script no SQL Editor do Supabase para
-- remover as restrições de acesso de todas as tabelas.
-- ATENÇÃO: Isso torna todas as tabelas públicas para leitura/escrita
-- se a chave ANON for usada sem políticas, mas facilita o desenvolvimento.

ALTER TABLE instituicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos DISABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_gestoras DISABLE ROW LEVEL SECURITY;
ALTER TABLE setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE cargos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bancos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE credores DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_financeiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tramitacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Opcional: Remover as políticas criadas anteriormente (para limpeza)
-- DROP POLICY IF EXISTS "Allow read access for authenticated users" ON instituicoes;
-- DROP POLICY IF EXISTS "Allow write access for authenticated users" ON instituicoes;
-- (Repetir para outras tabelas se necessário, mas o DISABLE RLS já é suficiente para ignorá-las)
