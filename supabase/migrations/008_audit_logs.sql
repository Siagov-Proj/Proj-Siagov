-- ============================================
-- SIAGOV - Supabase Migration Script
-- Audit Logs Table and Triggers
-- ============================================

-- 1. Create the Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying history by table and record quickly
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
-- Index for querying history by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
-- Index for ordering/filtering by date
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 2. Create the generic trigger function
-- This function extracts the JWT claims to find out which user made the change.
-- Supabase sets the 'request.jwt.claims' config variable which contains the user ID.
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Try to get the user ID from the Supabase JWT claims
    BEGIN
        current_user_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::UUID;
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::JSONB, current_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if there's an actual change (optional, but good practice to avoid empty updates)
        IF row_to_json(OLD)::jsonb IS DISTINCT FROM row_to_json(NEW)::jsonb THEN
            INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, current_user_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::JSONB, current_user_id);
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECUITY DEFINER ensures the function runs with the privileges of the creator
-- so it can always write to the audit_logs table, even if the user can't.

-- 3. Apply the trigger to relevant tables

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'esferas',
        'instituicoes',
        'orgaos',
        'unidades_gestoras',
        'setores',
        'cargos',
        'bancos',
        'agencias',
        'usuarios',
        'exercicios_financeiros',
        'credores',
        'categorias_documentos',
        'subcategorias_documentos'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS audit_%s ON %s', t, t);
        EXECUTE format('CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()', t, t);
    END LOOP;
END;
$$;
