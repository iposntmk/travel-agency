import { describe, expect, it } from "vitest";
import { parseEnv, parsePayloadConfigEnv } from "@/config/env";

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
  RESEND_API_KEY: "resend"
};

describe("env schema", () => {
  it("accepts the required MVP environment", () => {
    expect(parseEnv(validEnv)).toMatchObject(validEnv);
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
      PAYLOAD_SECRET: validEnv.PAYLOAD_SECRET
    });
  });
});
