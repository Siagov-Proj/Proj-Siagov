-- ============================================
-- SIAGOV - Supabase Migration Script
-- Cadastros Tables with Soft Delete Support
-- Execute each section separately if needed
-- ============================================

-- ============================================
-- 1. ESFERAS
-- ============================================
CREATE TABLE IF NOT EXISTS esferas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla VARCHAR(10) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INSTITUICOES
-- ============================================
CREATE TABLE IF NOT EXISTS instituicoes (
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

-- ============================================
-- 3. ORGAOS
-- ============================================
CREATE TABLE IF NOT EXISTS orgaos (
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

-- ============================================
-- 4. UNIDADES_GESTORAS
-- ============================================
CREATE TABLE IF NOT EXISTS unidades_gestoras (
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

-- ============================================
-- 5. SETORES
-- ============================================
CREATE TABLE IF NOT EXISTS setores (
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

-- ============================================
-- 6. CARGOS
-- ============================================
CREATE TABLE IF NOT EXISTS cargos (
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

-- ============================================
-- 7. BANCOS
-- ============================================
CREATE TABLE IF NOT EXISTS bancos (
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

-- ============================================
-- 8. AGENCIAS
-- ============================================
CREATE TABLE IF NOT EXISTS agencias (
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

-- ============================================
-- 9. USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
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

-- ============================================
-- 10. EXERCICIOS_FINANCEIROS
-- ============================================
CREATE TABLE IF NOT EXISTS exercicios_financeiros (
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

-- ============================================
-- 11. CREDORES
-- ============================================
CREATE TABLE IF NOT EXISTS credores (
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

-- ============================================
-- 12. CATEGORIAS_DOCUMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_documentos (
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

CREATE TABLE IF NOT EXISTS subcategorias_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias_documentos(id),
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
