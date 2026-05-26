import { reportToAgnost, type AgnostConfig } from './agnost.js';

/** Loose shape for Vercel AI / similar SDK params — avoids fighting union prompt types. */
export interface PromptLike {
  prompt?: unknown;
  messages?: unknown;
  system?: unknown;
}

export function extractInput(params: PromptLike): string {
  if (typeof params.prompt === 'string' && params.prompt.length > 0) {
    return params.prompt;
  }

  if (Array.isArray(params.prompt) && params.prompt.length > 0) {
    return JSON.stringify(params.prompt);
  }

  if (Array.isArray(params.messages) && params.messages.length > 0) {
    return JSON.stringify(params.messages);
  }

  if (typeof params.system === 'string' && params.system.length > 0) {
    return params.system;
  }

  if (Array.isArray(params.system) && params.system.length > 0) {
    return JSON.stringify(params.system);
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

export interface ReportFields {
  input: string;
  model: string;
  latencyMs: number;
  framework?: string;
  sessionId?: string;
}

export async function reportSuccess(
  config: AgnostConfig,
  fields: ReportFields & {
    output: string;
  },
): Promise<void> {
  await reportToAgnost(config, {
    orgId: config.orgId,
    input: fields.input,
    output: fields.output,
    model: fields.model,
    latencyMs: fields.latencyMs,
    timestamp: new Date().toISOString(),
    ...(fields.framework !== undefined ? { framework: fields.framework } : {}),
    ...(fields.sessionId !== undefined ? { sessionId: fields.sessionId } : {}),
  });
}

export async function reportFailure(
  config: AgnostConfig,
  fields: ReportFields & {
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
    ...(fields.framework !== undefined ? { framework: fields.framework } : {}),
    ...(fields.sessionId !== undefined ? { sessionId: fields.sessionId } : {}),
  });
}
