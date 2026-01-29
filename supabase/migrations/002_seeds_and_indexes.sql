-- ============================================
-- SIAGOV - Seed Data and Indexes
-- Run AFTER 001_tables.sql
-- ============================================

-- ============================================
-- SEED DATA - ESFERAS
-- ============================================
INSERT INTO esferas (sigla, nome, descricao, ativo) VALUES
    ('FED', 'Federal', 'Órgãos e entidades da administração pública federal', true),
    ('EST', 'Estadual', 'Órgãos e entidades da administração pública estadual', true),
    ('MUN', 'Municipal', 'Órgãos e entidades da administração pública municipal', true),
    ('DIS', 'Distrital', 'Órgãos e entidades do Distrito Federal', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA - BANCOS
-- ============================================
INSERT INTO bancos (codigo, nome, nome_abreviado, ativo) VALUES
    ('001', 'Banco do Brasil S.A.', 'BB', true),
    ('104', 'Caixa Econômica Federal', 'CEF', true),
    ('237', 'Banco Bradesco S.A.', 'BRADESCO', true),
    ('341', 'Itaú Unibanco S.A.', 'ITAU', true),
    ('033', 'Banco Santander Brasil S.A.', 'SANTANDER', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_instituicoes_esfera ON instituicoes(esfera_id);
CREATE INDEX IF NOT EXISTS idx_orgaos_instituicao ON orgaos(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_unidades_orgao ON unidades_gestoras(orgao_id);
CREATE INDEX IF NOT EXISTS idx_setores_unidade ON setores(unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_cargos_setor ON cargos(setor_id);
CREATE INDEX IF NOT EXISTS idx_agencias_banco ON agencias(banco_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_setor ON usuarios(setor_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_instituicao ON exercicios_financeiros(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_subcategorias_categoria ON subcategorias_documentos(categoria_id);

-- Indexes for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_esferas_excluido ON esferas(excluido);
CREATE INDEX IF NOT EXISTS idx_instituicoes_excluido ON instituicoes(excluido);
CREATE INDEX IF NOT EXISTS idx_orgaos_excluido ON orgaos(excluido);
CREATE INDEX IF NOT EXISTS idx_unidades_excluido ON unidades_gestoras(excluido);
CREATE INDEX IF NOT EXISTS idx_setores_excluido ON setores(excluido);
CREATE INDEX IF NOT EXISTS idx_cargos_excluido ON cargos(excluido);
CREATE INDEX IF NOT EXISTS idx_bancos_excluido ON bancos(excluido);
CREATE INDEX IF NOT EXISTS idx_agencias_excluido ON agencias(excluido);
CREATE INDEX IF NOT EXISTS idx_usuarios_excluido ON usuarios(excluido);
CREATE INDEX IF NOT EXISTS idx_exercicios_excluido ON exercicios_financeiros(excluido);
CREATE INDEX IF NOT EXISTS idx_credores_excluido ON credores(excluido);
CREATE INDEX IF NOT EXISTS idx_categorias_doc_excluido ON categorias_documentos(excluido);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_esferas_updated_at BEFORE UPDATE ON esferas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instituicoes_updated_at BEFORE UPDATE ON instituicoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orgaos_updated_at BEFORE UPDATE ON orgaos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unidades_gestoras_updated_at BEFORE UPDATE ON unidades_gestoras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON setores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cargos_updated_at BEFORE UPDATE ON cargos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bancos_updated_at BEFORE UPDATE ON bancos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencias_updated_at BEFORE UPDATE ON agencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercicios_financeiros_updated_at BEFORE UPDATE ON exercicios_financeiros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credores_updated_at BEFORE UPDATE ON credores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_documentos_updated_at BEFORE UPDATE ON categorias_documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategorias_documentos_updated_at BEFORE UPDATE ON subcategorias_documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
