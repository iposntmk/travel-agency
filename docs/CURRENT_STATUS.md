# Current Status

**Updated:** 2026-05-27

## Current Layer / Stage

The project is currently at **Layer 7 - Trust + Engagement started**.

Layers 1-5 have enough implementation to support the current MVP flow:

- Layer 1 Foundation: scaffold, CI scripts, env validation, Vercel setup.
- Layer 2 Core Data Models + Access Control: Payload collections, explicit access rules, migrations, Zod schemas.
- Layer 3 Media Pipeline: signed upload, R2 storage, QStash Sharp variant processing, public focal-point rendering.
- Layer 4 Public Pages: Payload-backed tours, destinations, blog, sitemap, robots, metadata, JSON-LD, cached public reads.
- Layer 5 Booking Lead Engine: booking Server Action, validation, sanitization, Upstash Redis-backed rate-limit guard, DB-backed idempotency, Payload/Postgres persistence, Resend customer/internal booking emails.

Layer 7 has started with Clerk customer sync:

- `src/app/api/webhooks/clerk/route.ts`
- `src/services/clerk-customer-sync.ts`
- `tests/api/clerk-webhook.test.ts`
- `tests/services/clerk-customer-sync.test.ts`

Production-readiness work that has landed after the original Clerk handoff:

- `e8553df Harden booking submissions for production readiness`
  - Adds Upstash Redis REST rate limiting for public booking submissions.
  - Adds Resend booking confirmation email to the customer and internal notification to sales/admin.
  - Keeps booking creation idempotent if email delivery fails.
  - Adds env schema entries for Redis and booking email routing.
- `e7ef37f Respect media focal points in public images`
  - Uses Payload `focalX` / `focalY` for public cropped hero, card, and gallery images.
  - Adds tests for focal point rounding and bounds clamping.

Local `.env` was redacted-reviewed on 2026-05-27 and passes `parseEnv()`, including Clerk webhook, Upstash Redis REST, Resend, R2, QStash, Neon, and Payload vars.

Last shipped commits:

- `e7ef37f Respect media focal points in public images`
- `e8553df Harden booking submissions for production readiness`
- `8dae33e Sync Clerk users into Payload customers`
- `d25cedd Persist booking leads through Payload`
- `12d2086 Harden public booking submissions`
- `eda4691 Improve SEO and public page payloads`
- `64d8feb Improve Payload-backed page performance`

## Immediate Production Follow-Up

Production still needs dashboard-level configuration and live verification:

1. ~~Ensure Vercel Production has the same required envs now present locally.~~ **Done** — `CLERK_WEBHOOK_SIGNING_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_FROM_EMAIL`, `BOOKING_SALES_EMAIL` synced via `vercel env add` on 2026-05-27 and production redeployed.
2. ~~Configure Clerk webhook endpoint and subscribe to `user.created` / `user.updated`.~~ **Done** on Clerk Dashboard 2026-05-27.
3. ~~Disable Vercel Deployment Protection (was blocking the webhook with 401).~~ **Done** — `ssoProtection` patched to `null` via `vercel api PATCH /v9/projects/...` on 2026-05-27.
4. ~~Verify Clerk → Payload customer sync end-to-end.~~ **Done** — `pnpm qa:clerk-sync` creates a throwaway Clerk user, waits for the webhook, asserts the matching Payload `customers` row, and cleans up. Last run 2026-05-27: sync working.
5. Submit one real booking inquiry and verify:
   - Booking is created once with status `Pending`.
   - Customer receives confirmation email.
   - Sales/admin receives internal notification.
   - Rate limiting uses Upstash Redis rather than per-instance memory.

Do not invent this secret. It must come from the Clerk Dashboard webhook endpoint signing secret.

## Search Engine Indexing — Currently Disabled

The production site is **fully closed to search engines and AI crawlers** by design while we finish MVP shake-out. This is not an oversight — leave it as is until the criteria below are met.

Mechanics:

- `ALLOW_INDEXING` is not set on Vercel; the Zod schema in `src/config/env.ts` defaults it to `false`.
- When `ALLOW_INDEXING` is falsy, `next.config.ts` emits `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` on every response.
- `src/app/(frontend)/layout.tsx` also emits `<meta robots="noindex, nofollow">`.
- `src/app/robots.ts` blocks `/admin`, `/api`, `/booking/`, and any URL with a query string (`/*?*`).

Do **not** enable indexing until all of these are signed off:

1. Live booking submission + Resend customer/sales email verified on production.
2. Live Clerk webhook verified — Payload `customers` row created on `user.created`.
3. Content is final (no `[Sample]` rows, no placeholder copy, no test bookings).
4. Canonical, sitemap, and JSON-LD checked on the production domain.
5. Domain decision made — `tc-travel-vietnam.vercel.app` should not be the canonical search target; pick the real domain first.

When ready to allow indexing:

1. Set `ALLOW_INDEXING=true` on Vercel Production via the dashboard or `vercel env add ALLOW_INDEXING production`.
2. Redeploy production.
3. `curl -I https://<production-domain>/` — confirm there is no `X-Robots-Tag: noindex` header.
4. Submit sitemap to Google Search Console + Bing Webmaster Tools.

## What The Next Dev Should Read First

Read in this order:

1. `CLAUDE.md` - repository rules and current architecture guardrails.
2. `docs/CURRENT_STATUS.md` - this handoff status.
3. `docs/DEVELOPMENT_APPROACH.md` - layer roadmap and dependency order.
4. `docs/CODING_GUIDELINES.md` - authoritative coding constraints.
5. `docs/BOOKING_FLOW.md` - booking status and payment-extension behavior.
6. `docs/DATABASE_SCHEMA.md` - Payload collection contracts.
7. `docs/MEDIA_STRATEGY.md` - R2 and Sharp media strategy.
8. `docs/toiuu.md` - performance, SEO, security, and production readiness backlog.
9. `docs/TECH_STACK.md` - current stack snapshot.

For the current Clerk handoff, also inspect:

- `src/app/api/webhooks/clerk/route.ts`
- `src/services/clerk-customer-sync.ts`
- `src/config/env.ts`
- `.env.example`
- `tests/api/clerk-webhook.test.ts`
- `tests/services/clerk-customer-sync.test.ts`

## Remaining High-Priority Work

- Finish Clerk production webhook configuration and verify live sync.
- Verify Vercel Production envs/redeploy for Redis rate limiting and Resend booking emails.
- Add booking slot/capacity transaction locking if bookings mutate availability or `currentPax`.
- Continue media/performance backlog in `docs/toiuu.md`, especially the P0/P1 items not yet landed:
  - Vercel function region pinning to Singapore.
  - Neon pooler URL/pool tuning.
  - R2 cache-control/preconnect audit.
  - Image strategy reconciliation after R2 variants: decide whether to keep pre-rendered variants only or re-enable Next image optimization for selected cases.
- Add manual QA for a production booking submit and email delivery.
- Start Layer 8 monetization work only after production booking readiness is stable.
- Start Layer 9 online payment only after Pay Later booking flow is stable and audited.

## Verification Baseline

Latest local verification before this status update:

- `pnpm typecheck` passed.
- `pnpm test` passed: 21 files, 110 tests.
- `pnpm lint` passed.
- `pnpm build` passed after `.env` was updated and env schema validation passed.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before committing code changes.
