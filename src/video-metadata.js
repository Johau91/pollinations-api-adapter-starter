function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function buildVideoMetadataPrompt({
  title,
  description,
  targetLanguage,
  tone = 'natural',
  excludedWords = '',
}) {
  const system = [
    'You translate video metadata for creators.',
    'Return only valid JSON.',
    'Keep titles concise, preserve names and brand terms, and avoid clickbait.',
    'Generate useful tags and hashtags in the target language when appropriate.',
  ].join(' ');

  const user = JSON.stringify(
    {
      task: 'Translate video title and description metadata.',
      targetLanguage,
      tone,
      excludedWords,
      source: { title, description },
      outputSchema: {
        title: 'string',
        description: 'string',
        tags: ['string'],
        hashtags: ['string'],
      },
    },
    null,
    2,
  );

  return {
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
}

export async function translateVideoMetadata(client, input) {
  const { messages } = buildVideoMetadataPrompt(input);
  const content = await client.chatText({
    messages,
    temperature: 0.4,
    maxTokens: 2048,
  });

  const parsed = extractJson(content);
  return {
    title: String(parsed.title || ''),
    description: String(parsed.description || ''),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 20) : [],
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String).slice(0, 10) : [],
  };
}
