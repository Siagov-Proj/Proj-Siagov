-- ================================================================
-- Migration 009: Tabela de Lotações de Usuários (Múltipla Lotação)
-- Permite que um usuário pertença a múltiplas instituições
-- ================================================================

CREATE TABLE IF NOT EXISTS usuario_lotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    instituicao_id UUID NOT NULL REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    cargo_id UUID REFERENCES cargos(id),
    ug_origem_id UUID REFERENCES unidades_gestoras(id),
    perfil_acesso TEXT DEFAULT 'consulta',
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_usuario ON usuario_lotacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_instituicao ON usuario_lotacoes(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_usuario_lotacoes_ativo ON usuario_lotacoes(usuario_id, ativo, excluido);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_usuario_lotacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_usuario_lotacoes_updated_at
    BEFORE UPDATE ON usuario_lotacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_usuario_lotacoes_updated_at();

-- RLS
ALTER TABLE usuario_lotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario_lotacoes_select" ON usuario_lotacoes
    FOR SELECT USING (true);

CREATE POLICY "usuario_lotacoes_insert" ON usuario_lotacoes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "usuario_lotacoes_update" ON usuario_lotacoes
    FOR UPDATE USING (true);

CREATE POLICY "usuario_lotacoes_delete" ON usuario_lotacoes
    FOR DELETE USING (true);

-- Migrar dados existentes da tabela usuarios para usuario_lotacoes
-- (para não perder os vínculos atuais)
INSERT INTO usuario_lotacoes (usuario_id, instituicao_id, orgao_id, unidade_gestora_id, setor_id, cargo_id, ug_origem_id, perfil_acesso, ativo)
SELECT 
    id,
    instituicao_id,
    orgao_id,
    unidade_gestora_id,
    setor_id,
    cargo_id,
    ug_origem_id,
    COALESCE(permissoes->>0, 'consulta'),
    ativo
FROM usuarios
WHERE instituicao_id IS NOT NULL
  AND excluido = false;
