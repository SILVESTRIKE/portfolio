/*
Reason for existence: Upstash Redis REST client with dual-layer in-memory fallback for persisting music metadata and YouTube videoId mappings without third-party dependencies.
System impact if absent: Server cannot persist song-to-videoId mappings across serverless invocations, causing rapid exhaustion of YouTube Data API quotas.
*/

const inMemoryStore = new Map<string, { value: string; expiresAt?: number }>();

function getEnvUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL;
}

function getEnvToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN;
}

/**
 * Execute a raw Redis command via Upstash REST API.
 * Falls back transparently to in-memory store if Redis credentials are not configured.
 */
async function executeUpstashCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const url = getEnvUrl();
  const token = getEnvToken();

  if (!url || !token) {
    return null;
  }

  try {
    const cleanUrl = url.replace(/\/+$/, '');
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command),
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { result?: T; error?: string };
    if (data.error) {
      return null;
    }

    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  // L1 Check: In-memory store
  const localItem = inMemoryStore.get(key);
  if (localItem) {
    if (!localItem.expiresAt || localItem.expiresAt > Date.now()) {
      return localItem.value;
    }
    inMemoryStore.delete(key);
  }

  // L2 Check: Upstash Redis REST
  const result = await executeUpstashCommand<string>(['GET', key]);
  if (typeof result === 'string') {
    inMemoryStore.set(key, { value: result });
    return result;
  }

  return null;
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<boolean> {
  // Update L1 in-memory
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
  inMemoryStore.set(key, { value, expiresAt });

  // Update L2 Upstash Redis REST
  const command: (string | number)[] = ttlSeconds
    ? ['SET', key, value, 'EX', ttlSeconds]
    : ['SET', key, value];

  const result = await executeUpstashCommand<string>(command);
  return result !== null;
}

export async function redisMGet(keys: string[]): Promise<Record<string, string | null>> {
  const output: Record<string, string | null> = {};
  if (keys.length === 0) return output;

  const missingKeys: string[] = [];

  for (const k of keys) {
    const item = inMemoryStore.get(k);
    if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
      output[k] = item.value;
    } else {
      missingKeys.push(k);
    }
  }

  if (missingKeys.length > 0 && getEnvUrl() && getEnvToken()) {
    try {
      const results = await executeUpstashCommand<(string | null)[]>(['MGET', ...missingKeys]);
      if (Array.isArray(results)) {
        missingKeys.forEach((k, idx) => {
          const val = results[idx] ?? null;
          output[k] = val;
          if (val) {
            inMemoryStore.set(k, { value: val });
          }
        });
      }
    } catch {
      missingKeys.forEach(k => {
        output[k] = output[k] ?? null;
      });
    }
  } else {
    missingKeys.forEach(k => {
      output[k] = output[k] ?? null;
    });
  }

  return output;
}
