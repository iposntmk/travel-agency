import { describe, expect, it } from "vitest";
import {
  parseEnv,
  parseBookingEmailEnv,
  parseBookingRateLimitEnv,
  parseClerkWebhookEnv,
  parseNextConfigEnv,
  parsePayloadConfigEnv,
  parsePayloadStorageEnv,
  parseSeoEnv
} from "@/config/env";

const validEnv = {
  DATABASE_URL: "https://example.com/db",
  PAYLOAD_SECRET: "a".repeat(32),
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  CLERK_SECRET_KEY: "secret",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "publishable",
  R2_ACCOUNT_ID: "account",
  R2_BUCKET: "bucket",
  R2_ACCESS_KEY_ID: "access",
  R2_SECRET_ACCESS_KEY: "secret",
  R2_PUBLIC_URL: "https://cdn.example.com",
  QSTASH_TOKEN: "token",
  QSTASH_CURRENT_SIGNING_KEY: "current",
  QSTASH_NEXT_SIGNING_KEY: "next",
  UPSTASH_REDIS_REST_URL: "https://redis.example.com",
  UPSTASH_REDIS_REST_TOKEN: "redis-token",
  RESEND_API_KEY: "resend",
  RESEND_FROM_EMAIL: "An's Travel Agency <bookings@example.test>",
  BOOKING_SALES_EMAIL: "sales@example.test"
};

describe("env schema", () => {
  it("accepts the required MVP environment", () => {
    expect(parseEnv(validEnv)).toMatchObject({ ...validEnv, ALLOW_INDEXING: false });
  });

  it("fails fast when required values are missing", () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: "" })).toThrow();
  });

  it("validates the narrower Payload CLI environment separately", () => {
    expect(
      parsePayloadConfigEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        PAYLOAD_SECRET: validEnv.PAYLOAD_SECRET,
        QSTASH_TOKEN: ""
      })
    ).toEqual({
      DATABASE_URL: validEnv.DATABASE_URL,
      PAYLOAD_SECRET: validEnv.PAYLOAD_SECRET,
      NODE_ENV: "development"
    });
  });

  it("accepts an optional unpooled database URL for migrations", () => {
    const directUrl = "https://example.com/direct-db";

    expect(parseEnv({ ...validEnv, DATABASE_URL_UNPOOLED: directUrl })).toMatchObject({
      DATABASE_URL_UNPOOLED: directUrl
    });
    expect(
      parsePayloadConfigEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        DATABASE_URL_UNPOOLED: directUrl,
        PAYLOAD_SECRET: validEnv.PAYLOAD_SECRET
      })
    ).toMatchObject({
      DATABASE_URL_UNPOOLED: directUrl
    });
  });

  it("validates the Clerk webhook signing secret separately", () => {
    expect(parseEnv({ ...validEnv, CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test" })).toMatchObject({
      CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test"
    });
    expect(parseClerkWebhookEnv({ CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test" })).toEqual({
      CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test"
    });
    expect(() => parseClerkWebhookEnv({})).toThrow();
  });

  it("requires Redis rate limit env in production but permits local fallback", () => {
    expect(parseBookingRateLimitEnv(validEnv)).toMatchObject({
      UPSTASH_REDIS_REST_URL: validEnv.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: validEnv.UPSTASH_REDIS_REST_TOKEN
    });

    expect(parseBookingRateLimitEnv({ NODE_ENV: "test" })).toBeUndefined();
    expect(() => parseBookingRateLimitEnv({ NODE_ENV: "production" })).toThrow();
  });

  it("validates booking email routing env separately", () => {
    expect(parseBookingEmailEnv(validEnv)).toEqual({
      RESEND_API_KEY: validEnv.RESEND_API_KEY,
      RESEND_FROM_EMAIL: validEnv.RESEND_FROM_EMAIL,
      BOOKING_SALES_EMAIL: validEnv.BOOKING_SALES_EMAIL
    });

    expect(() => parseBookingEmailEnv({ ...validEnv, BOOKING_SALES_EMAIL: "bad" })).toThrow();
  });

  it("normalizes optional local dev origins", () => {
    expect(parseNextConfigEnv({ DEV_ORIGIN: "" })).toEqual({ ALLOW_INDEXING: false });
    expect(parseNextConfigEnv({ R2_PUBLIC_URL: validEnv.R2_PUBLIC_URL })).toEqual({
      ALLOW_INDEXING: false,
      R2_PUBLIC_URL: validEnv.R2_PUBLIC_URL
    });

    expect(
      parsePayloadConfigEnv({
        DATABASE_URL: validEnv.DATABASE_URL,
        PAYLOAD_SECRET: validEnv.PAYLOAD_SECRET,
        DEV_ORIGIN: "http://192.168.2.7:3000"
      })
    ).toMatchObject({
      DEV_ORIGIN: "http://192.168.2.7:3000",
      NODE_ENV: "development"
    });
  });

  it("keeps indexing disabled unless explicitly allowed", () => {
    expect(parseSeoEnv({})).toEqual({ ALLOW_INDEXING: false });
    expect(parseSeoEnv({ ALLOW_INDEXING: "true" })).toEqual({ ALLOW_INDEXING: true });
    expect(parseSeoEnv({ ALLOW_INDEXING: "false", NEXT_PUBLIC_SITE_URL: validEnv.NEXT_PUBLIC_SITE_URL })).toEqual({
      ALLOW_INDEXING: false,
      NEXT_PUBLIC_SITE_URL: validEnv.NEXT_PUBLIC_SITE_URL
    });
  });

  it("enables Payload storage config only when all R2 values exist", () => {
    expect(parsePayloadStorageEnv(validEnv)).toMatchObject({
      R2_ACCOUNT_ID: validEnv.R2_ACCOUNT_ID,
      R2_BUCKET: validEnv.R2_BUCKET,
      R2_ACCESS_KEY_ID: validEnv.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: validEnv.R2_SECRET_ACCESS_KEY,
      R2_PUBLIC_URL: validEnv.R2_PUBLIC_URL
    });

    expect(
      parsePayloadStorageEnv({
        ...validEnv,
        R2_ACCESS_KEY_ID: ""
      })
    ).toBeUndefined();
  });
});
