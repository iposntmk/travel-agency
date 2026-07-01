# reCAPTCHA / Turnstile Integration Plan

**Status:** Not implemented — this document is a handoff for a future developer.

## Why

The site currently relies solely on **server-side rate limiting** (Upstash Redis) to protect 3 public forms. Rate limiting blocks brute-force by IP/email but doesn't distinguish humans from bots on the first request. Adding a CAPTCHA layer stops automated spam before it reaches the rate limit gate.

## Choice: Cloudflare Turnstile (recommended) vs Google reCAPTCHA v3

| Factor | Cloudflare Turnstile | Google reCAPTCHA v3 |
|--------|---------------------|---------------------|
| **Privacy** | No Google tracking | Requires Google TOS/Privacy |
| **UX** | Invisible (no challenge) | Invisible (score-based) |
| **Cost** | Free | Free |
| **Account needed** | Cloudflare account | Google account |
| **Badge** | Optional (CF logo) | Required unless replaced with text link |
| **API** | `turnstile.render` / server verify | `grecaptcha.execute` / server verify |

**Recommendation:** Turnstile (lighter, no Google dependency, fewer compliance concerns for a Vietnam travel agency).

## Forms to protect

1. **Booking inquiry** — `/booking/[tourSlug]` → `submitBooking` action
2. **Custom tour proposal** — `/customize-tour` → `submitCustomInquiry` action
3. **Newsletter subscribe** — footer → `subscribeNewsletter` action

All three already return typed `ActionResult` unions — the CAPTCHA error maps to a new `"captcha"` error type.

## Implementation steps

### 1. Environment variables

Add to `.env.local` and production env:

```env
# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

(Use test keys above for dev — they always pass.)

### 2. Env validation (`src/config/env.ts`)

Add:

```ts
export const captchaEnvSchema = z.object({
  TURNSTILE_SECRET_KEY: z.string().min(1)
});

export const nextConfigCaptchaEnvSchema = z.object({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1)
});

export type CaptchaEnv = z.infer<typeof captchaEnvSchema>;
export type NextConfigCaptchaEnv = z.infer<typeof nextConfigCaptchaEnvSchema>;

export function parseCaptchaEnv(source: Record<string, string | undefined>): CaptchaEnv | undefined {
  if (!source.TURNSTILE_SECRET_KEY) return undefined;
  return captchaEnvSchema.parse(source);
}

export function parseNextConfigCaptchaEnv(source: Record<string, string | undefined>): NextConfigCaptchaEnv | undefined {
  if (!source.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return undefined;
  return nextConfigCaptchaEnvSchema.parse(source);
}
```

Register getters:

```ts
export const getCaptchaEnv = createEnvGetter(parseCaptchaEnv);
export const getNextConfigCaptchaEnv = createEnvGetter(parseNextConfigCaptchaEnv);
```

### 3. Server-side verification (`src/lib/captcha.ts`)

```ts
// Turnstile server verify
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  const secret = getCaptchaEnv()?.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — allow
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) })
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}
```

**Important:** If env vars are missing (dev without Turnstile configured), the function returns `true` (pass-through) so forms still work locally.

### 4. Client component (`src/components/captcha-provider.tsx`)

```tsx
"use client";

import Script from "next/script";
import { createContext, useContext, useRef, useCallback } from "react";

interface CaptchaContextValue {
  execute: () => Promise<string | null>;
}

const CaptchaContext = createContext<CaptchaContextValue>({
  execute: async () => null
});

