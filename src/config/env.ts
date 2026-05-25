import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
  QSTASH_TOKEN: z.string().min(1),
  QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SENTRY_DSN: z.string().url().optional().or(z.literal(""))
});

export type Env = z.infer<typeof envSchema>;

export const payloadConfigEnvSchema = envSchema.pick({
  DATABASE_URL: true,
  PAYLOAD_SECRET: true
});

export type PayloadConfigEnv = z.infer<typeof payloadConfigEnvSchema>;

export const payloadStorageEnvSchema = envSchema.pick({
  R2_ACCOUNT_ID: true,
  R2_BUCKET: true,
  R2_ACCESS_KEY_ID: true,
  R2_SECRET_ACCESS_KEY: true,
  R2_PUBLIC_URL: true
});

export type PayloadStorageEnv = z.infer<typeof payloadStorageEnvSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}

export function parsePayloadConfigEnv(source: Record<string, string | undefined>): PayloadConfigEnv {
  return payloadConfigEnvSchema.parse(source);
}

export function parsePayloadStorageEnv(
  source: Record<string, string | undefined>
): PayloadStorageEnv | undefined {
  const values = {
    R2_ACCOUNT_ID: source.R2_ACCOUNT_ID,
    R2_BUCKET: source.R2_BUCKET,
    R2_ACCESS_KEY_ID: source.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: source.R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_URL: source.R2_PUBLIC_URL
  };

  if (!Object.values(values).every(Boolean)) {
    return undefined;
  }

  return payloadStorageEnvSchema.parse(values);
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }

  return cachedEnv;
}

let cachedPayloadConfigEnv: PayloadConfigEnv | undefined;

export function getPayloadConfigEnv(): PayloadConfigEnv {
  if (!cachedPayloadConfigEnv) {
    cachedPayloadConfigEnv = parsePayloadConfigEnv(process.env);
  }

  return cachedPayloadConfigEnv;
}

let cachedPayloadStorageEnv: PayloadStorageEnv | undefined;
let didReadPayloadStorageEnv = false;

export function getPayloadStorageEnv(): PayloadStorageEnv | undefined {
  if (!didReadPayloadStorageEnv) {
    cachedPayloadStorageEnv = parsePayloadStorageEnv(process.env);
    didReadPayloadStorageEnv = true;
  }

  return cachedPayloadStorageEnv;
}
