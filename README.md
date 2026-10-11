# WebVerse repair neighborhood

Three separate household repair websites on one local Node server, with live built-in vendor agents. All businesses, prices, policies, and quotes are fictional demo data. Nothing books work, contacts a real contractor, or processes a payment.

| Website | Path | Agent | Design |
| --- | --- | --- | --- |
| Stillwater | `/stillwater` | Wren | Calm cream and forest green, editorial serif, illustrated bathroom |
| GoodHands | `/goodhands` | Kit | Warm terracotta workshop, playful typography, handmade tool illustration |
| Form & Field | `/formfield` | Ada | Architectural charcoal and citron, precise grid, isometric bathroom |

The directory at `/` links to all three. Each website has services, transparent prices and terms, working FAQs, responsive layouts, and a chat available from its page CTAs or floating launcher.

## Run

Requires Node 22 or newer.

```sh
npm ci
npm start
```

Open `http://localhost:3000`. For server autoreload, use `npm run dev`. The static files are served directly; there is no frontend build. The server binds to `127.0.0.1` by default. `PORT` can change the port.

## Model and authentication

The application uses `@ljoukov/llm` 9.0.0 and its real streaming agent loop, with a `get_quote` tool that calculates itemized estimates from the server catalog.

The requested name, `chatgpt-luna-6-fast`, is explicitly mapped to the library's supported ID, **`chatgpt-gpt-6-luna-fast`**. The requested spelling is rejected by v9's model allowlist. The supported ID resolves to **GPT-6 Luna with priority processing**; there is no fallback to another model. Both IDs appear in `/api/health` and the completed chat stream.

Authentication stays on the server. The library can use the local Codex auth store, or a centralized token provider / proxy. See `.env.example` and the [library's authentication documentation](https://github.com/ljoukov/llm#chatgpt-subscription-models). Store settings only in ignored `.env.local`. `server.mjs` loads it before importing the backend. No keys are embedded in the browser, returned through the API, or logged by agent runs.

## Chat behavior

Agents have distinct voices and provider-specific catalogs, diagnostic fees, deposits, and warranty terms. They can explain a repair, ask scope questions, compare catalog facts, and generate a downloadable itemized estimate. Quote math is performed by code; the model chooses the appropriate scope and explains the result. A leaking faucet that is being replaced is a single faucet job, rather than separate leak and replacement charges.

GoodHands applies its fictional 10% bundle discount to two or more distinct catalog services. Diagnostic visits are listed separately and credited when work proceeds. Estimates remain conditional on inspection and final scope. Chat transcripts and the latest estimates survive reloads in the same browser tab via provider-specific `sessionStorage`. Start over clears that provider's conversation.

The shared backend limits request sizes, message history, per-session rate, and concurrent requests. It rejects foreign browser origins / non-loopback hostnames, privileged message roles, and obvious card numbers or credential-shaped messages before they reach the model. These checks are useful boundaries for this local demo, not a complete sensitive-data detector or a WebVerse simulation/review/commit harness.

## API for the surrounding demo

- `GET /api/health` — server status and explicit model mapping. This is a server health check, not an inference readiness probe.
- `GET /api/providers` — structured fictional catalogs for all three providers.
- `POST /api/chat` — an actual vendor-agent conversation.

Chat body:

```json
{
  "provider": "stillwater",
  "sessionId": "buyer-demo-1",
  "messages": [
    { "role": "user", "content": "Estimate a faucet replacement. Do not book anything." }
  ]
}
```

Include prior user/assistant text on follow-ups, alternating roles, starting and ending with a user. Do not include the widget's static greeting or system instructions. Maximum message text is 4,000 characters; total history is 28,000 characters. A normal request contains at most 23 alternating messages.

The response is streaming newline-delimited JSON (`application/x-ndjson`):

```json
{"type":"delta","text":"A faucet replacement…"}
{"type":"quote","quote":{"provider":"stillwater","items":[],"min":125,"max":225}}
{"type":"done","model":"chatgpt-luna-6-fast","libraryModel":"chatgpt-gpt-6-luna-fast","sessionId":"buyer-demo-1"}
```

The example quote above abbreviates the full object. Actual quotes include item ranges, subtotal, applied discount, diagnostic policy, deposit percentage, terms, currency, and fictional status. Event order follows the model's tool execution. Errors before streaming use an HTTP error and JSON `{ "error": "…" }`; errors during streaming use `{ "type": "error", "message": "…" }` and no `done` event.

Same-origin browser requests and local CLI clients are supported. No CORS permission is granted to other origins. The API accepts no payment, booking, email, filesystem, or subagent action. The surrounding WebVerse harness can consume these endpoints separately when that layer is built.

## Verify

```sh
npm run check
```

The checks cover quote arithmetic and diagnostic accounting, invalid scopes, origin enforcement, credential rejection, and message validation. Browser QA covers desktop and mobile layouts, FAQ controls, chat interaction, and real streaming quotes. The ignored `artifacts/` directory contains screenshots and live API check results from this build.

## Layout

- `server.mjs`: static server and API routing.
- `backend/catalog.mjs`: provider facts, model alias, quote arithmetic, agent instructions.
- `backend/api.mjs`: validation, streaming LLM calls, bounded `get_quote` tool.
- `public/{stillwater,goodhands,formfield}/`: independent website designs.
- `public/shared/agent.{js,css}`: shared, provider-themed chat widget.
- `public/index.html`: demo directory.
