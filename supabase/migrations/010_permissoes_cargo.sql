-- ================================================================
-- Migration 010: Permissões dinâmicas por Cargo
-- Tabela de permissões e tabela associativa cargo_permissao
-- ================================================================

-- Tabela de permissões (catálogo)
CREATE TABLE IF NOT EXISTS permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo TEXT NOT NULL,
    acao TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(modulo, acao)
);

-- Tabela associativa cargo ↔ permissão
CREATE TABLE IF NOT EXISTS cargo_permissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cargo_id, permissao_id)
);

CREATE INDEX IF NOT EXISTS idx_cargo_permissao_cargo ON cargo_permissao(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargo_permissao_permissao ON cargo_permissao(permissao_id);

-- RLS
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_permissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissoes_select" ON permissoes FOR SELECT USING (true);
CREATE POLICY "permissoes_insert" ON permissoes FOR INSERT WITH CHECK (true);

CREATE POLICY "cargo_permissao_select" ON cargo_permissao FOR SELECT USING (true);
CREATE POLICY "cargo_permissao_insert" ON cargo_permissao FOR INSERT WITH CHECK (true);
CREATE POLICY "cargo_permissao_update" ON cargo_permissao FOR UPDATE USING (true);
CREATE POLICY "cargo_permissao_delete" ON cargo_permissao FOR DELETE USING (true);

-- ================================================================
-- SEED: Permissões por módulo do SIAGOV
-- ================================================================

INSERT INTO permissoes (modulo, acao, descricao) VALUES
    -- Cadastros
    ('Cadastros', 'instituicoes.visualizar', 'Visualizar instituições'),
    ('Cadastros', 'instituicoes.criar', 'Criar instituições'),
    ('Cadastros', 'instituicoes.editar', 'Editar instituições'),
    ('Cadastros', 'instituicoes.excluir', 'Excluir instituições'),
    ('Cadastros', 'orgaos.visualizar', 'Visualizar órgãos'),
    ('Cadastros', 'orgaos.criar', 'Criar órgãos'),
    ('Cadastros', 'orgaos.editar', 'Editar órgãos'),
    ('Cadastros', 'orgaos.excluir', 'Excluir órgãos'),
    ('Cadastros', 'unidades.visualizar', 'Visualizar unidades gestoras'),
    ('Cadastros', 'unidades.criar', 'Criar unidades gestoras'),
    ('Cadastros', 'unidades.editar', 'Editar unidades gestoras'),
    ('Cadastros', 'unidades.excluir', 'Excluir unidades gestoras'),
    ('Cadastros', 'setores.visualizar', 'Visualizar setores'),
    ('Cadastros', 'setores.criar', 'Criar setores'),
    ('Cadastros', 'setores.editar', 'Editar setores'),
    ('Cadastros', 'setores.excluir', 'Excluir setores'),
    ('Cadastros', 'cargos.visualizar', 'Visualizar cargos'),
    ('Cadastros', 'cargos.criar', 'Criar cargos'),
    ('Cadastros', 'cargos.editar', 'Editar cargos'),
    ('Cadastros', 'cargos.excluir', 'Excluir cargos'),
    ('Cadastros', 'usuarios.visualizar', 'Visualizar usuários'),
    ('Cadastros', 'usuarios.criar', 'Criar usuários'),
    ('Cadastros', 'usuarios.editar', 'Editar usuários'),
    ('Cadastros', 'usuarios.excluir', 'Excluir usuários'),
    ('Cadastros', 'credores.visualizar', 'Visualizar credores'),
    ('Cadastros', 'credores.criar', 'Criar credores'),
    ('Cadastros', 'credores.editar', 'Editar credores'),
    ('Cadastros', 'credores.excluir', 'Excluir credores'),
    ('Cadastros', 'bancos.visualizar', 'Visualizar bancos'),
    ('Cadastros', 'bancos.criar', 'Criar bancos'),
    ('Cadastros', 'bancos.editar', 'Editar bancos'),
    ('Cadastros', 'bancos.excluir', 'Excluir bancos'),
    ('Cadastros', 'agencias.visualizar', 'Visualizar agências'),
    ('Cadastros', 'agencias.criar', 'Criar agências'),
    ('Cadastros', 'agencias.editar', 'Editar agências'),
    ('Cadastros', 'agencias.excluir', 'Excluir agências'),
    -- Processos
    ('Processos', 'processos.visualizar', 'Visualizar processos'),
    ('Processos', 'processos.criar', 'Criar processos'),
    ('Processos', 'processos.editar', 'Editar processos'),
    ('Processos', 'processos.tramitar', 'Tramitar processos'),
    ('Processos', 'processos.excluir', 'Excluir processos'),
    -- Documentos
    ('Documentos', 'documentos.visualizar', 'Visualizar documentos'),
    ('Documentos', 'documentos.criar', 'Criar documentos'),
    ('Documentos', 'documentos.editar', 'Editar documentos'),
    ('Documentos', 'documentos.excluir', 'Excluir documentos'),
    -- Relatórios
    ('Relatórios', 'relatorios.visualizar', 'Visualizar relatórios'),
    ('Relatórios', 'relatorios.exportar', 'Exportar relatórios'),
    -- Configurações
    ('Configurações', 'configuracoes.visualizar', 'Visualizar configurações'),
    ('Configurações', 'configuracoes.editar', 'Editar configurações'),
    -- Auditoria
    ('Auditoria', 'auditoria.visualizar', 'Visualizar logs de auditoria'),
    ('Auditoria', 'auditoria.exportar', 'Exportar logs de auditoria')
ON CONFLICT (modulo, acao) DO NOTHING;
