import { loadEnv } from './load-env.js';
import { createPollinationsClient, PollinationsQuotaError } from '../src/pollinations-client.js';
import { translateVideoMetadata } from '../src/video-metadata.js';

loadEnv();

const client = createPollinationsClient({
  apiKey: process.env.POLLINATIONS_API_KEY,
});

try {
  const result = await translateVideoMetadata(client, {
    title: 'How to batch translate video metadata with an AI API',
    description: 'A short walkthrough for creators who need consistent multilingual titles and descriptions.',
    targetLanguage: 'Korean',
    tone: 'clear and professional',
    excludedWords: 'Do not translate product names.',
  });

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (error instanceof PollinationsQuotaError) {
    console.error('Pollen quota exhausted. Next reset:', error.nextResetAt ? new Date(error.nextResetAt) : 'unknown');
    process.exit(2);
  }
  throw error;
}
