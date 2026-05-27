import "server-only";

import { getBookingRateLimitEnv, type BookingRateLimitEnv } from "@/config/env";

type Bucket = {
  count: number;
  resetAt: number;
};

type Fetcher = typeof fetch;

type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
  keyPrefix?: string;
  env?: BookingRateLimitEnv | null;
  fetcher?: Fetcher;
};

type UpstashPipelineEntry = {
  result?: unknown;
  error?: string;
};

const buckets = new Map<string, Bucket>();

export async function checkRateLimit(key: string, options: RateLimitOptions = {}): Promise<boolean> {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 60_000;
  const keyPrefix = options.keyPrefix ?? "booking-submit";
  const env = options.env === undefined ? getBookingRateLimitEnv() : options.env;
  const normalizedKey = normalizeKey(key);

  if (!env) {
    return checkLocalRateLimit(`${keyPrefix}:${normalizedKey}`, limit, windowMs);
  }

  try {
    return await checkRedisRateLimit(normalizedKey, limit, windowMs, keyPrefix, env, options.fetcher ?? fetch);
  } catch {
    return checkLocalRateLimit(`redis-fallback:${keyPrefix}:${normalizedKey}`, limit, windowMs);
  }
}

export function resetRateLimit(): void {
  buckets.clear();
}

function checkLocalRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  keyPrefix: string,
  env: BookingRateLimitEnv,
  fetcher: Fetcher
): Promise<boolean> {
  const redisKey = `rate-limit:${keyPrefix}:${key}`;
  const expiresInSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const response = await fetcher(`${trimTrailingSlash(env.UPSTASH_REDIS_REST_URL)}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, expiresInSeconds, "NX"]
    ])
  });

  if (!response.ok) {
    throw new Error("Redis rate limit request failed");
  }

  const data = (await response.json()) as UpstashPipelineEntry[];
  const countResult = data[0];

  if (!Array.isArray(data) || countResult?.error) {
    throw new Error("Redis rate limit response failed");
  }

  const count = Number(countResult.result);
  if (!Number.isFinite(count)) {
    throw new Error("Redis rate limit count was invalid");
  }

  return count <= limit;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9@._:-]+/g, "-").slice(0, 240) || "anonymous";
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
