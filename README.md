# Pollinations API Adapter Starter

Small, framework-free examples for using the Pollinations OpenAI-compatible API from server-side JavaScript.

Demo page: https://johau91.github.io/pollinations-api-adapter-starter/

This repository intentionally contains only generic adapter code and examples. It does not include product code, business logic, user data, payment code, or private application configuration.

## What It Shows

- OpenAI-compatible chat completion calls through `gen.pollinations.ai`
- Server-side secret key handling
- Pollen balance/profile checks
- `402` quota handling with best-effort `nextResetAt`
- A compact video metadata translation example

## Quick Start

```bash
cp .env.example .env
# edit .env and set POLLINATIONS_API_KEY

node examples/node-chat.js
node examples/video-metadata-translation.js
node examples/balance-monitor.js
```

Node 20+ is enough. There are no runtime dependencies.

## Environment

```bash
POLLINATIONS_API_KEY=sk_your_secret_key_here
POLLINATIONS_MODEL=gemini-fast
```

Use secret keys only on the server. Do not put `sk_` keys in browser code, public repos, mobile apps, or logs.

## Example

```js
import { createPollinationsClient } from './src/pollinations-client.js';

const client = createPollinationsClient({
  apiKey: process.env.POLLINATIONS_API_KEY,
});

const text = await client.chatText({
  messages: [{ role: 'user', content: 'Write one sentence about open-source AI.' }],
});

console.log(text);
```

## Notes

The examples use `gemini-fast` by default because it is a practical low-latency default for many text tasks. Override it with `POLLINATIONS_MODEL` or pass `model` per request.

The adapter treats HTTP `402` as a quota event and tries to fetch the account profile so the caller can show a retry time.
