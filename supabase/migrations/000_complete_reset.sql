-- ============================================
-- SIAGOV - COMPLETE RESET SCRIPT
-- This will DROP all tables and recreate them
-- Use with caution - all data will be lost!
-- ============================================

-- ============================================
-- STEP 1: DROP ALL TABLES (reverse order of dependencies)
-- ============================================
DROP TABLE IF EXISTS subcategorias_documentos CASCADE;
DROP TABLE IF EXISTS categorias_documentos CASCADE;
DROP TABLE IF EXISTS credores CASCADE;
DROP TABLE IF EXISTS exercicios_financeiros CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS agencias CASCADE;
DROP TABLE IF EXISTS bancos CASCADE;
DROP TABLE IF EXISTS cargos CASCADE;
DROP TABLE IF EXISTS setores CASCADE;
DROP TABLE IF EXISTS unidades_gestoras CASCADE;
DROP TABLE IF EXISTS orgaos CASCADE;
DROP TABLE IF EXISTS instituicoes CASCADE;
DROP TABLE IF EXISTS esferas CASCADE;

-- Drop the trigger function if exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ============================================
-- STEP 2: CREATE ALL TABLES
-- ============================================

-- 1. ESFERAS
CREATE TABLE esferas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla VARCHAR(10) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTITUICOES
CREATE TABLE instituicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    esfera_id UUID REFERENCES esferas(id),
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
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGAOS
CREATE TABLE orgaos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(6) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    poder_vinculado VARCHAR(20),
    nome VARCHAR(80) NOT NULL,
    sigla VARCHAR(10),
    cnpj VARCHAR(18),
    codigo_siasg VARCHAR(6),
    ug_tce VARCHAR(5),
    ug_siafem_sigef VARCHAR(6),
    nome_anterior VARCHAR(80),
    nome_abreviado_anterior VARCHAR(30),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. UNIDADES_GESTORAS
CREATE TABLE unidades_gestoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(6) NOT NULL,
    orgao_id UUID REFERENCES orgaos(id),
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
    tipo_administracao VARCHAR(20),
    grupo_indireta VARCHAR(50),
    normativa_criacao VARCHAR(50),
    numero_diario_oficial VARCHAR(20),
    ordenador_despesa VARCHAR(80),
    email_primario VARCHAR(100),
    email_secundario VARCHAR(100),
    telefone VARCHAR(15),
    ug_siafem_sigef VARCHAR(6),
    ug_tce VARCHAR(5),
    ug_siasg VARCHAR(6),
    tipo_unidade_gestora VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SETORES
CREATE TABLE setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(4) NOT NULL,
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
    responsavel VARCHAR(80),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARGOS
CREATE TABLE cargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(200),
    nivel VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BANCOS
CREATE TABLE bancos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(20),
    cnpj VARCHAR(18),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AGENCIAS
CREATE TABLE agencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banco_id UUID REFERENCES bancos(id),
    codigo_banco VARCHAR(3),
    codigo VARCHAR(10) NOT NULL,
    digito_verificador VARCHAR(2),
    nome VARCHAR(80) NOT NULL,
    nome_abreviado VARCHAR(30),
    cnpj VARCHAR(18),
    praca VARCHAR(60),
    gerente VARCHAR(60),
    cep VARCHAR(9),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    bairro VARCHAR(50),
    municipio VARCHAR(60),
    uf VARCHAR(2),
    telefone VARCHAR(15),
    email VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USUARIOS
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(3) NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    orgao_id UUID REFERENCES orgaos(id),
    unidade_gestora_id UUID REFERENCES unidades_gestoras(id),
    setor_id UUID REFERENCES setores(id),
    cargo_id UUID REFERENCES cargos(id),
    cpf VARCHAR(14) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    nome_credor VARCHAR(80),
    matricula VARCHAR(20),
    vinculo VARCHAR(50),
    ug_origem_id UUID REFERENCES unidades_gestoras(id),
    email_institucional VARCHAR(100),
    email_pessoal VARCHAR(100),
    telefone_01 VARCHAR(15),
    telefone_whatsapp VARCHAR(15),
    permissoes JSONB,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EXERCICIOS_FINANCEIROS
CREATE TABLE exercicios_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ano INTEGER NOT NULL,
    instituicao_id UUID REFERENCES instituicoes(id),
    data_abertura DATE,
    data_fechamento DATE,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CREDORES
