
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { chamadosService } from '../src/services/api/chamadosService';

// Load Env
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
    console.warn('.env.local not found, assuming variables are set.');
}

// Now we can use the service
// import { chamadosService } from ... (already imported, but runtime access will work)

async function runQA() {
    console.log('--- STARTING CHAMADOS E2E QA ---');

    try {
        // 1. Create Chamado
        console.log('1. Creating Chamado...');
        const novoChamado = await chamadosService.criar({
            assunto: 'QA Auto Test ' + Date.now(),
            categoria: 'Bug',
            prioridade: 'Alta',
            descricao: 'Testing automated creation',
            criado_por: 'QA Bot'
        });
        console.log('   > Chamado Created:', novoChamado.id, novoChamado.protocolo);

        // 2. List Chamados
        console.log('2. Listing Chamados...');
        const lista = await chamadosService.listar();
        const found = lista.find(c => c.id === novoChamado.id);
        if (found) {
            console.log('   > Chamado found in list.');
        } else {
            console.error('   > FAIL: Chamado NOT found in list.');
        }

        // 3. Get Details
        console.log('3. Getting Details...');
        const detalhe = await chamadosService.obterPorId(novoChamado.id);
        if (detalhe && detalhe.assunto === novoChamado.assunto) {
            console.log('   > Details retrieved successfully.');
        } else {
            console.error('   > FAIL: Details mismatch or not found.');
        }

        // 3.5 Update Chamado (Test Edição)
        console.log('3.5. Updating Chamado (Status/Priority)...');
        const updatePayload = { status: 'Em Atendimento', prioridade: 'Média' };
        const updated = await chamadosService.atualizar(novoChamado.id, updatePayload as any);
        if (updated.status === 'Em Atendimento' && updated.prioridade === 'Média') {
            console.log('   > Update successful: Status and Priority changed.');
        } else {
            console.error('   > FAIL: Update did not persist values.', updated);
        }

        // 4. Send Message
        console.log('4. Sending Message...');
        await chamadosService.enviarMensagem(novoChamado.id, 'Hello QA World', 'QA Bot');
        console.log('   > Message sent.');

        // 5. List Messages
        console.log('5. Listing Messages...');
        const mensagens = await chamadosService.listarMensagens(novoChamado.id);
        if (mensagens.length > 0 && mensagens[0].mensagem === 'Hello QA World') {
            console.log('   > Message found:', mensagens.length);
        } else {
            console.error('   > FAIL: Message not found.');
        }

        // 6. Logical Delete (Clean up)
        console.log('6. Deleting (Logical)...');
        await chamadosService.excluir(novoChamado.id);

        const listaPosDelete = await chamadosService.listar();
        if (listaPosDelete.find(c => c.id === novoChamado.id)) {
            console.error('   > FAIL: Chamado still in list (should be filtered).');
        } else (
            console.log('   > Chamado successfully removed from list.')
        )

        console.log('--- QA PASSED ---');

    } catch (error: any) {
        console.error('--- QA FAILED ---');
        console.error(error);
        if (error.message && error.message.includes('relation "chamados" does not exist')) {
            console.error('CRITICAL: Database table "chamados" is missing. Please run migration 005.');
        }
    }
}

runQA();
