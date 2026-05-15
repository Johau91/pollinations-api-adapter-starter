import { loadEnv } from './load-env.js';
import { createPollinationsClient } from '../src/pollinations-client.js';

loadEnv();

const client = createPollinationsClient({
  apiKey: process.env.POLLINATIONS_API_KEY,
});

const status = await client.getStatus();

console.log({
  balance: status.balance,
  tier: status.tier || null,
  nextResetAt: status.nextResetAt ? new Date(status.nextResetAt).toISOString() : null,
});
