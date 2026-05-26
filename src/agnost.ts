import axios from 'axios';

export interface AgnostConfig {
  orgId: string;
  endpoint: string;
}

export interface AgnostPush {
  orgId: string;
  input: string;
  output: string;
  model: string;
  latencyMs: number;
  framework?: string;
  sessionId?: string;
  error?: string;
  timestamp: string;
}

export async function sendToAgnost(config: AgnostConfig, push: AgnostPush): Promise<void> {
  await axios.post(config.endpoint, push, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** Best-effort telemetry — never throws so LLM calls are not blocked. */
export async function reportToAgnost(config: AgnostConfig, push: AgnostPush): Promise<void> {
  try {
    await sendToAgnost(config, push);
  } catch (err) {
    console.error('Failed to report to Agnost:', err);
  }
}
