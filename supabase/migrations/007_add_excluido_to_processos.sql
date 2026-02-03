-- Add excluido column to processos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'processos'
        AND column_name = 'excluido'
    ) THEN
        ALTER TABLE processos ADD COLUMN excluido BOOLEAN DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_processos_excluido ON processos(excluido);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'processos'
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE processos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;
