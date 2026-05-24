import { trackVercelAI } from "../src/index.js";
import { openai } from "@ai-sdk/openai";
import { MockLanguageModelV3 } from "ai/test";

const useOpenAI = process.env.USE_OPENAI === "true";

async function main() {
  const generateText = trackVercelAI({
    orgId: "test-org-123",
    endpoint: "http://localhost:3000/ingest",
  });

  const model = useOpenAI
    ? openai("gpt-4o")
    : new MockLanguageModelV3({
        provider: "mock",
        modelId: "mock-gpt",
        doGenerate: async () => ({
          content: [{ type: "text", text: "4" }],
          finishReason: { unified: "stop", raw: undefined },
          usage: {
            inputTokens: {
              total: 10,
              noCache: 10,
              cacheRead: undefined,
              cacheWrite: undefined,
            },
            outputTokens: {
              total: 1,
              text: 1,
              reasoning: undefined,
            },
          },
          warnings: [],
        }),
      });

  const result = await generateText({
    model,
    prompt: "What is 2 + 2?",
  });

  console.log("Result:", result.text);
  console.log(
    useOpenAI
      ? "Used real OpenAI (check mock server for Agnost event)"
      : "Used mock model (no API key needed)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
