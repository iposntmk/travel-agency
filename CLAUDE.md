# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                        # start Next.js dev server (localhost:3000)
pnpm build                      # production build
pnpm lint                       # ESLint
pnpm typecheck                  # tsc --noEmit
pnpm test                       # run all tests with Vitest
pnpm test -- tests/actions/submit-booking.test.ts  # run a single test file

# Payload CMS
pnpm payload:generate-types     # regenerate src/payload-types.ts after schema changes
pnpm payload:migrate:create     # create new migration after collection changes
pnpm payload:migrate            # run pending migrations
pnpm seed                       # seed sample data via scripts/seed.ts
```

Package manager is **pnpm** only — do not introduce npm/yarn lockfiles.

## Architecture

### Route groups

- `src/app/(frontend)/` — public-facing Next.js pages (Server Components by default)
- `src/app/(payload)/` — Payload CMS admin panel and API routes (do not modify)
- `src/app/actions/` — Next.js Server Actions for internal mutations
- `src/app/actions/` Route Handlers (`route.ts`) are reserved for external webhooks, QStash callbacks, signed upload URLs, and health checks only — never for internal form mutations

### Core directories

```
src/
  collections/         # Payload collection configs + access control contracts
  collections/payload/ # Actual Payload CollectionConfig objects (Users, Media)
  schemas/             # Shared Zod schemas (booking, customer, partner, payment, env)
  services/            # Pure business logic (no React, no Payload config)
  types/domain.ts      # Canonical domain types (BookingRecord, BookingStatus, etc.)
  config/env.ts        # Central env validation — always use getEnv(), never read process.env directly
  lib/sample-data.ts   # Static seed data used by frontend until Payload reads are wired in
tests/
  schemas/             # Zod schema unit tests
  services/            # Service unit tests (booking-transitions, etc.)
  actions/             # Server Action integration tests
  collections/         # Access control tests
```

### Key design constraints

**Booking status machine** — new inquiries always start as `Pending`. Valid transitions are enforced in `src/services/booking-transitions.ts`:
```
New → Pending → Confirmed - Pay Later → Confirmed - Paid → Completed
                                      ↘ Cancelled
                           ↘ Cancelled
```
Admin reversal requires an explicit audit reason. Every status change appends a `StatusHistoryEntry` (actor, source, reason, timestamps) — never overwrite history.

**Idempotency** — booking submissions, payment webhooks, signed upload callbacks, and QStash jobs must all be idempotent. The booking repository deduplicates on `idempotencyKey`; the current in-memory implementation in `booking-repository.ts` is a placeholder to be replaced with Payload writes.

**Server Actions return typed unions** — always `{ ok: true; data: T } | { ok: false; error: { type: "validation" | "business" | "rate-limit" | "system"; message: string; fieldErrors?: ... } }`. UI must not parse thrown exceptions for expected failures.

**Validation is 3-tier** — (1) React Hook Form + Zod resolver in UI, (2) Zod `.safeParse()` at the top of every Server Action, (3) Payload hooks for business-limit enforcement. Zod schemas live in `src/schemas/` and are shared between client and server.

**Access control** — `src/collections/access.ts` defines role helpers (`publicRead`, `staffOnly`, `adminOnly`, `isAuthenticated`). `src/collections/contracts.ts` declares the access matrix for every planned collection. Every Payload collection must have explicit access rules — never leave access undefined.

**Environment variables** — all env vars are validated at startup via the Zod schema in `src/config/env.ts`. Import `getEnv()` from there instead of reading `process.env` in arbitrary modules.

**File size limits** — UI components: 150 lines max. Server Actions and Services: 250 lines max. Payload collection configs: 200 lines max. Extract complex Payload lifecycle hooks into a `/hooks` subdirectory.

### Current build state (Layer 1–4 in progress)

- Foundation scaffolded: Next.js 15, Payload CMS, Neon Postgres, Clerk auth, Tailwind CSS, shadcn/ui, Vitest CI
- Core domain types and Zod schemas exist and are tested
- Booking transition state machine is implemented and tested
- Frontend public pages read tours, destinations, and posts from Payload with static fallback timing via Next revalidation
- Payload collection configs are wired for users, media, destinations, partners, tours, customers, bookings, posts, comments, reviews, promotions, and payments
- Media upload and QStash Sharp variant processing are implemented against Cloudflare R2
- `booking-repository.ts` persists booking leads through Payload/Postgres with DB-backed idempotency

Next layer: harden Payload-backed public pages, persist booking leads to Postgres, and wire email follow-up via Resend.

### Tailwind brand palette

```
brand-blue  #0f67b1   (primary CTA, links)
brand-red   #c83232   (destination labels, accents)
brand-gold  #f4b545   (future seasonal/badge use)
brand-ink   #111827   (headings)
```

### Tech stack quick reference

| Concern | Choice |
|---|---|
| Framework | Next.js 15 App Router + TypeScript strict |
| CMS | Payload CMS (colocated) |
| Database | Neon serverless Postgres |
| Auth | Clerk |
| UI | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Media storage | Cloudflare R2 (async Sharp variants via QStash) |
| Email | Resend |
| Background jobs | Upstash QStash |
| Monitoring | Sentry (production) |
| Tests | Vitest (node environment, `tests/**/*.test.ts`) |
| Hosting | Vercel (push to `main` → production) |

## Deployment

### Standard flow (always prefer this)

```
code → git commit → git push origin master → Vercel auto-deploys production
```

Push lên `master` là Vercel tự build và deploy. Push lên branch khác tạo Preview URL.

### Data persistence

Database (Neon Postgres), media (Cloudflare R2), và Payload content **không nằm trong deployment** — chúng độc lập với Vercel. Mọi deployment đều kết nối vào cùng một database và bucket. Deploy lại không mất dữ liệu.

### Local deploy (chỉ dùng khi debug khẩn cấp)

```bash
vercel --prod   # deploy thẳng từ local lên production
```

Nếu dùng lệnh này, phải `git push` ngay sau để GitHub và Vercel không lệch nhau. Vercel luôn lấy deployment mới nhất làm production — GitHub push sau đó sẽ overwrite local deploy.

### Không làm

- Không deploy từ local cho feature bình thường — dùng git push
- Không commit thư mục `.vercel/` (đã có trong `.gitignore`)
- Không có hai người deploy local cùng lúc vào production

## Development docs

Detailed specs live in `docs/`. Key files before writing code in an area:

- `docs/BOOKING_FLOW.md` — customer journey and status transitions
- `docs/DATABASE_SCHEMA.md` — full Payload collection field reference
- `docs/CODING_GUIDELINES.md` — architectural guardrails (authoritative)
- `docs/TESTING_STRATEGY.md` — test plan and priority cases
- `docs/EXTENSION_GUIDE.md` — how to add markets, payment providers, OTA integrations, languages
- `docs/MEDIA_STRATEGY.md` — R2 upload and Sharp variant pipeline
- `docs/DEVELOPMENT_APPROACH.md` — layer-by-layer build roadmap
