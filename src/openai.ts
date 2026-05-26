import OpenAI from 'openai';
import type { AgnostConfig } from './agnost.js';
import { reportFailure, reportSuccess } from './utils.js';

type ChatCompletionParams = OpenAI.Chat.ChatCompletionCreateParamsNonStreaming;

export interface OpenAITracking {
  chatCompletionsCreate: (
    params: ChatCompletionParams,
  ) => Promise<OpenAI.Chat.ChatCompletion>;
}

export function trackOpenAI(
  config: AgnostConfig,
  client: OpenAI = new OpenAI(),
): OpenAITracking {
  return {
    chatCompletionsCreate: async (params) => {
      const start = Date.now();
      const input = JSON.stringify(params.messages ?? []);
      const model = params.model;

      try {
        const result = await client.chat.completions.create(params);
        const output = result.choices[0]?.message?.content ?? '';
        await reportSuccess(config, {
          input,
          output,
          model,
          latencyMs: Date.now() - start,
          framework: 'openai',
        });
        return result;
      } catch (err) {
        await reportFailure(config, {
          input,
          model,
          latencyMs: Date.now() - start,
          framework: 'openai',
          error: err,
        });
        throw err;
      }
    },
  };
}

export async function trackOpenAIPrompt(
  config: AgnostConfig,
  params: ChatCompletionParams,
  client?: OpenAI,
): Promise<OpenAI.Chat.ChatCompletion> {
  return trackOpenAI(config, client).chatCompletionsCreate(params);
}
