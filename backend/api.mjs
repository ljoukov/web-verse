import { randomUUID } from 'node:crypto';
import { LIBRARY_MODEL, REQUESTED_MODEL, PROVIDERS, agentInstructions, calculateQuote, publicCatalog } from './catalog.mjs';

const MAX_BODY_BYTES = 48 * 1024;
const MAX_MESSAGES = 24;
const MAX_TEXT = 4000;
const MAX_TOTAL_TEXT = 28000;
const MAX_SESSIONS = 300;
const WINDOW_MS = 60_000;
const SESSION_TTL_MS = 15 * 60_000;
const MAX_GLOBAL_ACTIVE = 6;
const sessions = new Map();
const addressWindows = new Map();
let globalActive = 0;

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function isSameOrigin(req) {
  const host = req.headers.host;
  if (!host || typeof host !== 'string') return false;
  let expected;
  try {
    expected = new URL(`http://${host}`);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(expected.hostname)) return false;
    if (expected.username || expected.password || expected.pathname !== '/' || expected.search || expected.hash) return false;
    if (req.socket?.localPort && Number(expected.port || 80) !== req.socket.localPort) return false;
  } catch { return false; }
  if (req.headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = req.headers.origin;
  if (!origin) return true; // Local CLI integrations have no browser Origin header.
  try { return new URL(origin).origin === expected.origin; } catch { return false; }
}

export function containsSensitiveData(text) {
  text = text.normalize('NFKC');
  // Don't forward card-number shaped input, even invalid test numbers, to the model.
  if (/(?:^|[^\d])\d(?:[\s.-]?\d){12,18}(?:$|[^\d])/.test(text)) return true;
  if (/\b(?:sk|pk)[-_][A-Za-z0-9_-]{16,}\b/.test(text)) return true;
  if (/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})\b/.test(text)) return true;
  if (/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/.test(text)) return true;
  if (/\bbearer\s+[A-Za-z0-9._-]{16,}/i.test(text)) return true;
  if (/\bpassword\s*(?:[:=]|is\s+)\s*\S+/i.test(text)) return true;
  if (/\b(?:api[ _-]?key|access[ _-]?token|refresh[ _-]?token|password|secret)\s*(?:[:=]|is\s+)\s*\S{8,}/i.test(text)) return true;
  return false;
}

export function validateChatBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Expected a JSON object.');
  if (typeof body.provider !== 'string' || !Object.hasOwn(PROVIDERS, body.provider)) throw new ApiError(400, 'Choose a valid provider.');
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) {
    throw new ApiError(400, `Include 1–${MAX_MESSAGES} conversation messages.`);
  }
  let total = 0;
  const messages = body.messages.map((message, index) => {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      throw new ApiError(400, 'Only text user and assistant messages are accepted.');
    }
    const content = message.content.trim();
    if (!content || content.length > MAX_TEXT) throw new ApiError(400, `Each message must contain 1–${MAX_TEXT} characters.`);
    if (index === 0 && message.role !== 'user') throw new ApiError(400, 'Conversation must start with a user message.');
    if (index > 0 && message.role === body.messages[index - 1].role) throw new ApiError(400, 'Conversation roles must alternate.');
    if (containsSensitiveData(content)) throw new ApiError(400, 'Please remove card numbers, passwords, and access tokens. This demo never needs them.');
    total += content.length;
    return { role: message.role, content };
  });
  if (messages.at(-1).role !== 'user') throw new ApiError(400, 'The last message must be from the user.');
  if (total > MAX_TOTAL_TEXT) throw new ApiError(400, 'Conversation is too long. Please start a new chat.');
  if (body.sessionId !== undefined && (typeof body.sessionId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(body.sessionId))) {
    throw new ApiError(400, 'Session ID must contain 1–80 letters, numbers, underscores, or hyphens.');
  }
  return { provider: body.provider, messages, sessionId: body.sessionId ?? randomUUID() };
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) throw new ApiError(415, 'Use application/json.');
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw new ApiError(413, 'Request is too large.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new ApiError(413, 'Request is too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError(400, 'Request body must be valid JSON.'); }
}

