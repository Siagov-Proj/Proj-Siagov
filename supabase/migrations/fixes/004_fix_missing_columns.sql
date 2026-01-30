-- ============================================
-- FIX: ADD MISSING COLUMNS TO DOCUMENTOS
-- ============================================

-- Add 'ativo' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'ativo') THEN
        ALTER TABLE documentos ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add 'excluido' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'excluido') THEN
        ALTER TABLE documentos ADD COLUMN excluido BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing records to have defaults
UPDATE documentos SET ativo = true WHERE ativo IS NULL;
UPDATE documentos SET excluido = false WHERE excluido IS NULL;

-- Create index for performance on soft deletes
CREATE INDEX IF NOT EXISTS idx_documentos_excluido ON documentos(excluido);
