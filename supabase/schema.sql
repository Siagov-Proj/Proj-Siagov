-- ============================================
-- SIAGOV - Estrutura de Tabelas para Supabase
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: Instituições
-- ============================================
CREATE TABLE IF NOT EXISTS instituicoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(3) NOT NULL UNIQUE,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    esfera VARCHAR(20) CHECK (esfera IN ('Federal', 'Estadual', 'Municipal', 'Distrital')),
    cnpj VARCHAR(18),
    email VARCHAR(100),
    codigo_siasg VARCHAR(6),
    cep VARCHAR(9),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    municipio VARCHAR(60),
    uf VARCHAR(2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Órgãos
-- ============================================
CREATE TABLE IF NOT EXISTS orgaos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(6) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id) ON DELETE CASCADE,
    poder_vinculado VARCHAR(20) NOT NULL CHECK (poder_vinculado IN ('Executivo', 'Legislativo', 'Judiciário')),
    nome VARCHAR(80) NOT NULL,
    sigla VARCHAR(10),
    cnpj VARCHAR(18),
    codigo_siasg VARCHAR(6),
    ug_tce VARCHAR(5),
    ug_siafem_sigef VARCHAR(6),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(codigo, instituicao_id)
);

-- ============================================
-- TABELA: Unidades Gestoras
-- ============================================
CREATE TABLE IF NOT EXISTS unidades_gestoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(6) NOT NULL,
    orgao_id UUID REFERENCES orgaos(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    cnpj VARCHAR(18),
    cep VARCHAR(9),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    uf VARCHAR(2),
    municipio VARCHAR(60),
    tipo_administracao VARCHAR(20) CHECK (tipo_administracao IN ('Direta', 'Indireta')),
    grupo_indireta VARCHAR(50),
    normativa_criacao VARCHAR(50),
    numero_diario_oficial VARCHAR(20),
    email_primario VARCHAR(100),
    email_secundario VARCHAR(100),
    telefone VARCHAR(15),
    ug_siafem_sigef VARCHAR(6),
    ug_tce VARCHAR(5),
    ug_siasg VARCHAR(6),
    tipo_unidade_gestora VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(codigo, orgao_id)
);

-- ============================================
-- TABELA: Setores
-- ============================================
CREATE TABLE IF NOT EXISTS setores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(3) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    email_primario VARCHAR(100),
    email_secundario VARCHAR(100),
    telefone_01 VARCHAR(15),
    telefone_02 VARCHAR(15),
    ramal VARCHAR(10),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Cargos
-- ============================================
CREATE TABLE IF NOT EXISTS cargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(3) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    nome VARCHAR(80) NOT NULL,
    inativo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Bancos
-- ============================================
CREATE TABLE IF NOT EXISTS bancos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(3) NOT NULL UNIQUE,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(20),
    cnpj VARCHAR(18),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Agências
-- ============================================
CREATE TABLE IF NOT EXISTS agencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    banco_id UUID REFERENCES bancos(id) ON DELETE CASCADE,
    codigo VARCHAR(10) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    cnpj VARCHAR(18),
    cnpj_unidade_gestora VARCHAR(18),
    praca VARCHAR(60),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(codigo, banco_id)
);

-- ============================================
-- TABELA: Credores
-- ============================================
CREATE TABLE IF NOT EXISTS credores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados Gerais
    tipo_credor VARCHAR(20) CHECK (tipo_credor IN ('Física', 'Jurídica')),
    cadastro_rfb VARCHAR(20),
    identificador VARCHAR(18) NOT NULL, -- CPF ou CNPJ
    natureza_juridica VARCHAR(100),
    nome VARCHAR(80) NOT NULL,
    nome_social VARCHAR(80),
    nome_fantasia VARCHAR(80),
    nit_pis_pasep VARCHAR(14),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    optante_simples BOOLEAN DEFAULT false,
    data_final_opcao_simples DATE,
    optante_cprb BOOLEAN DEFAULT false,
    data_final_opcao_cprb DATE,
    cpf_administrador VARCHAR(14),
    nome_administrador VARCHAR(80),
    
    -- Localização
    cep VARCHAR(9),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    caixa_postal VARCHAR(10),
    uf VARCHAR(2),
    municipio VARCHAR(60),
    ponto_referencia VARCHAR(100),
    
    -- Contato
    telefone_comercial VARCHAR(15),
    telefone_comercial2 VARCHAR(15),
    telefone_residencial VARCHAR(15),
    telefone_celular VARCHAR(15),
    email VARCHAR(100),
    email2 VARCHAR(100),
    site VARCHAR(100),
    
    -- Domicílio Bancário
    banco_id UUID REFERENCES bancos(id),
    agencia_id UUID REFERENCES agencias(id),
    conta_bancaria VARCHAR(20),
    tipo_conta_bancaria VARCHAR(20) CHECK (tipo_conta_bancaria IN ('Corrente', 'Poupança', 'Salário')),
    
    -- Informações Complementares
    porte_estabelecimento VARCHAR(50),
    data_abertura_cnpj DATE,
    situacao_cadastral VARCHAR(50),
    data_situacao_cadastral DATE,
    inativo BOOLEAN DEFAULT false,
    bloqueado BOOLEAN DEFAULT false,
    observacao TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Exercícios Financeiros
