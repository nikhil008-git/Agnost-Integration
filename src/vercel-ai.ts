import { generateText, streamText } from 'ai';
import type { AgnostConfig } from './agnost.js';
import {
  extractInput,
  extractModel,
  reportFailure,
  reportSuccess,
} from './utils.js';

export interface VercelAITracking {
  generateText: typeof generateText;
  streamText: typeof streamText;
}

export function trackVercelAI(config: AgnostConfig): VercelAITracking {
  return {
    generateText: createTrackedGenerateText(config),
    streamText: createTrackedStreamText(config),
  };
}

function createTrackedGenerateText(config: AgnostConfig): typeof generateText {
  return async (params) => {
    const start = Date.now();
    const input = extractInput(params);
    const model = extractModel(params.model);

    try {
      const result = await generateText(params);
      await reportSuccess(config, {
        input,
        output: result.text,
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
}

function createTrackedStreamText(config: AgnostConfig): typeof streamText {
  return (params) => {
    const start = Date.now();
    const input = extractInput(params);
    const model = extractModel(params.model);

    return streamText({
      ...params,
      onFinish: async (event) => {
        await reportSuccess(config, {
          input,
          output: event.text,
          model,
          latencyMs: Date.now() - start,
        });
        await params.onFinish?.(event);
      },
      onError: async (event) => {
        await reportFailure(config, {
          input,
          model,
          latencyMs: Date.now() - start,
          error: event.error,
        });
        await params.onError?.(event);
      },
    });
  };
}
