
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- Manual Env Loading ---
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('.env.local not found');
    process.exit(1);
}

const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Test Script ---

async function runTest() {
    console.log('--- Starting Documentos Module Integration Test ---');

    // 1. Setup Data - Category
    console.log('1. Setting up Category...');
    const catPayload = {
        nome: `Categoria Teste ${Date.now()}`,
        lei: 'Lei 14.133/2021',
        ativo: true
    };

    const { data: catData, error: catError } = await supabase
        .from('categorias_documentos')
        .insert(catPayload)
        .select()
        .single();

    if (catError) {
        console.error('Failed to create category:', catError);
        process.exit(1);
    }
    console.log(`   Category created: ${catData.nome} (ID: ${catData.id})`);

    // 2. Setup Data - Subcategory
    console.log('2. Setting up Subcategory...');
    const subPayload = {
        categoria_id: catData.id,
        nome: 'Subcategoria Teste',
        ativo: true
    };
    const { data: subData, error: subError } = await supabase
        .from('subcategorias_documentos')
        .insert(subPayload)
        .select()
        .single();

    if (subError) {
        console.error('Failed to create subcategory:', subError);
        process.exit(1);
    }
    console.log(`   Subcategory created: ${subData.nome} (ID: ${subData.id})`);

    // 3. Create Document (Simulate Service)
    console.log('3. Creating Document...');
    const now = new Date();
    // Use short numero < 20 chars
    const docNumero = `${now.getFullYear()}-${Math.floor(Math.random() * 1000)}`;

    const docPayload = {
        numero: docNumero,
        titulo: 'Parecer Técnico de Teste',
        tipo: 'Parecer',
        categoria_id: catData.id,
        subcategoria_id: subData.id,
        status: 'Rascunho'
    };

    const { data: docData, error: docError } = await supabase
        .from('documentos')
        .insert(docPayload)
        .select()
        .single();


    if (docError) {
        console.error('Failed to create document:', docError);
        process.exit(1);
    }
    console.log(`   Document created: ${docData.titulo} (ID: ${docData.id})`);

    // 4. Verify Listing (Simulate Service List)
    console.log('4. Verifying Listing...');
    const { data: listData, error: listError } = await supabase
        .from('documentos')
        .select('*') // No join
        .eq('id', docData.id)
        .single();

    if (listError || !listData) {
        console.error('Failed to list document:', listError);
        process.exit(1);
    }
    console.log(`   Document found in list: ${listData.titulo}`);

    // 5. Verify Details (Simulate Service GetById)
    console.log('5. Verifying Details...');
    if (listData.categoria_id !== catData.id) {
        console.error(`   Mismatch: Expected Category ID ${catData.id}, got ${listData.categoria_id}`);
    } else {
        console.log(`   Category ID verified: ${listData.categoria_id}`);
    }

    // 6. Update Document (Simulate Service Update)
    console.log('6. Updating Document Status...');
    const { data: updateData, error: updateError } = await supabase
        .from('documentos')
        .update({ status: 'Concluído' })
        .eq('id', docData.id)
        .select()
        .single();

    if (updateError) {
        console.error('Failed to update document:', updateError);
        process.exit(1);
    }
    console.log(`   Status updated to: ${updateData.status}`);

    // Cleanup (Optional - keep data for UI check or delete)
    // console.log('7. Cleaning up...');
    // await supabase.from('documentos').delete().eq('id', docData.id);
    // await supabase.from('subcategorias_documentos').delete().eq('id', subData.id);
    // await supabase.from('categorias_documentos').delete().eq('id', catData.id);

    console.log('--- Test Completed Successfully ---');
}

runTest();
