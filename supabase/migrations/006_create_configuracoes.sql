-- Create configuracoes table
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_instituicao VARCHAR(255) NOT NULL,
    sigla VARCHAR(50),
    cnpj VARCHAR(20),
    email_contato VARCHAR(255),
    telefone VARCHAR(20),
    
    -- JSONB columns for grouped settings
    tema JSONB DEFAULT '{"tema": "system", "corPrimaria": "#003366", "compacto": false}'::jsonb,
    notificacoes JSONB DEFAULT '{"emailTramitacao": true, "emailPrazo": true, "emailChamado": true, "pushBrowser": false, "resumoDiario": true}'::jsonb,
    integracoes JSONB DEFAULT '{"supabaseConectado": true, "iaHabilitada": true, "emailHabilitado": false}'::jsonb,
    
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON configuracoes
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
