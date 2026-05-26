# Current Status

**Updated:** 2026-05-26

## Current Layer / Stage

The project is currently at **Layer 7 - Trust + Engagement started**.

Layers 1-5 have enough implementation to support the current MVP flow:

- Layer 1 Foundation: scaffold, CI scripts, env validation, Vercel setup.
- Layer 2 Core Data Models + Access Control: Payload collections, explicit access rules, migrations, Zod schemas.
- Layer 3 Media Pipeline: signed upload, R2 storage, QStash Sharp variant processing.
- Layer 4 Public Pages: Payload-backed tours, destinations, blog, sitemap, robots, metadata, JSON-LD, cached public reads.
- Layer 5 Booking Lead Engine: booking Server Action, validation, sanitization, rate-limit guard, DB-backed idempotency, Payload/Postgres persistence.

Layer 7 has started with Clerk customer sync:

- `src/app/api/webhooks/clerk/route.ts`
- `src/services/clerk-customer-sync.ts`
- `tests/api/clerk-webhook.test.ts`
- `tests/services/clerk-customer-sync.test.ts`

Last shipped commits:

- `8dae33e Sync Clerk users into Payload customers`
- `d25cedd Persist booking leads through Payload`
- `12d2086 Harden public booking submissions`
- `eda4691 Improve SEO and public page payloads`
- `64d8feb Improve Payload-backed page performance`

## Immediate Blocker

Production still needs external configuration for Clerk sync:

1. Add `CLERK_WEBHOOK_SIGNING_SECRET` to Vercel Production env.
2. Configure Clerk webhook endpoint: `https://<production-domain>/api/webhooks/clerk`.
3. Subscribe to `user.created` and `user.updated`.
4. Redeploy after adding the env var.
5. Create/update a Clerk user and verify the Payload `customers` collection is linked by `clerkUserId`.

Do not invent this secret. It must come from the Clerk Dashboard webhook endpoint signing secret.

## What The Next Dev Should Read First

Read in this order:

1. `CLAUDE.md` - repository rules and current architecture guardrails.
2. `docs/CURRENT_STATUS.md` - this handoff status.
3. `docs/DEVELOPMENT_APPROACH.md` - layer roadmap and dependency order.
4. `docs/CODING_GUIDELINES.md` - authoritative coding constraints.
5. `docs/BOOKING_FLOW.md` - booking status and payment-extension behavior.
6. `docs/DATABASE_SCHEMA.md` - Payload collection contracts.
7. `docs/MEDIA_STRATEGY.md` - R2 and Sharp media strategy.
8. `toiuu.md` - performance, SEO, security, and production readiness backlog.
9. `techStack.md` - current stack snapshot if present in the worktree.

For the current Clerk handoff, also inspect:

- `src/app/api/webhooks/clerk/route.ts`
- `src/services/clerk-customer-sync.ts`
- `src/config/env.ts`
- `.env.example`
- `tests/api/clerk-webhook.test.ts`
- `tests/services/clerk-customer-sync.test.ts`

## Remaining High-Priority Work

- Replace in-memory booking rate limiting with Redis/KV-backed production rate limiting.
- Add booking slot/capacity transaction locking if bookings mutate availability or `currentPax`.
- Finish media variant rendering and focal point/crop polish.
- Wire Resend follow-up emails for booking inquiries.
- Finish Clerk production webhook configuration and verify live sync.
- Start Layer 8 monetization work only after production booking readiness is stable.
- Start Layer 9 online payment only after Pay Later booking flow is stable and audited.

## Verification Baseline

Latest local verification before this status update:

- `pnpm typecheck` passed.
- `pnpm test` passed: 19 files, 100 tests.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before committing code changes.