CREATE TABLE credores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_credor VARCHAR(20),
    cadastro_rfb VARCHAR(50),
    identificador VARCHAR(18),
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
    rg VARCHAR(20),
    orgao_emissor_rg VARCHAR(20),
    data_emissao_rg DATE,
    cep VARCHAR(9),
    logradouro VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    caixa_postal VARCHAR(10),
    uf VARCHAR(2),
    municipio VARCHAR(60),
    ponto_referencia VARCHAR(100),
    telefone_comercial VARCHAR(15),
    telefone_comercial_2 VARCHAR(15),
    telefone_residencial VARCHAR(15),
    telefone_celular VARCHAR(15),
    email VARCHAR(100),
    email_2 VARCHAR(100),
    site VARCHAR(100),
    banco_id UUID REFERENCES bancos(id),
    agencia VARCHAR(10),
    agencia_id UUID REFERENCES agencias(id),
    digito_agencia VARCHAR(2),
    conta_bancaria VARCHAR(20),
    digito_conta VARCHAR(2),
    tipo_conta_bancaria VARCHAR(20),
    porte_estabelecimento VARCHAR(50),
    data_abertura_cnpj DATE,
    situacao_cadastral VARCHAR(50),
    data_situacao_cadastral DATE,
    inativo BOOLEAN DEFAULT false,
    bloqueado BOOLEAN DEFAULT false,
    observacao TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CATEGORIAS_DOCUMENTOS
CREATE TABLE categorias_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    lei VARCHAR(50),
    cor VARCHAR(7),
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subcategorias_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias_documentos(id),
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: SEED DATA
-- ============================================
INSERT INTO esferas (sigla, nome, descricao, ativo) VALUES
    ('FED', 'Federal', 'Órgãos e entidades da administração pública federal', true),
    ('EST', 'Estadual', 'Órgãos e entidades da administração pública estadual', true),
    ('MUN', 'Municipal', 'Órgãos e entidades da administração pública municipal', true),
    ('DIS', 'Distrital', 'Órgãos e entidades do Distrito Federal', true);

INSERT INTO bancos (codigo, nome, nome_abreviado, ativo) VALUES
    ('001', 'Banco do Brasil S.A.', 'BB', true),
    ('104', 'Caixa Econômica Federal', 'CEF', true),
    ('237', 'Banco Bradesco S.A.', 'BRADESCO', true),
    ('341', 'Itaú Unibanco S.A.', 'ITAU', true),
    ('033', 'Banco Santander Brasil S.A.', 'SANTANDER', true);

-- ============================================
-- STEP 4: INDEXES
-- ============================================
CREATE INDEX idx_instituicoes_esfera ON instituicoes(esfera_id);
CREATE INDEX idx_orgaos_instituicao ON orgaos(instituicao_id);
CREATE INDEX idx_unidades_orgao ON unidades_gestoras(orgao_id);
CREATE INDEX idx_setores_unidade ON setores(unidade_gestora_id);
CREATE INDEX idx_cargos_setor ON cargos(setor_id);
CREATE INDEX idx_agencias_banco ON agencias(banco_id);
CREATE INDEX idx_usuarios_setor ON usuarios(setor_id);
CREATE INDEX idx_exercicios_instituicao ON exercicios_financeiros(instituicao_id);
CREATE INDEX idx_subcategorias_categoria ON subcategorias_documentos(categoria_id);

CREATE INDEX idx_esferas_excluido ON esferas(excluido);
CREATE INDEX idx_instituicoes_excluido ON instituicoes(excluido);
CREATE INDEX idx_orgaos_excluido ON orgaos(excluido);
CREATE INDEX idx_unidades_excluido ON unidades_gestoras(excluido);
CREATE INDEX idx_setores_excluido ON setores(excluido);
CREATE INDEX idx_cargos_excluido ON cargos(excluido);
CREATE INDEX idx_bancos_excluido ON bancos(excluido);
CREATE INDEX idx_agencias_excluido ON agencias(excluido);
CREATE INDEX idx_usuarios_excluido ON usuarios(excluido);
CREATE INDEX idx_exercicios_excluido ON exercicios_financeiros(excluido);
CREATE INDEX idx_credores_excluido ON credores(excluido);
CREATE INDEX idx_categorias_doc_excluido ON categorias_documentos(excluido);

-- ============================================
-- STEP 5: TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
