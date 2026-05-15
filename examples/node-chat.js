import { loadEnv } from './load-env.js';
import { createPollinationsClient, PollinationsQuotaError } from '../src/pollinations-client.js';

loadEnv();

const client = createPollinationsClient({
  apiKey: process.env.POLLINATIONS_API_KEY,
});

try {
  const text = await client.chatText({
    messages: [
      {
        role: 'user',
        content: 'Write one practical sentence about using open-source AI APIs safely.',
      },
    ],
  });
  console.log(text);
} catch (error) {
  if (error instanceof PollinationsQuotaError) {
    console.error('Pollen quota exhausted. Next reset:', error.nextResetAt ? new Date(error.nextResetAt) : 'unknown');
    process.exit(2);
  }
  throw error;
}
