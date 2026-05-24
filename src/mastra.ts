import type { AgnostConfig } from './agnost.js';
import { reportFailure, reportSuccess } from './utils.js';

export interface MastraGenerateResult {
  text?: string;
  [key: string]: unknown;
}

export interface TrackableMastraAgent {
  name?: string;
  generate: (
    messages: unknown,
    options?: unknown,
  ) => Promise<MastraGenerateResult>;
}

export function trackMastraAgent<T extends TrackableMastraAgent>(
  agent: T,
  config: AgnostConfig,
): T {
  const originalGenerate = agent.generate.bind(agent);

  agent.generate = async (messages, options) => {
    const start = Date.now();
    const input = JSON.stringify(messages ?? []);
    const model = agent.name ?? 'mastra-agent';

    try {
      const result = await originalGenerate(messages, options);
      await reportSuccess(config, {
        input,
        output: result.text ?? JSON.stringify(result),
        model,
        latencyMs: Date.now() - start,
      });
      return result;
    } catch (err) {
      await reportFailure(config, {
        input,
        model,
        latencyMs: Date.now() - start,
        error: err,
      });
      throw err;
    }
  };

  return agent;
}
