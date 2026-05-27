import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/services/rate-limit";
import type { BookingRateLimitEnv } from "@/config/env";

const redisEnv: BookingRateLimitEnv = {
  UPSTASH_REDIS_REST_URL: "https://redis.example.com/",
  UPSTASH_REDIS_REST_TOKEN: "redis-token",
  NODE_ENV: "test"
};

describe("rate limit service", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it("uses Upstash Redis REST when configured", async () => {
    const fetchMock = vi.fn(async () => jsonResponse([{ result: 1 }, { result: 1 }]));

    const allowed = await checkRateLimit("Jane@Example.test", {
      env: redisEnv,
      fetcher: fetchMock as unknown as typeof fetch
    });

    expect(allowed).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://redis.example.com/pipeline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer redis-token" })
      })
    );

    const body = JSON.parse(String(requestInit(fetchMock.mock.calls[0]).body));
    expect(body).toEqual([
      ["INCR", "rate-limit:booking-submit:jane@example.test"],
      ["EXPIRE", "rate-limit:booking-submit:jane@example.test", 60, "NX"]
    ]);
  });

  it("rejects requests over the Redis-backed limit", async () => {
    const fetchMock = vi.fn(async () => jsonResponse([{ result: 6 }, { result: 0 }]));

    const allowed = await checkRateLimit("limited-user", {
      env: redisEnv,
      fetcher: fetchMock as unknown as typeof fetch
    });

    expect(allowed).toBe(false);
  });

  it("falls back to a local bucket when Redis is unavailable", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Redis unavailable");
    });

    expect(
      await checkRateLimit("fallback-user", {
        env: redisEnv,
        fetcher: fetchMock as unknown as typeof fetch,
        limit: 1
      })
    ).toBe(true);
    expect(
      await checkRateLimit("fallback-user", {
        env: redisEnv,
        fetcher: fetchMock as unknown as typeof fetch,
        limit: 1
      })
    ).toBe(false);
  });
});

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function requestInit(call: unknown): RequestInit {
  return (call as [unknown, RequestInit])[1];
}
