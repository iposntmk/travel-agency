import { z } from "zod";

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());
const nodeEnv = z.enum(["development", "test", "production"]).default("development");
const booleanFlag = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.enum(["true", "false"]).default("false").transform((value) => value === "true")
);
const requiredEmail = z.string().trim().email();

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: optionalUrl,
  PAYLOAD_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
  QSTASH_TOKEN: z.string().min(1),
  QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(3),
  RESEND_AUDIENCE_ID: z.string().min(1).optional(),
  BOOKING_SALES_EMAIL: requiredEmail,
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

export const clerkWebhookEnvSchema = z.object({
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1)
});

export type ClerkWebhookEnv = z.infer<typeof clerkWebhookEnvSchema>;

export const bookingRateLimitEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NODE_ENV: nodeEnv
});

export type BookingRateLimitEnv = z.infer<typeof bookingRateLimitEnvSchema>;

export const bookingEmailEnvSchema = envSchema.pick({
  RESEND_API_KEY: true,
  RESEND_FROM_EMAIL: true,
  BOOKING_SALES_EMAIL: true
});

export type BookingEmailEnv = z.infer<typeof bookingEmailEnvSchema>;

export const newsletterEnvSchema = envSchema.pick({
  RESEND_API_KEY: true,
  RESEND_AUDIENCE_ID: true
});

export type NewsletterEnv = z.infer<typeof newsletterEnvSchema>;

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

export function parseClerkWebhookEnv(source: Record<string, string | undefined>): ClerkWebhookEnv {
  return clerkWebhookEnvSchema.parse(source);
}

export function parseBookingRateLimitEnv(
  source: Record<string, string | undefined>
): BookingRateLimitEnv | undefined {
  const hasUrl = Boolean(source.UPSTASH_REDIS_REST_URL);
  const hasToken = Boolean(source.UPSTASH_REDIS_REST_TOKEN);
  const environment = nodeEnv.parse(source.NODE_ENV);

  if (!hasUrl && !hasToken) {
    if (environment === "production") {
      return bookingRateLimitEnvSchema.parse(source);
    }

    return undefined;
  }

  return bookingRateLimitEnvSchema.parse(source);
}

export function parseBookingEmailEnv(source: Record<string, string | undefined>): BookingEmailEnv {
  return bookingEmailEnvSchema.parse(source);
}

export function parseNewsletterEnv(source: Record<string, string | undefined>): NewsletterEnv {
  return newsletterEnvSchema.parse(source);
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

function createEnvGetter<T>(parseSource: (source: Record<string, string | undefined>) => T): () => T {
  let didRead = false;
  let cached: T;

  return () => {
    if (!didRead) {
      cached = parseSource(process.env);
      didRead = true;
    }

    return cached;
  };
}

export const getEnv = createEnvGetter(parseEnv);
export const getPayloadConfigEnv = createEnvGetter(parsePayloadConfigEnv);
export const getNextConfigEnv = createEnvGetter(parseNextConfigEnv);
export const getSeoEnv = createEnvGetter(parseSeoEnv);

export function getSiteUrl(): string {
  return getSeoEnv().NEXT_PUBLIC_SITE_URL!;
}

export const getHealthEnv = createEnvGetter(parseHealthEnv);
export const getClerkWebhookEnv = createEnvGetter(parseClerkWebhookEnv);
export const getBookingRateLimitEnv = createEnvGetter(parseBookingRateLimitEnv);
export const getBookingEmailEnv = createEnvGetter(parseBookingEmailEnv);
export const getNewsletterEnv = createEnvGetter(parseNewsletterEnv);
export const getPayloadStorageEnv = createEnvGetter(parsePayloadStorageEnv);
