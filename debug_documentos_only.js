
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually load .env.local
try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');

    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log('Could not load .env.local', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Testing documentos table...');
    const { data, error } = await supabase
        .from('documentos')
        .select('excluido')
        .limit(1);

    if (error) {
        console.error('Error in documentos:', JSON.stringify(error, null, 2));
    } else {
        console.log('Success in documentos: Column exists.');
    }
}

run();
