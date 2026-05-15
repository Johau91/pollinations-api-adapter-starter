const DEFAULT_BASE_URL = 'https://gen.pollinations.ai';
const DEFAULT_MODEL = 'gemini-fast';

export class PollinationsQuotaError extends Error {
  constructor({ message = 'Pollinations quota exhausted', nextResetAt } = {}) {
    super(message);
    this.name = 'PollinationsQuotaError';
    this.code = 'POLLINATIONS_QUOTA_EXHAUSTED';
    this.nextResetAt = nextResetAt;
  }
}

export function normalizeResetTime(value) {
  if (typeof value === 'number') {
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

export function createPollinationsClient({
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  model = process.env.POLLINATIONS_MODEL || DEFAULT_MODEL,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!apiKey) {
    throw new Error('POLLINATIONS_API_KEY is required');
  }
  if (!fetchImpl) {
    throw new Error('A fetch implementation is required');
  }

  const request = async (path, options = {}) => {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) delete headers[key];
    }

    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 402) {
      const profile = await getProfile().catch(() => null);
      throw new PollinationsQuotaError({
        nextResetAt: normalizeResetTime(profile?.nextResetAt),
      });
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Pollinations API error ${response.status}: ${body || response.statusText}`);
    }

    return response;
  };

  const getProfile = async () => {
    const response = await request('/account/profile', {
      method: 'GET',
      headers: { 'Content-Type': undefined },
    });
    return response.json();
  };

  const getBalance = async () => {
    const response = await request('/account/balance', {
      method: 'GET',
      headers: { 'Content-Type': undefined },
    });
    const data = await response.json();
    return typeof data.balance === 'number' ? data.balance : 0;
  };

  return {
    async chat({
      messages,
      model: requestModel = model,
      temperature = 0.6,
      maxTokens = 4096,
      responseFormat,
    }) {
      const response = await request('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: requestModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(responseFormat ? { response_format: responseFormat } : {}),
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Pollinations');
      }

      return { content, raw: data };
    },

    async chatText(input) {
      const result = await this.chat(input);
      return result.content;
    },

    getBalance,
    getProfile,

    async getStatus() {
      const [balance, profile] = await Promise.all([getBalance(), getProfile()]);
      return {
        balance,
        tier: profile?.tier,
        nextResetAt: normalizeResetTime(profile?.nextResetAt),
        profile,
      };
    },
  };
}
