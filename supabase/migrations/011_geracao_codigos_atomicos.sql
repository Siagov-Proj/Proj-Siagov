-- Migration PL/pgSQL para Geração Atômica de Códigos e Resolução de Race Conditions
-- Criação de funções RPC acessíveis pelo frontend usando pg_advisory_xact_lock

-- =========================================================================
-- 1. Função Genérica para Códigos de Entidades do Cadastro
-- =========================================================================
CREATE OR REPLACE FUNCTION gerar_codigo_sequencial(
    p_tabela TEXT,
    p_tamanho INT,
    p_campo_pai TEXT DEFAULT NULL,
    p_id_pai UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_lock_id bigint;
    v_query TEXT;
    v_count INT;
    v_max_codigo_int INT;
BEGIN
    -- Obter lock específico para a tabela e, se houver, o registro pai.
    -- pg_advisory_xact_lock garantirá que outras transações simultâneas de insert/geração aguardem esta terminar.
    v_lock_id := hashtext(p_tabela || COALESCE(p_id_pai::text, ''));
    PERFORM pg_advisory_xact_lock(v_lock_id);
    
    -- Busca o maior código numérico válido na coluna 'codigo'. 
    -- Regex remove os não dígitos e NULLIF protege de cast de string vazia
    v_query := 'SELECT MAX(NULLIF(regexp_replace(codigo, ''\D'', '''', ''g''), '''')::int) FROM ' || quote_ident(p_tabela);
    
    -- Verifica se a tabela possui a coluna 'excluido' para filtrar registros deletados
    SELECT count(*) INTO v_count
    FROM information_schema.columns 
    WHERE table_name = p_tabela AND column_name = 'excluido';
    
    IF v_count > 0 THEN
        v_query := v_query || ' WHERE excluido = false';
    ELSE
        v_query := v_query || ' WHERE 1=1';
    END IF;

    -- Filtro por entidade pai (ex: orgao_id), se fornecido
    IF p_campo_pai IS NOT NULL AND p_id_pai IS NOT NULL THEN
        v_query := v_query || format(' AND %I = %L', p_campo_pai, p_id_pai);
    END IF;

    -- Executa a string dinâmica e guarda o resultado
    EXECUTE v_query INTO v_max_codigo_int;
    
    IF v_max_codigo_int IS NULL THEN
        v_max_codigo_int := 0;
    END IF;
    
    -- Retorna o número incrementado com o preenchimento de zeros à esquerda (padStart)
    RETURN lpad((v_max_codigo_int + 1)::text, p_tamanho, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- 2. Função Específica para Geração Hierárquica de Código de Documentos
-- =========================================================================
CREATE OR REPLACE FUNCTION gerar_codigo_documento(p_subcategoria_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_prefixo TEXT;
    v_lock_id bigint;
    v_count INT;
    v_codigo_subcategoria TEXT;
    v_nome_subcategoria TEXT;
    v_has_excluido INT;
BEGIN
    -- Obter lock específico para a subcategoria dos documentos.
    v_lock_id := hashtext('documentos_' || p_subcategoria_id::text);
    PERFORM pg_advisory_xact_lock(v_lock_id);

    -- Buscar prefixo numérico a partir da tabela subcategorias_documentos
    BEGIN
        SELECT nome, codigo INTO v_nome_subcategoria, v_codigo_subcategoria
        FROM subcategorias_documentos 
        WHERE id = p_subcategoria_id;
    EXCEPTION WHEN OTHERS THEN
        v_nome_subcategoria := NULL;
        v_codigo_subcategoria := NULL;
    END;

    -- Define o prefixo hierárquico
    IF v_codigo_subcategoria IS NOT NULL AND v_codigo_subcategoria != '' THEN
        v_prefixo := v_codigo_subcategoria;
    ELSIF v_nome_subcategoria ~ '^(\d+(?:\.\d+)*)\.' THEN
        v_prefixo := substring(v_nome_subcategoria from '^(\d+(?:\.\d+)*)\.');
    END IF;

    -- Contar documentos já registrados na subcategoria escolhida
    -- Verifica prevendo caso a coluna excluido não exista no projeto ainda
    SELECT count(*) INTO v_has_excluido
    FROM information_schema.columns 
    WHERE table_name = 'documentos' AND column_name = 'excluido';

    IF v_has_excluido > 0 THEN
        EXECUTE 'SELECT count(*) FROM documentos WHERE subcategoria_id = $1 AND excluido = false'
        INTO v_count USING p_subcategoria_id;
    ELSE
        SELECT count(*) INTO v_count
        FROM documentos
        WHERE subcategoria_id = p_subcategoria_id;
    END IF;

    -- Retorna seguindo a convenção ex: "4.1.2."
    IF v_prefixo IS NOT NULL THEN
        RETURN v_prefixo || '.' || (v_count + 1)::text || '.';
    ELSE
        RETURN (v_count + 1)::text;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
