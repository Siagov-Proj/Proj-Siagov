
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

async function testTable(tableName) {
    console.log(`Testing table: ${tableName}...`);
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('excluido', false)
        .limit(1);

    if (error) {
        console.error(`Error in ${tableName}:`, JSON.stringify(error, null, 2));
    } else {
        console.log(`Success in ${tableName}.`);
    }
}

async function run() {
    await testTable('documentos');
    await testTable('categorias_documentos');
    await testTable('subcategorias_documentos');
    await testTable('processos');
}

run();