-- ============================================
CREATE TABLE IF NOT EXISTS exercicios_financeiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ano INTEGER NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id) ON DELETE CASCADE,
    data_abertura DATE NOT NULL,
    data_fechamento DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ano, instituicao_id)
);

-- ============================================
-- TABELA: Processos
-- ============================================
CREATE TABLE IF NOT EXISTS processos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    ano INTEGER,
    tipo VARCHAR(50) NOT NULL,
    assunto TEXT NOT NULL,
    interessado VARCHAR(100) NOT NULL,
    interessado_id UUID,
    data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prazo DATE,
    data_encerramento DATE,
    status VARCHAR(30) DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Andamento', 'Em Tramitação', 'Aguardando', 'Concluído', 'Arquivado', 'Cancelado')),
    prioridade VARCHAR(20) DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    setor_atual VARCHAR(100),
    setor_atual_id UUID REFERENCES setores(id),
    responsavel VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Tramitações
-- ============================================
CREATE TABLE IF NOT EXISTS tramitacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
    setor_origem_id UUID REFERENCES setores(id),
    setor_origem_nome VARCHAR(100),
    setor_destino_id UUID REFERENCES setores(id),
    setor_destino_nome VARCHAR(100),
    data_envio TIMESTAMPTZ,
    data_tramitacao TIMESTAMPTZ DEFAULT NOW(),
    data_recebimento TIMESTAMPTZ,
    despacho TEXT NOT NULL,
    usuario_envio_id UUID,
    usuario_recebimento_id UUID,
    responsavel VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Enviado' CHECK (status IN ('Enviado', 'Recebido', 'Concluído', 'Cancelado')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(3),
    instituicao_id UUID REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    cargo_id UUID REFERENCES cargos(id),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    nome VARCHAR(80) NOT NULL,
    nome_credor VARCHAR(80),
    matricula VARCHAR(20),
    vinculo VARCHAR(50),
    ug_origem VARCHAR(50),
    email_institucional VARCHAR(100),
    email_pessoal VARCHAR(100),
    telefone_01 VARCHAR(15),
    telefone_whatsapp VARCHAR(15),
    perfil_acesso VARCHAR(30) CHECK (perfil_acesso IN ('Administrador', 'Gestor', 'Operador', 'Consulta')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orgaos_instituicao ON orgaos(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_unidades_orgao ON unidades_gestoras(orgao_id);
CREATE INDEX IF NOT EXISTS idx_setores_unidade ON setores(unidade_gestora_id);
CREATE INDEX IF NOT EXISTS idx_cargos_setor ON cargos(setor_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero);
CREATE INDEX IF NOT EXISTS idx_tramitacoes_processo ON tramitacoes(processo_id);
CREATE INDEX IF NOT EXISTS idx_credores_identificador ON credores(identificador);
CREATE INDEX IF NOT EXISTS idx_exercicios_ano ON exercicios_financeiros(ano);

-- ============================================
-- TRIGGER: Atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ language 'plpgsql';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_gestoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE credores ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura para usuários autenticados)
-- NOTA: Ajuste conforme suas regras de negócio
CREATE POLICY "Allow read access for authenticated users" ON instituicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON orgaos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON unidades_gestoras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON setores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON cargos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON bancos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON agencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON credores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON exercicios_financeiros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON processos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON tramitacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON usuarios FOR SELECT TO authenticated USING (true);

-- Políticas de escrita (permitir para usuários autenticados - ajuste conforme necessário)
CREATE POLICY "Allow write access for authenticated users" ON instituicoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON orgaos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON unidades_gestoras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON setores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON cargos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON bancos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON agencias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON credores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON exercicios_financeiros FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON processos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON tramitacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow write access for authenticated users" ON usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
