
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

// Need SERVICE_ROLE_KEY to bypass email confirmation or update user
// Try to grab it from env or use known local default
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing. Cannot admin-confirm user.');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
);

async function confirmUser() {
    console.log('--- CONFIRMING USER admin@siagov.com ---');

    // 1. Get User ID (Admin API)
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('List Users Error:', listError);
        return;
    }

    const output = list.users.find(u => u.email === 'admin@siagov.com');
    if (!output) {
        console.error('User not found.');
        return;
    }

    console.log(`Found User: ${output.id}. Confirmed At: ${output.email_confirmed_at}`);

    if (output.email_confirmed_at) {
        console.log('User already confirmed.');
        return;
    }

    // 2. Update User
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        output.id,
        { email_confirm: true }
    );

    if (updateError) {
        console.error('Update Error:', updateError);
    } else {
        console.log('User successfully confirmed!');
    }
}

confirmUser();
