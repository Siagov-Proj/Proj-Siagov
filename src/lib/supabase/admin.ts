import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com privilégios de Service Role (Admin)
 * USAR APENAS NO SERVIDOR (Server Actions, API Routes)
 * NUNCA expor no cliente (browser)
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Note: The variable name usually differs, sometimes SUPABASE_SERVICE_ROLE_KEY
    // I will use SUPABASE_SERVICE_ROLE_KEY as it's standard convention
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida no ambiente (.env.local)');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
