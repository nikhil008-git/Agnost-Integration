import { generateText } from 'ai';
import { sendToAgnost, type AgnostConfig } from './agnost';

export function trackVercelAI(config: AgnostConfig) {
    const originalGenerateText = generateText;

    return async (params: Parameters<typeof generateText>[0]) => {
const start = Date.now();
try{
    const result = await originalGenerateText(params);
    await sendToAgnost(config, {
        orgId: config.orgId,
        input: String(params.prompt || ""),
        output: result.text,
        model: String(params.model || ""),
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
    });
    return result; 
}
catch(err){
    console.error('Error tracking Vercel AI:', err);
    throw err;
}
    }
}