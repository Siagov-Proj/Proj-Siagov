
import { cadastrosService } from '../src/services/api/cadastrosService';
import fs from 'fs';
import path from 'path';

// Polyfill ENV
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

async function runQA() {
    console.log('--- TESTING CADASTROS COUNTS ---');
    try {
        const counts = await cadastrosService.getDashboardCounts();
        console.log('Counts received:', counts);

        const keys = Object.keys(counts);
        if (keys.length !== 12) throw new Error('Incorrect number of keys in response');

        console.log('Values check:');
        keys.forEach(k => {
            const val = (counts as any)[k];
            if (typeof val !== 'number') console.error(`Key ${k} is not a number:`, val);
            else console.log(`   ${k}: ${val}`);
        });

        console.log('--- QA PASSED ---');
    } catch (e) {
        console.error('--- QA FAILED ---', e);
        process.exit(1);
    }
}

runQA();
