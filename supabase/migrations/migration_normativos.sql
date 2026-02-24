-- ============================================================
-- Migration: Reestruturação do Módulo Normativos
-- Hierarquia: Lei > Título > Categorias > Subcategorias > Documentos
-- ============================================================

-- 1. Tabela de Leis Normativas
CREATE TABLE IF NOT EXISTS leis_normativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    excluido BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Tabela de Títulos Normativos (vinculados à Lei)
CREATE TABLE IF NOT EXISTS titulos_normativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lei_id UUID NOT NULL REFERENCES leis_normativas(id) ON DELETE RESTRICT,
    nome TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    excluido BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Adicionar coluna titulo_id na tabela categorias_documentos
ALTER TABLE categorias_documentos
    ADD COLUMN IF NOT EXISTS titulo_id UUID REFERENCES titulos_normativos(id) ON DELETE SET NULL;

-- 4. Tabela de relação N:N entre categorias e órgãos
CREATE TABLE IF NOT EXISTS categorias_orgaos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categorias_documentos(id) ON DELETE CASCADE,
    orgao_id UUID NOT NULL REFERENCES orgaos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(categoria_id, orgao_id)
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_titulos_normativos_lei_id ON titulos_normativos(lei_id);
CREATE INDEX IF NOT EXISTS idx_categorias_documentos_titulo_id ON categorias_documentos(titulo_id);
CREATE INDEX IF NOT EXISTS idx_categorias_orgaos_categoria_id ON categorias_orgaos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_categorias_orgaos_orgao_id ON categorias_orgaos(orgao_id);

-- 6. Trigger de updated_at para leis_normativas
CREATE OR REPLACE FUNCTION update_leis_normativas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leis_normativas_updated_at
    BEFORE UPDATE ON leis_normativas
    FOR EACH ROW
    EXECUTE FUNCTION update_leis_normativas_updated_at();

-- 7. Trigger de updated_at para titulos_normativos
CREATE OR REPLACE FUNCTION update_titulos_normativos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_titulos_normativos_updated_at
    BEFORE UPDATE ON titulos_normativos
    FOR EACH ROW
    EXECUTE FUNCTION update_titulos_normativos_updated_at();

-- 8. Habilitar RLS
ALTER TABLE leis_normativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos_normativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_orgaos ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS (permitir acesso autenticado)
CREATE POLICY "leis_normativas_select" ON leis_normativas FOR SELECT TO authenticated USING (true);
CREATE POLICY "leis_normativas_insert" ON leis_normativas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "leis_normativas_update" ON leis_normativas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "leis_normativas_delete" ON leis_normativas FOR DELETE TO authenticated USING (true);

CREATE POLICY "titulos_normativos_select" ON titulos_normativos FOR SELECT TO authenticated USING (true);
CREATE POLICY "titulos_normativos_insert" ON titulos_normativos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "titulos_normativos_update" ON titulos_normativos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "titulos_normativos_delete" ON titulos_normativos FOR DELETE TO authenticated USING (true);

CREATE POLICY "categorias_orgaos_select" ON categorias_orgaos FOR SELECT TO authenticated USING (true);
CREATE POLICY "categorias_orgaos_insert" ON categorias_orgaos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categorias_orgaos_update" ON categorias_orgaos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categorias_orgaos_delete" ON categorias_orgaos FOR DELETE TO authenticated USING (true);

-- 10. Inserir leis iniciais
INSERT INTO leis_normativas (nome, descricao, ativo) VALUES
    ('Lei 14.133/2021', 'Nova Lei de Licitações e Contratos Administrativos', true),
    ('Lei 8.666/93', 'Lei de Licitações e Contratos da Administração Pública', true),
    ('Lei 13.019/14', 'Marco Regulatório das Organizações da Sociedade Civil', true)
ON CONFLICT DO NOTHING;
