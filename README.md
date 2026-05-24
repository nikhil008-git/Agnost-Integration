# agnost-integrations

Integration SDK for sending agent telemetry to Agnost from popular AI frameworks.

## Supported SDKs

| SDK | Function | Status |
|-----|----------|--------|
| Vercel AI SDK | `trackVercelAI()` | `generateText` + `streamText` |
| OpenAI SDK | `trackOpenAI()` | Chat completions |
| Mastra | `trackMastraAgent()` | Wraps `agent.generate()` |

## Quick start

**Terminal 1 — mock Agnost ingest server**

```bash
npm run mock-server
```

**Terminal 2 — run examples (mock model, no API key)**

```bash
npm run example
```

**With real OpenAI**

```bash
export USE_OPENAI=true
export OPENAI_API_KEY=sk-...
npm run example
```

## Usage

### Vercel AI SDK

```ts
import { trackVercelAI } from 'agnost-integrations';

const { generateText, streamText } = trackVercelAI({
  orgId: 'your-org',
  endpoint: 'https://api.agnost.ai/ingest',
});

const result = await generateText({
  model,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### OpenAI SDK

```ts
import { trackOpenAI } from 'agnost-integrations';

const openai = trackOpenAI({ orgId, endpoint });
const result = await openai.chatCompletionsCreate({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Mastra

```ts
import { trackMastraAgent } from 'agnost-integrations';

const agent = trackMastraAgent(yourMastraAgent, { orgId, endpoint });
const result = await agent.generate([{ role: 'user', content: 'Hello' }]);
```

## Event schema

```json
{
  "orgId": "string",
  "input": "string",
  "output": "string",
  "model": "string",
  "latencyMs": 123,
  "error": "optional",
  "timestamp": "ISO-8601"
}
```

## Scripts

- `npm run build` — compile TypeScript
- `npm run mock-server` — local ingest server on :3000
- `npm run example` — run all integration demos
