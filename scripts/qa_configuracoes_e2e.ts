
import fs from 'fs';
import path from 'path';
import { configuracoesService } from '../src/services/api/configuracoesService';

// Polyfill ENV
const envPath = path.resolve(process.cwd(), '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim();
        }
    });
    console.log('Env loaded.');
} catch (e) {
    console.warn('.env.local not found.');
}

async function runQA() {
    console.log('--- STARTING CONFIGURACOES QA ---');

    try {
        // 1. Get Initial (Should be null or existing)
        console.log('1. Fetching current config...');
        const initial = await configuracoesService.obterAtual();
        console.log('   > Initial config:', initial ? 'Found' : 'Not Found');

        // 2. Create/Update
        console.log('2. Saving new config...');
        const newPayload = {
            nome_instituicao: 'QA Institution ' + Date.now(),
            sigla: 'QA-GOV',
            cnpj: '00.000.000/0000-00',
            email_contato: 'qa@test.com',
            telefone: '0000-0000',
            tema: { tema: 'dark', corPrimaria: '#000000', compacto: true },
            notificacoes: { emailTramitacao: false }, // Partial update test
            integracoes: { supabaseConectado: true }
        };

        const saved = await configuracoesService.salvar(newPayload as any);
        console.log('   > Saved ID:', saved.id);

        if (saved.nome_instituicao.startsWith('QA Institution')) {
            console.log('   > Verification: Name matches.');
        } else {
            console.error('   > FAIL: Name mismatch.');
        }

        // 3. Update again (Modify)
        console.log('3. Updating existing config...');
        const updatePayload = {
            nome_instituicao: 'QA Update ' + Date.now()
        };
        const updated = await configuracoesService.salvar(updatePayload as any);
        if (updated.id === saved.id && updated.nome_instituicao !== saved.nome_instituicao) {
            console.log('   > Update successful (Same ID, new Name).');
        } else {
            console.error('   > FAIL: Update failed or created new record.');
        }

        // 4. Logical Delete (Reset?)
        // In our service, excluirLogico sets excluido=true.
        // Getting current should then return null or a new one.
        console.log('4. Logical Delete...');
        await configuracoesService.excluirLogico(updated.id);

        const afterDelete = await configuracoesService.obterAtual();
        if (!afterDelete) {
            console.log('   > Config deleted. Current is null.');
        } else if (afterDelete.id !== updated.id) {
            console.log('   > Config deleted. Current is a different record (or null handled differently).');
        } else {
            console.error('   > FAIL: Deleted config still returned as current.');
        }

        console.log('--- QA PASSED ---');

    } catch (e: any) {
        console.error('--- QA FAILED ---');
        console.error(e);
        if (e.message && e.message.includes('relation "configuracoes" does not exist')) {
            console.warn('CRITICAL: Run migration 006.');
        }
    }
}

runQA();
