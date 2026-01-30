-- ============================================
-- SIAGOV - Operational Tables (Processos & Documentos)
-- ============================================

-- 1. PROCESSOS
CREATE TABLE IF NOT EXISTS processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    assunto VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    interessado_id UUID, -- Link to generic interested party (Person/Company/Internal)
    interessado_nome VARCHAR(100), -- Denormalized for display
    status VARCHAR(50) DEFAULT 'Em Andamento',
    prioridade VARCHAR(20) DEFAULT 'Normal',
    setor_atual_id UUID REFERENCES setores(id),
    data_abertura TIMESTAMPTZ DEFAULT NOW(),
    data_prazo TIMESTAMPTZ,
    data_encerramento TIMESTAMPTZ,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_processos_numero ON processos(numero);
CREATE INDEX idx_processos_status ON processos(status);
CREATE INDEX idx_processos_setor ON processos(setor_atual_id);
CREATE INDEX idx_processos_excluido ON processos(excluido);

-- 2. DOCUMENTOS
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(20), -- Optional: Generated or sequential
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria_id UUID REFERENCES categorias_documentos(id),
    subcategoria_id UUID REFERENCES subcategorias_documentos(id),
    lei VARCHAR(100),
    processo_id UUID REFERENCES processos(id),
    especialista_id VARCHAR(50), -- ID from AI Specialist/fixed list
    objetivo TEXT,
    contexto TEXT,
    conteudo TEXT, -- Generated content (Markdown/HTML)
    tokens_utilizados INTEGER DEFAULT 0,
    versao INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Rascunho', -- Rascunho, Em Revisão, Concluído
    criado_por UUID, -- User ID (Supabase Auth)
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documentos_processo ON documentos(processo_id);
CREATE INDEX idx_documentos_categoria ON documentos(categoria_id);
CREATE INDEX idx_documentos_status ON documentos(status);
CREATE INDEX idx_documentos_excluido ON documentos(excluido);

-- 3. DOCUMENTO_ANEXOS (Attachments)
CREATE TABLE IF NOT EXISTS documento_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID REFERENCES documentos(id),
    nome VARCHAR(200) NOT NULL,
    tamanho VARCHAR(20),
    url VARCHAR(500), -- Supabase Storage URL
    tipo_mime VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENTO_HISTORICO
CREATE TABLE IF NOT EXISTS documento_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID REFERENCES documentos(id),
    acao VARCHAR(100) NOT NULL,
    usuario_id UUID, -- Metadata or FK to auth
    usuario_nome VARCHAR(100),
    detalhes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCUMENTO_VERSOES
CREATE TABLE IF NOT EXISTS documento_versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID REFERENCES documentos(id),
    versao INTEGER NOT NULL,
    conteudo TEXT,
    descricao VARCHAR(200),
    usuario_nome VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON processos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
