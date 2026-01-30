
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    });
} catch (e) {
    console.warn('.env.local not found');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Note: Requires SERVICE_ROLE_KEY to create auth users.
// If not available in env, we might fail. 
// Standard Supabase local dev uses a known service key or we can try to use standard key but likely permission denied.

if (!supabaseUrl) {
    console.error('Missing Supabase URL');
    process.exit(1);
}

// Fallback for local development if service key is missing
const SERVICE_KEY = supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYWdvdi1uZXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.FIXME_IF_NEEDED';
// !!! THE ABOVE IS A PLACEHOLDER. User likely has it in env or we can't create users programmatically.
// Actually, 'npx supabase status' gives the key. But I cannot run interactive commands easily.
// I will try to use the ANON KEY with signUp.

const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function seedUser() {
    console.log('--- SEEDING AUTH USER ---');

    const CPF = '123.456.789-00';
    const EMAIL = 'admin@siagov.com';
    const PASS = '123456';

    // 1. Sign Up (Auth)
    console.log('1. Creating Auth User...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: EMAIL,
        password: PASS,
    });

    if (authError) {
        console.log('   > Auth User might already exist:', authError.message);
    } else {
        console.log('   > Auth User Created:', authData.user?.id);
    }

    // Login to get session to perform inserts (if RLS enabled)
    // Or we just insert into public.usuarios if RLS allows anon (it shouldn't).
    // Let's rely on the migration logic or 'signUp' might have auto-confirmed in local.

    // 2. Insert into Public Usuarios
    // We need the User ID.
    // If we just signed up, we have it. If error, we need to sign in to get it.

    let userId = authData.user?.id;
    if (!userId) {
        const { data: loginData } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASS });
        userId = loginData.user?.id;
    }

    if (!userId) {
        console.error('   > Critical: Could not get User ID.');
        return;
    }

    console.log('2. Syncing Public User Profile...');

    // Check if exists
    const { data: existing } = await supabase.from('usuarios').select('id').eq('cpf', CPF).maybeSingle();

    if (existing) {
        console.log('   > Public User already exists.');
        // Update linkage just in case
        // await supabase.from('usuarios').update({ id: userId }).eq('cpf', CPF); // Only if ID matches auth
    } else {
        const { error: insertError } = await supabase.from('usuarios').insert({
            id: userId, // Link to Auth
            cpf: CPF,
            nome: 'Administrador Sistema',
            email_institucional: EMAIL,
            codigo: '001',
            ativo: true
        });

        if (insertError) {
            console.error('   > Error creating public profile:', insertError.message);
        } else {
            console.log('   > Public Profile Created.');
        }
    }
}

seedUser();
