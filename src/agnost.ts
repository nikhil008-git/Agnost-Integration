import axios from 'axios';

export interface AgnostConfig {
    orgId : string;
    endpoint: string;
}

export interface AgnostPush {
    orgId: string;
    input: string;
    output: string;
    model: string;
    latencyMs: number;
    error?: string;
    timestamp: string;
}

export async function sendToAgnost(config: AgnostConfig, push: AgnostPush) {
    const endpoint = config.endpoint;
    try{
        await axios.post(endpoint, push, {
            headers: {
                'Content-Type': 'application/json',
             }
        });

    }
    catch(err){
        console.error('Error sending to Agnost:', err);
        throw err;
    }
}