function acquireSession(req, chat) {
  const now = Date.now();
  for (const [key, session] of sessions) if (!session.active && now - session.lastSeen > SESSION_TTL_MS) sessions.delete(key);
  for (const [key, window] of addressWindows) if (now - window.since > WINDOW_MS) addressWindows.delete(key);
  const address = req.socket.remoteAddress ?? 'local';
  const addressWindow = addressWindows.get(address) ?? { since: now, count: 0 };
  if (addressWindow.count >= 30) throw new ApiError(429, 'Too many requests. Try again in a minute.');
  // Never let changing session IDs evade the per-address window.
  if (!addressWindows.has(address) && addressWindows.size >= MAX_SESSIONS) throw new ApiError(429, 'The demo is busy. Try again shortly.');
  addressWindow.count++;
  addressWindows.set(address, addressWindow);
  const key = `${address}:${chat.provider}:${chat.sessionId}`;
  let session = sessions.get(key);
  if (!session) {
    if (sessions.size >= MAX_SESSIONS) throw new ApiError(429, 'The demo is busy. Try again shortly.');
    session = { since: now, count: 0, lastSeen: now, active: false };
    sessions.set(key, session);
  }
  if (now - session.since > WINDOW_MS) { session.since = now; session.count = 0; }
  if (session.count >= 12) throw new ApiError(429, 'Too many messages. Try again in a minute.');
  if (session.active) throw new ApiError(429, 'Wait for this agent to finish replying.');
  if (globalActive >= MAX_GLOBAL_ACTIVE) throw new ApiError(429, 'All demo agents are busy. Try again shortly.');
  session.count++;
  session.lastSeen = now;
  session.active = true;
  globalActive++;
  return () => { session.active = false; session.lastSeen = Date.now(); globalActive--; };
}

// Dependencies load only when a valid chat reaches the model, so catalog/guard tests need no credentials.
async function startAgent(chat, signal, write) {
  const [{ streamAgentLoop, tool }, { z }] = await Promise.all([import('@ljoukov/llm'), import('zod')]);
  const call = streamAgentLoop({
    model: LIBRARY_MODEL,
    input: chat.messages,
    instructions: agentInstructions(chat.provider),
    thinkingLevel: 'low',
    maxSteps: 3,
    filesystemTool: false,
    subagentTool: false,
    logging: false,
    telemetry: false,
    signal,
    tools: {
      get_quote: tool({
        description: 'Generate an authoritative itemized fictional USD estimate for this provider. Call when the user asks for an estimate, a quote, or pricing for catalog services. Does not book work or take payment.',
        inputSchema: z.object({ services: z.array(z.enum(['leak', 'faucet', 'toilet', 'refresh'])).min(1).max(4) }),
        execute: ({ services }) => {
          const quote = calculateQuote(chat.provider, services);
          write({ type: 'quote', quote });
          return quote;
        },
      }),
    },
  });
  // Consume rejection immediately even when the event stream also throws.
  const completed = call.result.then(result => ({ result }), error => ({ error }));
  let responseChars = 0;
  for await (const event of call.events) {
    if (event.type === 'delta' && event.channel === 'response') {
      responseChars += event.text.length;
      if (responseChars > 16000) { call.abort(); throw new Error('Agent reply limit exceeded.'); }
      write({ type: 'delta', text: event.text });
    }
  }
  const completion = await completed;
  if (completion.error) throw completion.error;
}

export async function handleApi(req, res) {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (!path.startsWith('/api/')) return false;
  if (!isSameOrigin(req)) { json(res, 403, { error: 'This API is available only from the local demo origin.' }); return true; }
  if (req.method === 'GET' && path === '/api/health') {
    json(res, 200, { ok: true, model: REQUESTED_MODEL, libraryModel: LIBRARY_MODEL, modelAlias: 'Requested spelling maps explicitly to the library’s GPT-6 Luna Fast priority route.', fictional: true });
    return true;
  }
  if (req.method === 'GET' && path === '/api/providers') { json(res, 200, { providers: publicCatalog() }); return true; }
  if (req.method !== 'POST' || path !== '/api/chat') { json(res, 404, { error: 'API route not found.' }); return true; }
  let release;
  let timeout;
  const controller = new AbortController();
  const onClose = () => { if (!res.writableEnded) controller.abort(); };
  try {
    const chat = validateChatBody(await readJson(req));
    release = acquireSession(req, chat);
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Accel-Buffering': 'no' });
    res.flushHeaders?.();
    res.on('close', onClose);
    timeout = setTimeout(() => controller.abort(), 60_000);
    const write = event => { if (!res.destroyed && !res.writableEnded) res.write(`${JSON.stringify(event)}\n`); };
    await startAgent(chat, controller.signal, write);
    write({ type: 'done', model: REQUESTED_MODEL, libraryModel: LIBRARY_MODEL, sessionId: chat.sessionId });
    res.end();
  } catch (error) {
    if (!res.headersSent) json(res, error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.message : 'Unable to start this conversation. Please try again.' });
    else if (!res.destroyed) {
      // Provider errors may contain identifiers or credentials. Never expose their raw text.
      const message = controller.signal.aborted ? 'The agent took too long. Please try again.' : 'The agent is temporarily unavailable. Please try again.';
      res.end(`${JSON.stringify({ type: 'error', message })}\n`);
    }
  } finally {
    if (timeout) clearTimeout(timeout);
    res.off('close', onClose);
    release?.();
  }
  return true;
}
