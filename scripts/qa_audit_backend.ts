
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_ANON_KEY = envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TIMESTAMP = Date.now();
const LOG_PREFIX = `[QA_AUDIT]`;

async function testModule(moduleName: string, tableName: string, createPayload: any, updatePayload: any) {
    console.log(`\n=== Testing Module: ${moduleName} ===`);
    let id: string | null = null;
    let passed = true;

    try {
        // 1. CREATE
        const { data: created, error: createError } = await supabase
            .from(tableName)
            .insert({ ...createPayload, excluido: false })
            .select()
            .single();

        if (createError) throw new Error(`Create Failed: ${createError.message}`);
        if (!created) throw new Error('Create returned no data');
        id = created.id;
        console.log(`✅ Create: Success (ID: ${id})`);

        // 2. READ
        const { data: read, error: readError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (readError) throw new Error(`Read Failed: ${readError.message}`);
        if (!read) throw new Error('Read returned no data');
        // Verify key field
        const keyField = Object.keys(createPayload)[0]; // heuristic
        if (read[keyField] !== createPayload[keyField]) {
            throw new Error(`Read mismatch: Expected ${createPayload[keyField]}, got ${read[keyField]}`);
        }
        console.log(`✅ Read: Success`);

        // 3. UPDATE
        const { data: updated, error: updateError } = await supabase
            .from(tableName)
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new Error(`Update Failed: ${updateError.message}`);
        // Verify update
        const updateKey = Object.keys(updatePayload)[0];
        if (updated[updateKey] !== updatePayload[updateKey]) {
            throw new Error(`Update mismatch: Expected ${updatePayload[updateKey]}, got ${updated[updateKey]}`);
        }
        console.log(`✅ Update: Success`);

        // 4. DELETE (Logical)
        const { error: deleteError } = await supabase
            .from(tableName)
            .update({ excluido: true })
            .eq('id', id);

        if (deleteError) throw new Error(`Delete Failed: ${deleteError.message}`);
        console.log(`✅ Delete (Logical): Success`);

        // 5. VERIFY DELETION (Should not be found with excluido=false)
        const { data: check, error: checkError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('excluido', false)
            .single();

        if (check || !checkError) { // Expecting error or null
            // Supabase .single() returns error if not found (PGRST116)
            if (checkError?.code !== 'PGRST116') {
                // If it found data, that's a failure
                if (check) throw new Error('Item still visible after logical delete');
            }
        }
        console.log(`✅ Verify Deletion: Success`);

        return { id, success: true };

    } catch (error: any) {
        console.error(`❌ FAIL: ${error.message}`);
        return { id, success: false, error: error.message };
    }
}

async function runAudit() {
    const results: Record<string, any> = {};

    // --- 1. Esferas ---
    const esferaPayload = {
        sigla: `Q${TIMESTAMP % 10000}`, // Ma 5 chars
        nome: `Esfera QA ${TIMESTAMP}`,
        ativo: true
    };
    const esferaUpdate = { nome: `Esfera QA Updated ${TIMESTAMP}` };
    const esferaRes = await testModule('Esferas', 'esferas', esferaPayload, esferaUpdate);
    results['Esferas'] = esferaRes.success;
    const esferaId = esferaRes.id;

    if (!esferaId) {
        console.error("Cannot proceed with dependent modules (Instituicoes, etc.) due to Esfera failure.");
        process.exit(1);
    }

    // --- 2. Instituicoes ---
    const instPayload = {
        codigo: `I${TIMESTAMP % 90}`, // 3 chars max
        nome: `Instituicao QA ${TIMESTAMP}`,
        esfera_id: esferaId,
        ativo: true
    };
    const instUpdate = { nome: `Instituicao QA Upd ${TIMESTAMP}` };
    const instRes = await testModule('Instituicoes', 'instituicoes', instPayload, instUpdate);
    results['Instituicoes'] = instRes.success;
    const instId = instRes.id;

    if (!instId) {
        console.error("Cannot proceed with dependent modules (Orgaos, etc.) due to Instituicao failure.");
        // We continue with independent ones though
    }

    // --- 3. Orgaos ---
    let orgaoId = null;
    if (instId) {
        const orgaoPayload = {
            codigo: `O${TIMESTAMP % 1000}`, // 4 chars (limit 6)
            nome: `Orgao QA ${TIMESTAMP}`,
            instituicao_id: instId,
            ativo: true
        };
        const orgaoUpdate = { nome: `Orgao QA Upd ${TIMESTAMP}` };
        const orgaoRes = await testModule('Orgaos', 'orgaos', orgaoPayload, orgaoUpdate);
        results['Orgaos'] = orgaoRes.success;
        orgaoId = orgaoRes.id;
    } else {
        results['Orgaos'] = 'SKIPPED';
    }

    // --- 4. Unidades Gestoras ---
    let unidadeId = null;
    if (orgaoId) {
        const unidPayload = {
            codigo: `U${TIMESTAMP % 1000}`,
            nome: `Unidade QA ${TIMESTAMP}`,
            orgao_id: orgaoId,
            ativo: true
        };
        const unidUpdate = { nome: `Unidade QA Upd ${TIMESTAMP}` };
        const unidRes = await testModule('Unidades Gestoras', 'unidades_gestoras', unidPayload, unidUpdate);
        results['Unidades Gestoras'] = unidRes.success;
        unidadeId = unidRes.id;
    } else {
        results['Unidades Gestoras'] = 'SKIPPED';
    }

    // --- 5. Setores ---
    let setorId = null;
    if (unidadeId) {
        const setorPayload = {
            codigo: `S${TIMESTAMP % 90}`, // 3 chars (limit 4)
            nome: `Setor QA ${TIMESTAMP}`,
            unidade_gestora_id: unidadeId,
            ativo: true
        };
        const setorUpdate = { nome: `Setor QA Upd ${TIMESTAMP}` };
        const setorRes = await testModule('Setores', 'setores', setorPayload, setorUpdate);
        results['Setores'] = setorRes.success;
        setorId = setorRes.id;
    } else {
        results['Setores'] = 'SKIPPED';
    }

    // --- 6. Cargos ---
    if (setorId) {
        const cargoPayload = {
            codigo: `C${TIMESTAMP % 90}`, // 3 chars (limit 3)
            nome: `Cargo QA ${TIMESTAMP}`,
            setor_id: setorId,
            ativo: true
        };
        const cargoUpdate = { nome: `Cargo QA Upd ${TIMESTAMP}` };
        const cargoRes = await testModule('Cargos', 'cargos', cargoPayload, cargoUpdate);
        results['Cargos'] = cargoRes.success;
    } else {
        results['Cargos'] = 'SKIPPED';
    }

    // --- 7. Usuarios ---
    const userPayload = {
        codigo: `U${TIMESTAMP % 90}`, // 3 chars
        cpf: `${Date.now()}`.substring(0, 11), // 11 digits
        nome: `Usuario QA ${TIMESTAMP}`,
        ativo: true
    };
    const userUpdate = { nome: `Usuario QA Upd ${TIMESTAMP}` };
    const userRes = await testModule('Usuarios', 'usuarios', userPayload, userUpdate);
    results['Usuarios'] = userRes.success;

    // --- 8. Exercicios Financeiros ---
    const exercicioPayload = {
        ano: 2050 + (Object.keys(results).length), // ensuring unique
        ativo: true
    };
    const exercicioUpdate = { ativo: false };
    const exRes = await testModule('Exercicios', 'exercicios_financeiros', exercicioPayload, exercicioUpdate);
    results['Exercicios'] = exRes.success;

    // --- 9. Bancos ---
    const bancoPayload = {
        codigo: `B${TIMESTAMP % 100}`,
        nome: `Banco QA ${TIMESTAMP}`,
        ativo: true
    };
    const bancoUpdate = { nome: `Banco QA Upd ${TIMESTAMP}` };
    const bancoRes = await testModule('Bancos', 'bancos', bancoPayload, bancoUpdate);
    results['Bancos'] = bancoRes.success;
    const bancoId = bancoRes.id;

    // --- 10. Agencias ---
    if (bancoId) {
        const agenciaPayload = {
            codigo: `A${TIMESTAMP % 1000}`,
            nome: `Agencia QA ${TIMESTAMP}`,
            banco_id: bancoId,
            ativo: true
        };
        const agenciaUpdate = { nome: `Agencia QA Upd ${TIMESTAMP}` };
        const agRes = await testModule('Agencias', 'agencias', agenciaPayload, agenciaUpdate);
        results['Agencias'] = agRes.success;
    } else {
        results['Agencias'] = 'SKIPPED';
    }

    // --- 11. Categorias Documentos ---
    const catPayload = {
        nome: `Categoria QA ${TIMESTAMP}`,
        descricao: 'Teste auto',
        ativo: true
    };
    const catUpdate = { descricao: 'Desc Updated' };
    const catRes = await testModule('Categorias Doc', 'categorias_documentos', catPayload, catUpdate);
    results['Categorias Doc'] = catRes.success;

    // --- 12. Credores ---
    // Credores needs CPF/CNPJ
    const credorPayload = {
        "tipo_credor": 'Física',
        "identificador": `${Date.now()}`.substring(0, 11),
        "nome": `Credor QA ${TIMESTAMP}`,
        "ativo": true
    };
    const credorUpdate = { nome: `Credor QA Upd ${TIMESTAMP}` };
    const credorRes = await testModule('Credores', 'credores', credorPayload, credorUpdate);
    results['Credores'] = credorRes.success;

    console.log('\n\n========== AUDIT SUMMARY ==========');
    console.table(results);
}

runAudit();
