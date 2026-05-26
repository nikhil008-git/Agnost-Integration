import { trackVercelAI, trackOpenAI, trackMastraAgent } from '../src/index.js';
import { openai } from '@ai-sdk/openai';
import { MockLanguageModelV3 } from 'ai/test';
import { simulateReadableStream } from 'ai';

const config = {
  orgId: process.env.AGNOST_ORG_ID ?? 'test-org-123',
  endpoint: process.env.AGNOST_ENDPOINT ?? 'http://localhost:3000/ingest',
};

const useOpenAI = process.env.USE_OPENAI === 'true';

function mockModel() {
  return new MockLanguageModelV3({
    provider: 'mock',
    modelId: 'mock-gpt',
    doGenerate: async () => ({
      content: [{ type: 'text', text: '4' }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: '4' },
          { type: 'text-end', id: 'text-1' },
          {
            type: 'finish',
            finishReason: { unified: 'stop', raw: undefined },
            logprobs: undefined,
            usage: {
              inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 1, text: 1, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

async function testVercelGenerateText() {
  const { generateText } = trackVercelAI(config);
  const model = useOpenAI ? openai('gpt-4o') : mockModel();

  const result = await generateText({
    model,
    messages: [{ role: 'user', content: 'What is 2 + 2?' }],
  });

  console.log('[vercel generateText]', result.text);
}

async function testVercelStreamText() {
  const { streamText } = trackVercelAI(config);
  const model = useOpenAI ? openai('gpt-4o') : mockModel();

  const result = streamText({
    model,
    prompt: 'What is 2 + 2?',
  });

  let text = '';
  for await (const chunk of result.textStream) {
    text += chunk;
  }

  console.log('[vercel streamText]', text);
}

async function testOpenAI() {
  if (!useOpenAI) {
    console.log('[openai] skipped (set USE_OPENAI=true to run)');
    return;
  }

  const tracked = trackOpenAI(config);
  const result = await tracked.chatCompletionsCreate({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Say hello in one word' }],
  });

  console.log('[openai]', result.choices[0]?.message?.content ?? '');
}

async function testMastra() {
  const agent = trackMastraAgent(
    {
      name: 'demo-agent',
      generate: async (messages) => ({
        text: `Echo: ${JSON.stringify(messages)}`,
      }),
    },
    config,
  );

  const result = await agent.generate([{ role: 'user', content: 'ping' }]);
  console.log('[mastra]', result.text);
}

async function main() {
  await testVercelGenerateText();
  await testVercelStreamText();
  await testOpenAI();
  await testMastra();
  console.log('Done — check mock server for Agnost events');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
