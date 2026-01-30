-- ============================================
-- 5. CHAMADOS (Support Tickets)
-- ============================================

CREATE TABLE IF NOT EXISTS chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo VARCHAR(20) NOT NULL UNIQUE,
    assunto VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'Bug', 'Dúvida', 'Melhoria'
    status VARCHAR(50) DEFAULT 'Aberto', -- 'Aberto', 'Em Atendimento', 'Resolvido', 'Fechado'
    prioridade VARCHAR(20) DEFAULT 'Média', -- 'Baixa', 'Média', 'Alta'
    descricao TEXT, -- Main description of the issue
    criado_por VARCHAR(150), -- Display Name
    user_id UUID, -- Optional Link to Auth User
    sla_restante VARCHAR(50), -- Text for now, e.g. "2h"
    data_abertura TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing
CREATE INDEX idx_chamados_protocolo ON chamados(protocolo);
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_chamados_excluido ON chamados(excluido);

-- Messages Table for Chat
CREATE TABLE IF NOT EXISTS chamado_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID REFERENCES chamados(id),
    mensagem TEXT NOT NULL,
    autor VARCHAR(150),
    tipo VARCHAR(20) DEFAULT 'usuario', -- 'usuario', 'suporte', 'sistema'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chamado_mensagens_chamado ON chamado_mensagens(chamado_id);

-- Trigger for Updated At
CREATE TRIGGER update_chamados_updated_at BEFORE UPDATE ON chamados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
