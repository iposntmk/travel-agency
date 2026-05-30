# Repository Guidelines

This file is a short handoff for coding agents. The active source of truth is `CLAUDE.md`; read that first.

## Current State

The repository is no longer docs-only. It contains a working Next.js 15 + Payload CMS application.

Current implementation stage: **Layer 8 - Monetization Without Payment**, with Travel Platform Expansion locally verified and pending commit/push/deploy verification.

Already implemented:

- Layer 1 Foundation: Next.js, Payload, Neon, Clerk, Tailwind, shadcn/ui, Vitest, CI, Vercel.
- Layer 2 Data Models: Payload collections and explicit access rules for users, media, destinations, partners, tours, customers, bookings, posts, comments, reviews, promotions, and payments.
- Layer 3 Media: Cloudflare R2 signed uploads and QStash Sharp variant processing.
- Layer 4 Public Pages: Payload-backed tours, destinations, blog, SEO metadata, JSON-LD, sitemap, robots, cached public reads.
- Layer 5 Booking Lead Engine: Server Action validation, sanitization, public `Pending` enforcement, DB-backed idempotency, Payload/Postgres persistence.
- Layer 7 complete enough for current production flow: Clerk webhook sync into Payload `customers`, cookie consent, and share buttons.
- Layer 8 shipped: OTA click tracking, widgets, and `/internal/affiliate-clicks` dashboard.
- Travel Platform Expansion local: car rentals, attractions, product categories, custom inquiries, team/settings, `/free-proposal`, `/car-rentals`, destination hub UX.
- Production booking readiness: Upstash Redis REST rate limiting and Resend booking emails.
- Media polish: public cropped images respect Payload `focalX` / `focalY`.

Immediate priority after expansion commit/push:

- Verify Vercel deployment and migration path.
- Finish frontend mobile QA/polish on public conversion surfaces.
- Prioritize security, performance, and SEO backlog from `docs/toiuu.md`.
- Defer runtime online payment until the end; keep schemas extensible but do not implement payment before the items above.

## Files To Read Before Continuing

Read in this order:

1. `CLAUDE.md`
2. `docs/CURRENT_STATUS.md`
3. `docs/DEVELOPMENT_APPROACH.md`
4. `docs/CODING_GUIDELINES.md`
5. Relevant domain docs for the area being touched:
   - Booking: `docs/BOOKING_FLOW.md`, `docs/DATABASE_SCHEMA.md`
   - Media: `docs/MEDIA_STRATEGY.md`
   - Performance/SEO/security backlog: `docs/toiuu.md`
   - Stack snapshot: `docs/TECH_STACK.md`

## Commands

Use `pnpm` only:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm payload:generate-types
pnpm payload:migrate:create
pnpm payload:migrate
```

Before writing code, run:

```bash
pnpm typecheck
pnpm test
```

Before committing, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Guardrails

- Do not modify `src/app/(payload)/` unless the task is specifically about Payload admin.
- Do not read `process.env` outside `src/config/env.ts` helpers.
- Use Server Actions for internal mutations.
- Use Route Handlers only for external webhooks, QStash callbacks, signed upload URLs, health checks, and similar technical endpoints.
- New booking inquiries always start as `Pending`.
- Every booking status change must append history.
- Do not add npm/yarn lockfiles.
- Do not commit `.vercel/`, `.env*.local`, or files under `API-keys/`.
