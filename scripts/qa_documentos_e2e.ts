
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
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

async function runQATest() {
    console.log('--- STARTING QA E2E TEST: DOCUMENTOS ---');
    console.log(`Time: ${new Date().toISOString()}`);

    const results: Record<string, string> = {};

    try {
        // 1. SETUP PREREQUISITES (Category/Subcategory)
        console.log('\n[SETUP] Creating prerequisites...');
        const { data: catData, error: catError } = await supabase.from('categorias_documentos').insert({
            nome: `QA_Category_${Date.now()}`,
            lei: 'Lei QA'
        }).select().single();
        if (catError) throw new Error(`Category setup failed: ${catError.message}`);

        const { data: subData, error: subError } = await supabase.from('subcategorias_documentos').insert({
            nome: 'QA_SubCategory',
            categoria_id: catData.id
        }).select().single();
        if (subError) throw new Error(`Subcategory setup failed: ${subError.message}`);

        console.log('✔ Prerequisites created.');

        // 2. CREATE VALID DOCUMENT
        console.log('\n[TEST 1] Create Valid Document (Expecting Success)...');
        const docPayload = {
            titulo: 'QA Test Document',
            numero: `${new Date().getFullYear()}/QA-${Math.floor(Math.random() * 1000)}`,
            tipo: 'QA',
            categoria_id: catData.id,
            subcategoria_id: subData.id,
            status: 'Rascunho',
            ativo: true,
            excluido: false
        };

        const { data: docCreated, error: createError } = await supabase
            .from('documentos')
            .insert(docPayload)
            .select() // Returning data might fail if columns missing in return? No, usually valid.
            .single();

        if (createError) {
            console.error('❌ [TEST 1] Creating Document FAILED:', createError.message);
            // Special check for column error
            if (createError.message.includes('column "excluido" of relation "documentos" does not exist') || createError.message.includes('Could not find the \'excluido\' column')) {
                console.log('   >>> DIAGNOSIS: The "excluido" column is missing in the database. Please run the migration "supabase/migrations/fixes/004_fix_missing_columns.sql" <<<');
            }
            throw createError;
        }
        console.log('✔ [TEST 1] Document Created:', docCreated.id);
        results['Create'] = 'PASS';


        // 3. READ DOCUMENT (Verify Filter)
        console.log('\n[TEST 2] Read Document (Expecting to find it)...');
        const { data: listData, error: listError } = await supabase
            .from('documentos')
            .select('*')
            .eq('id', docCreated.id)
            .eq('excluido', false) // Use filter used in service
            .single();

        if (listError || !listData) {
            console.error('❌ [TEST 2] Read Failed or Not Found:', listError?.message);
            if (listError?.message.includes('excluido')) {
                console.log('   >>> DIAGNOSIS: Column "excluido" missing. <<<');
            }
            throw new Error('Read failed');
        }
        console.log('✔ [TEST 2] Document Found:', listData.titulo);
        results['Read'] = 'PASS';


        // 4. UPDATE DOCUMENT (Edit)
        console.log('\n[TEST 3] Update Document (Change Title)...');
        const updates = { titulo: 'QA Test Document UPDATED' };
        const { data: updateData, error: updateError } = await supabase
            .from('documentos')
            .update(updates)
            .eq('id', docCreated.id)
            .select()
            .single();

        if (updateError) {
            console.error('❌ [TEST 3] Update Failed:', updateError.message);
            throw updateError;
        }
        if (updateData.titulo !== 'QA Test Document UPDATED') {
            console.error('❌ [TEST 3] Update verification failed. Title not changed.');
            throw new Error('Update mismatch');
        }
        console.log('✔ [TEST 3] Document Updated.');
        results['Update'] = 'PASS';


        // 5. LOGICAL DELETE
        console.log('\n[TEST 4] Logical Delete (Soft Delete)...');
        const { error: deleteError } = await supabase
            .from('documentos')
            .update({ excluido: true })
            .eq('id', docCreated.id);

        if (deleteError) {
            console.error('❌ [TEST 4] Logical Delete Failed:', deleteError.message);
            if (deleteError.message.includes('excluido')) {
                console.log('   >>> DIAGNOSIS: Column "excluido" missing. <<<');
            }
            throw deleteError;
        }
        console.log('✔ [TEST 4] Logical Delete executed.');


        // 6. VERIFY DELETION (Should not be found with excluido=false)
        console.log('\n[TEST 5] Verify Deletion...');
        const { data: verifyData } = await supabase
            .from('documentos')
            .select('*')
            .eq('id', docCreated.id)
            .eq('excluido', false)
            .maybeSingle(); // Should be null

        if (verifyData) {
            console.error('❌ [TEST 5] Document still found using logic filter!');
            results['LogicalDelete'] = 'FAIL';
        } else {
            // Verify it DOES exist if we check excluido=true
            const { data: ghostData } = await supabase
                .from('documentos')
                .select('*')
                .eq('id', docCreated.id)
                .eq('excluido', true)
                .maybeSingle();

            if (ghostData) {
                console.log('✔ [TEST 5] Document effectively hidden and found as ghost.');
                results['LogicalDelete'] = 'PASS';
            } else {
                console.log('⚠ [TEST 5] Document gone completely? Maybe hard delete happened?');
            }
        }

    } catch (e: any) {
        console.error('\n!!! QA TEST ABORTED DUE TO ERROR !!!');
        console.error(e.message || e);
        results['Status'] = 'CRITICAL FAILURE';
    }

    console.log('\n--- QA SUMMARY ---');
    console.table(results);
}

runQATest();
