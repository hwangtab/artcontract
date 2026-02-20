import { getOpenRouterClient } from '../lib/ai/openrouter-client';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim().replace(/'|"/g, '');
});

async function main() {
    const client = getOpenRouterClient();
    try {
        const res = await client.chatWithAssistant("안녕", {
            currentStep: 0,
            formData: {},
            conversationHistory: []
        } as any);
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
