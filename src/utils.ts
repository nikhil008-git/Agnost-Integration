import { reportToAgnost, type AgnostConfig } from './agnost.js';

export interface PromptLike {
  prompt?: string;
  messages?: ReadonlyArray<{ role: string; content: unknown }>;
  system?: string;
}

export function extractInput(params: PromptLike): string {
  if (typeof params.prompt === 'string' && params.prompt.length > 0) {
    return params.prompt;
  }

  if (params.messages && params.messages.length > 0) {
    return JSON.stringify(params.messages);
  }

  if (typeof params.system === 'string' && params.system.length > 0) {
    return params.system;
  }

  return '';
}

export function extractModel(model: unknown): string {
  if (model == null) {
    return '';
  }

  if (typeof model === 'string') {
    return model;
  }

  if (typeof model === 'object') {
    const candidate = model as { modelId?: string; provider?: string };
    if (candidate.modelId) {
      return candidate.provider
        ? `${candidate.provider}/${candidate.modelId}`
        : candidate.modelId;
    }
  }

  return String(model);
}

export async function reportSuccess(
  config: AgnostConfig,
  fields: {
    input: string;
    output: string;
    model: string;
    latencyMs: number;
  },
): Promise<void> {
  await reportToAgnost(config, {
    orgId: config.orgId,
    input: fields.input,
    output: fields.output,
    model: fields.model,
    latencyMs: fields.latencyMs,
    timestamp: new Date().toISOString(),
  });
}

export async function reportFailure(
  config: AgnostConfig,
  fields: {
    input: string;
    model: string;
    latencyMs: number;
    error: unknown;
  },
): Promise<void> {
  await reportToAgnost(config, {
    orgId: config.orgId,
    input: fields.input,
    output: '',
    model: fields.model,
    latencyMs: fields.latencyMs,
    error: fields.error instanceof Error ? fields.error.message : String(fields.error),
    timestamp: new Date().toISOString(),
  });
}
