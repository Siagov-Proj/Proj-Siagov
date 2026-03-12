-- Create missing operational tables required by the app when provisioning a new branch.

BEGIN;

CREATE TABLE IF NOT EXISTS public.tramitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    setor_origem_id UUID REFERENCES public.setores(id),
    setor_origem_nome VARCHAR(100),
    setor_destino_id UUID REFERENCES public.setores(id),
    setor_destino_nome VARCHAR(100),
    data_envio TIMESTAMPTZ,
    data_tramitacao TIMESTAMPTZ DEFAULT NOW(),
    data_recebimento TIMESTAMPTZ,
    despacho TEXT NOT NULL,
    usuario_envio_id UUID,
    usuario_recebimento_id UUID,
    responsavel VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Enviado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tramitacoes_processo ON public.tramitacoes(processo_id);

ALTER TABLE public.tramitacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tramitacoes_select_policy ON public.tramitacoes;
DROP POLICY IF EXISTS tramitacoes_insert_policy ON public.tramitacoes;
DROP POLICY IF EXISTS tramitacoes_update_policy ON public.tramitacoes;
DROP POLICY IF EXISTS tramitacoes_delete_policy ON public.tramitacoes;

CREATE POLICY tramitacoes_select_policy
ON public.tramitacoes
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY tramitacoes_insert_policy
ON public.tramitacoes
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY tramitacoes_update_policy
ON public.tramitacoes
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY tramitacoes_delete_policy
ON public.tramitacoes
FOR DELETE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE TABLE IF NOT EXISTS public.ordenadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_gestora_id UUID NOT NULL REFERENCES public.unidades_gestoras(id) ON DELETE CASCADE,
    codigo_credor VARCHAR(30) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    cargo VARCHAR(120),
    data_nomeacao DATE,
    ato_nomeacao VARCHAR(150),
    numero_diario_oficial_nomeacao VARCHAR(50),
    data_publicacao_nomeacao DATE,
    data_exoneracao DATE,
    ato_exoneracao VARCHAR(150),
    numero_diario_oficial_exoneracao VARCHAR(50),
    data_publicacao_exoneracao DATE,
    ativo BOOLEAN DEFAULT true,
    excluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenadores_unidade_gestora_id ON public.ordenadores(unidade_gestora_id);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname = 'update_updated_at_column') THEN
        EXECUTE 'DROP TRIGGER IF EXISTS update_ordenadores_updated_at ON public.ordenadores';
        EXECUTE 'CREATE TRIGGER update_ordenadores_updated_at BEFORE UPDATE ON public.ordenadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
    END IF;
END $$;

ALTER TABLE public.ordenadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ordenadores_select_policy ON public.ordenadores;
DROP POLICY IF EXISTS ordenadores_insert_policy ON public.ordenadores;
DROP POLICY IF EXISTS ordenadores_update_policy ON public.ordenadores;
DROP POLICY IF EXISTS ordenadores_delete_policy ON public.ordenadores;

CREATE POLICY ordenadores_select_policy
ON public.ordenadores
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY ordenadores_insert_policy
ON public.ordenadores
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY ordenadores_update_policy
ON public.ordenadores
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY ordenadores_delete_policy
ON public.ordenadores
FOR DELETE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

COMMIT;
