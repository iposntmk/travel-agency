import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());
const nodeEnv = z.enum(["development", "test", "production"]).default("development");
const booleanFlag = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(["true", "false"]).default("false").transform((value) => value === "true")
);

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: optionalUrl,
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
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  ALLOW_INDEXING: booleanFlag,
  DEV_ORIGIN: optionalUrl,
  NODE_ENV: nodeEnv
});

export type Env = z.infer<typeof envSchema>;

export const payloadConfigEnvSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: optionalUrl,
    PAYLOAD_SECRET: z.string().min(32),
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    DEV_ORIGIN: optionalUrl,
    PAYLOAD_COMMAND: z.string().optional(),
    NODE_ENV: nodeEnv
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && !env.NEXT_PUBLIC_SITE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NEXT_PUBLIC_SITE_URL is required in production"
      });
    }
  });

export type PayloadConfigEnv = z.infer<typeof payloadConfigEnvSchema>;

export const nextConfigEnvSchema = z.object({
  ALLOW_INDEXING: booleanFlag,
  DEV_ORIGIN: optionalUrl,
  R2_PUBLIC_URL: optionalUrl
});

export type NextConfigEnv = z.infer<typeof nextConfigEnvSchema>;

export const seoEnvSchema = z.object({
  ALLOW_INDEXING: booleanFlag,
  NEXT_PUBLIC_SITE_URL: optionalUrl
});

export type SeoEnv = z.infer<typeof seoEnvSchema>;

export const healthEnvSchema = z.object({
  VERCEL_REGION: z.string().optional()
});

export type HealthEnv = z.infer<typeof healthEnvSchema>;

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

export function parseNextConfigEnv(source: Record<string, string | undefined>): NextConfigEnv {
  return nextConfigEnvSchema.parse(source);
}

export function parseSeoEnv(source: Record<string, string | undefined>): SeoEnv {
  return seoEnvSchema.parse(source);
}

export function parseHealthEnv(source: Record<string, string | undefined>): HealthEnv {
  return healthEnvSchema.parse(source);
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

let cachedNextConfigEnv: NextConfigEnv | undefined;

export function getNextConfigEnv(): NextConfigEnv {
  if (!cachedNextConfigEnv) {
    cachedNextConfigEnv = parseNextConfigEnv(process.env);
  }

  return cachedNextConfigEnv;
}

let cachedSeoEnv: SeoEnv | undefined;

export function getSeoEnv(): SeoEnv {
  if (!cachedSeoEnv) {
    cachedSeoEnv = parseSeoEnv(process.env);
  }

  return cachedSeoEnv;
}

export function getSiteUrl(): string {
  return getSeoEnv().NEXT_PUBLIC_SITE_URL!;
}

let cachedHealthEnv: HealthEnv | undefined;

export function getHealthEnv(): HealthEnv {
  if (!cachedHealthEnv) {
    cachedHealthEnv = parseHealthEnv(process.env);
  }

  return cachedHealthEnv;
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
