# Vendor agents and API

The three [standalone vendor websites](../README.md#the-vendor-neighborhood) share a Node backend, hosted on Vercel or run locally. Each agent uses its own fictional catalog, voice, diagnostic policy, deposit terms, and warranty details.

This API powers the vendor websites. The kitchen workspace currently uses its own scripted scenario rather than calling these endpoints.

## Model and authentication

The backend uses `@ljoukov/llm` 9.0.0 and its streaming agent loop with a bounded `get_quote` tool.

The requested alias, `chatgpt-luna-6-fast`, maps to the library’s supported ID, **`chatgpt-gpt-6-luna-fast`**. The requested spelling is rejected by v9’s model allowlist. There is no fallback to another model. Both IDs appear in `/api/health` and the completed chat stream.

Authentication stays on the server. The library can use a compatible local Codex auth store or a centralized token provider/proxy. See [`.env.example`](../.env.example) and the [library’s authentication documentation](https://github.com/ljoukov/llm#chatgpt-subscription-models). Store settings only in ignored `.env.local`; `server.mjs` loads it before importing the backend. Credentials are not embedded in browser assets, returned through the API, or logged by agent runs.

## Quote behavior

Agents explain repairs, ask scope questions, compare the supplied catalog facts, and generate downloadable itemized estimates. Code performs quote arithmetic; the model chooses the scope and explains the result.

- A leaking faucet being replaced counts as one faucet job, rather than separate leak and replacement charges.
- GoodHands applies its fictional 10% bundle discount to two or more distinct catalog services.
- Diagnostic visits are listed separately and credited when work proceeds where the catalog specifies a credit.
- Estimates remain conditional on inspection and final scope.
- Transcripts and the latest estimate survive reloads in the same tab using provider-specific `sessionStorage`. **Start over** clears that provider’s conversation.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server status and explicit model mapping; not an inference-readiness probe |
| `GET` | `/api/providers` | Structured fictional catalogs for all three providers |
| `POST` | `/api/chat` | Streaming vendor-agent conversation |

Chat request:

```json
{
  "provider": "stillwater",
  "sessionId": "buyer-demo-1",
  "messages": [
    { "role": "user", "content": "Estimate a faucet replacement. Do not book anything." }
  ]
}
```

On follow-ups, include prior user/assistant text in alternating roles, starting and ending with a user. Exclude the widget’s static greeting and all system instructions. Maximum message text is 4,000 characters; total history is limited to 28,000 characters and at most 23 alternating messages.

The response is newline-delimited JSON (`application/x-ndjson`):

```json
{"type":"delta","text":"A faucet replacement…"}
{"type":"quote","quote":{"provider":"stillwater","items":[],"min":125,"max":225}}
{"type":"done","model":"chatgpt-luna-6-fast","libraryModel":"chatgpt-gpt-6-luna-fast","sessionId":"buyer-demo-1"}
```

The quote example abbreviates the full object. Actual quotes include item ranges, subtotal, applied discount, diagnostic policy, deposit percentage, terms, currency, and fictional status. Event order follows the model’s tool execution.

Errors before streaming use an HTTP error and JSON `{ "error": "…" }`. Errors during streaming emit `{ "type": "error", "message": "…" }` without a `done` event.

## Request boundaries

The shared backend limits request sizes, message history, per-session rate, and concurrent requests. It rejects foreign browser origins, unrecognized hostnames, privileged message roles, and obvious card numbers or credential-shaped messages before they reach the model. Locally, only loopback hosts are accepted. On Vercel, only the project’s deployment, branch, and production domains (plus optional `APP_ORIGIN`) are accepted over HTTPS.

Same-origin browser requests and local CLI clients are supported. No CORS permission is granted to other origins. The API exposes no payment, booking, email, filesystem, or subagent action.

Rate and concurrency counters are held in memory per server instance; they are not global limits across Vercel instances. These checks are demo boundaries, not a complete sensitive-data detector or an implementation of the proposed rehearsal/review/commit harness.

## Verification

Run `npm run check` from the repository root. The eight tests cover quote and diagnostic arithmetic, invalid scopes, local and hosted origin enforcement, credential rejection, and message validation.
