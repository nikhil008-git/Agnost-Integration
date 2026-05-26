import http from 'node:http';
import { URL } from 'node:url';

/** Mirrors SDK `AgnostPush` — demo ingest contract for local dev. */
interface IngestEvent {
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

const events: IngestEvent[] = [];
const MAX_EVENTS = 500;

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function isValidEvent(body: unknown): body is IngestEvent {
  if (body == null || typeof body !== 'object') return false;
  const e = body as Record<string, unknown>;
  return (
    typeof e.orgId === 'string' &&
    typeof e.input === 'string' &&
    typeof e.output === 'string' &&
    typeof e.model === 'string' &&
    typeof e.latencyMs === 'number' &&
    typeof e.timestamp === 'string'
  );
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true, eventsStored: events.length });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
    json(res, 200, { events: events.slice(-limit).reverse() });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/ingest') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed: unknown = JSON.parse(body);
        if (!isValidEvent(parsed)) {
          json(res, 400, {
            error: 'Invalid payload',
            required: ['orgId', 'input', 'output', 'model', 'latencyMs', 'timestamp'],
          });
          return;
        }

        events.push(parsed);
        if (events.length > MAX_EVENTS) {
          events.splice(0, events.length - MAX_EVENTS);
        }

        console.log('📨 Agnost ingest:', {
          orgId: parsed.orgId,
          framework: parsed.framework ?? 'unknown',
          model: parsed.model,
          latencyMs: parsed.latencyMs,
          error: parsed.error,
        });

        json(res, 200, { ok: true });
      } catch {
        json(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  json(res, 404, { error: 'Not found', routes: ['GET /health', 'GET /events', 'POST /ingest'] });
});

const PORT = Number(process.env.PORT ?? 3000);
server.listen(PORT, () => {
  console.log(`Agnost mock ingest: http://localhost:${PORT}`);
  console.log('  POST /ingest   — receive telemetry');
  console.log('  GET  /events   — list recent events');
  console.log('  GET  /health   — liveness');
});