export function useCaptcha() {
  return useContext(CaptchaContext);
}

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const widgetId = useRef<string | null>(null);

  const execute = useCallback(async () => {
    if (typeof window === "undefined") return null;
    // @ts-expect-error Turnstile global
    if (!window.turnstile) return null;
    return new Promise<string | null>((resolve) => {
      // @ts-expect-error
      window.turnstile.execute(widgetId.current, (token: string) => resolve(token));
    });
  }, []);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      <div
        ref={(el) => {
          if (el && !widgetId.current && typeof window !== "undefined") {
            // @ts-expect-error
            widgetId.current = window.turnstile?.render(el, { "sitekey": process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY });
          }
        }}
        className="hidden"
      />
      <CaptchaContext.Provider value={{ execute }}>
        {children}
      </CaptchaContext.Provider>
    </>
  );
}
```

### 5. Wire into root layout

In `src/app/(frontend)/layout.tsx`, wrap `{children}` with `<CaptchaProvider>`.

### 6. Obtain token before Server Action calls

In each form's submit handler (client-side):

```tsx
import { useCaptcha } from "@/components/captcha-provider";

function MyForm() {
  const captcha = useCaptcha();

  async function handleSubmit(values) {
    const captchaToken = await captcha.execute();
    const result = await serverAction({ ...values, captchaToken });
  }
}
```

### 7. Update schemas — add optional field

In each Zod schema (`booking.ts`, `custom-inquiry.ts`, `newsletter.ts`), add:

```ts
captchaToken: z.string().optional()
```

The field is optional on the client so old tabs without the script still submit.

### 8. Verify in each Server Action

At the top of each action, before rate limiting:

```ts
import { verifyCaptcha } from "@/lib/captcha";
import { requestIp } from "./request-ip";

if (input.captchaToken) {
  const ip = await requestIp();
  const valid = await verifyCaptcha(input.captchaToken, ip ?? undefined);
  if (!valid) {
    return {
      ok: false,
      error: { type: "captcha", message: "Security verification failed. Please refresh and try again." }
    };
  }
}
```

### 9. Handle new error type in UI

The existing `serverError` state already renders the message. No UI changes needed — the error shows inline.

### 10. Tests

- `src/lib/__tests__/captcha.test.ts` — mock fetch, test valid/invalid/missing config
- E2E: use Turnstile test keys (always pass `1x00000000000000000000AA`)

## Rollout

1. Add env vars to Vercel (production + preview) — use real keys from Cloudflare dashboard
2. Deploy — the pass-through (`return true` when unconfigured) means no breakage if env is missing
3. Verify each form submits successfully in production
4. Check Cloudflare Turnstile analytics for token issuance / failure rates

## Files to create

| File | Purpose |
|------|---------|
| `src/config/env.ts` (edit) | Add captcha env schemas + getters |
| `src/lib/captcha.ts` | Server-side verify function |
| `src/components/captcha-provider.tsx` | Client context + Turnstile script |
| `src/app/(frontend)/layout.tsx` (edit) | Wrap with `<CaptchaProvider>` |
| `src/schemas/booking.ts` (edit) | Add `captchaToken` field |
| `src/schemas/custom-inquiry.ts` (edit) | Add `captchaToken` field |
| `src/schemas/newsletter.ts` (edit) | Add `captchaToken` field |
| `src/app/actions/submit-booking.ts` (edit) | Verify token |
| `src/app/actions/submit-custom-inquiry.ts` (edit) | Verify token |
| `src/app/actions/subscribe-newsletter.ts` (edit) | Verify token |
| `src/app/(frontend)/booking/[tourSlug]/booking-form.tsx` (edit) | Execute + send token |
| `src/app/(frontend)/customize-tour/proposal-form.tsx` (edit) | Execute + send token |
| `src/app/(frontend)/components/newsletter-form.tsx` (create/edit) | Execute + send token |
| `src/lib/__tests__/captcha.test.ts` | Unit test |

## When developer starts

1. Read this file entirely
2. `memory_recall project Travel-Agency` for cross-session context
3. Create a feature branch `feat/captcha-protection`
4. Follow steps in order (env → lib → component → schemas → actions → UI)
5. `pnpm typecheck && pnpm test && pnpm build` before committing
</file>
<parameter name="file_path" string="true">D:\Travel-Agency\docs\RECAPTCHA_PLAN.md