# Vercel deployment

All pages and the vendor API live in one project: [`ljoukovs-projects/web-verse`](https://vercel.com/ljoukovs-projects/web-verse). The public domain is [`web-verse-five.vercel.app`](https://web-verse-five.vercel.app/).

## Git integration

The project imports [`ljoukov/web-verse`](https://github.com/ljoukov/web-verse), with `main` as the production branch. Pushes to `main` build and publish production automatically. Other branches produce previews using Vercel’s normal Git integration.

The Node application preset captures `server.mjs` as the server entrypoint. [`vercel.json`](../vercel.json) sets a 90-second function duration and includes `public/**` for filesystem-backed page serving. Static frontend assets and the API share the same origin. There is no frontend build step.

## Server configuration

Production and Preview use these project environment variables:

- `CHATGPT_AUTH_TOKEN_PROVIDER_URL`
- `CHATGPT_AUTH_TOKEN_PROVIDER_API_KEY`

Both are stored as sensitive Vercel environment variables. They are available only to server code; keep values out of Git, frontend assets, screenshots, and logs. Environment changes take effect in subsequent deployments.

The origin guard uses Vercel’s project-controlled deployment, branch, and production URLs. Set `APP_ORIGIN` to the exact HTTPS origin if adding a custom domain. Local development retains its loopback-only guard.

Rate limits are per running instance, rather than a durable shared quota. Vendor conversations are client-held and passed back as message history; no server-side conversation store is required.

## Local CLI

For operators already authenticated to the project’s team:

```sh
vercel link --yes --scope ljoukovs-projects --project web-verse
vercel env ls --scope ljoukovs-projects
vercel inspect https://web-verse-five.vercel.app --scope ljoukovs-projects
```

The ignored `.vercel/` directory holds the local project link. `.vercelignore` excludes environment files, local artifacts, and other files not needed in the hosted app.

## Verify a release

Check `/workspace/`, `/stillwater/`, `/goodhands/`, and `/formfield/`, then `/api/health` and `/api/providers`. Health reports the model mapping; it does not prove inference is working. Send a vendor chat request and confirm streamed text, an itemized quote, and a final `done` event to verify inference. The kitchen workspace remains a scripted presentation and does not call the vendor API.
