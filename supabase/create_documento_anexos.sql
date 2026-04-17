CREATE TABLE IF NOT EXISTS public.documento_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID REFERENCES public.documentos(id),
    nome VARCHAR(200) NOT NULL,
    tamanho VARCHAR(20),
    url VARCHAR(500),
    tipo_mime VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documento_anexos_documento_id 
ON public.documento_anexos(documento_id);

ALTER TABLE public.documento_anexos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documento_anexos_select" ON public.documento_anexos;
DROP POLICY IF EXISTS "documento_anexos_insert" ON public.documento_anexos;
DROP POLICY IF EXISTS "documento_anexos_update" ON public.documento_anexos;
DROP POLICY IF EXISTS "documento_anexos_delete" ON public.documento_anexos;

CREATE POLICY "documento_anexos_select" ON public.documento_anexos FOR SELECT TO authenticated USING (true);
CREATE POLICY "documento_anexos_insert" ON public.documento_anexos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "documento_anexos_update" ON public.documento_anexos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "documento_anexos_delete" ON public.documento_anexos FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS audit_documento_anexos ON public.documento_anexos;
CREATE TRIGGER audit_documento_anexos
AFTER INSERT OR UPDATE OR DELETE ON public.documento_anexos
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
