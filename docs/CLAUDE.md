# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This directory currently contains **planning/spec docs only** — no source code, no `package.json`, no scaffolded app yet. The codebase will be bootstrapped from the **Payload Official Website Starter** and then customized.

Until the scaffold exists, treat tasks here as documentation/spec work. Once the app is scaffolded (see below), `package.json` scripts become the source of truth for commands.

## Bootstrap

```bash
npx create-payload-app@latest travel-agency
cd travel-agency
pnpm install
cp .env.example .env   # paste Neon DATABASE_URL
```

Prerequisites: Node.js 23+, pnpm, a Neon Postgres database (Singapore region for prod).

Package manager is **pnpm** — do not introduce npm/yarn lockfiles.

## Tech stack (locked-in decisions)

- **Framework:** Next.js 15 App Router + TypeScript (strict)
- **CMS / Admin / API:** Payload CMS (TypeScript-first) — colocated with the Next.js app
- **DB:** Neon serverless Postgres (Singapore)
- **Hosting:** Vercel
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Clerk (MVP; plan to migrate to self-hosted as MAU grows — see `RISKS_AND_MITIGATIONS.md`)
- **Payments (later phase):** Stripe (international) + VNPay/MoMo (domestic). Stripe requires a foreign entity (US LLC / Singapore) — see risks doc.
- **Media:** Cloudflare R2 (origin storage) + sharp variants generated asynchronously through QStash/background jobs. Detailed strategy in `MEDIA_STRATEGY.md`.
- **Background jobs:** Upstash QStash for image processing callbacks and async email work
- **Forms & validation:** React Hook Form + `@hookform/resolvers/zod` + Zod (use Zod for *all* validation, including Server Action inputs and env vars)

## Architecture (target)

The big-picture shape future instances need to know before writing code:

- **Server Components by default.** Use Client Components only when interactivity demands it.
- **Server Actions for internal mutations** (booking submission, admin writes). Route Handlers are allowed only for external webhooks, QStash/background callbacks, signed upload URLs, health checks, and technical endpoints that cannot safely be Server Actions.
- **Static-first + ISR** for tour and destination pages; edge-ready where possible.
- **Payload collections** must each declare explicit `access` control. Full collection list and field reference: `DATABASE_SCHEMA.md`.
- **shadcn/ui conventions** for components — don't roll bespoke primitives when a shadcn equivalent exists.
- **Typed Server Action results** for expected validation/business failures; do not make UI parse thrown exceptions for normal form errors.
- **Central env validation** via one Zod schema before config values are used.

### Business model — three pillars

These three concepts shape much of the data model and UX. Read the corresponding doc before touching related code:

1. **Book Now – Pay Later** — MVP collects inquiries only, no online payment. Agency follows up via WhatsApp/Email/Zalo/Phone, payment happens when meeting the Guide or at the office. See `BOOK_NOW_PAY_LATER.md`.
2. **Free Tours as lead gen** — Free Walking/Cycling tours (Hội An, Huế, Đà Nẵng) are a lead magnet. Same inquiry form, separate flow on `/free-tours`. See `FREE_TOUR_STRATEGY.md`.
3. **Hybrid operation** — Tours are either self-operated or outsourced to a partner depending on `currentPax` vs `minPax`. The UI surfaces this as "Guaranteed Departure" / "Join existing group" / partner badge. See `TOUR_OPERATION_MODEL.md`.

### Booking flow — critical design constraint

**The booking module must be modular and extensible** so Phase 5 can drop Stripe/VNPay/MoMo in without rewriting the data model. Concretely: new inquiries start as `Pending`, use a clear status enum (`Pending → Confirmed - Pay Later → Confirmed - Paid → Completed | Cancelled`), keep payment fields nullable/optional from day one, make booking submit/payment webhooks/background jobs idempotent, append audit trail for status/admin-critical changes, and annotate the seams where payment logic will plug in. Full flow: `BOOKING_FLOW.md`.

### Design reference

Visual target is **vmtravel.com.vn** — large hero collage of Vietnam imagery, palette of orange/yellow + flag-red + blue/white, mobile-first, "Professional, Trustworthy, Vibrant, Cultural." Primary audience is inbound foreign tourists (EU, US, AU, KR, JP), so English is default and i18n must be considered in the routing/content model from the start.

### Seasonality

`MARKET_SEASONALITY.md` defines peak windows per source market (EU peak Oct–Apr, Italy Aug–Sep, AU Jun–Aug & Dec–Jan, domestic VN May–Aug). The site needs:

- Dynamic seasonal banner on Homepage
- "Best Time to Visit" section per destination
- Seasonal collections (e.g. "Europe Winter Escape", "Italy Long Holiday Special")
- Filter tours by "Best Season"
- Admin: per-market revenue reports and peak-season alerts

Tour copy and SEO should lean on seasonal keywords ("Vietnam in December", "Best Vietnam tour for European winter escape").

## Production / deployment notes

- Disable Neon Scale-to-Zero on production and enable Compute Prewarming — cold starts hurt international visitors badly.
- Set spending limits on Vercel, Neon, and R2 up front; cost overruns are a listed risk.
- Always validate on Vercel Preview before merging to `main` (deploys are `git push origin main`).

## Doc map

The spec is split into single-topic files. Before writing code or plans, check whether the decision already lives in one of these. **Update the topic file rather than duplicating content here.**

**North star & business:**
- `PURPOSE.md` — mission, audience, success criteria, decision principles
- `PROJECT_BRIEF.md` — business overview + tech stack summary
- `MARKET_SEASONALITY.md` — per-market peak windows, seasonal strategy
- `RISKS_AND_MITIGATIONS.md`

**Product & operations (stakeholder-facing):**
- `FEATURE_LIST.md` — catalog of all features, pointer to topic files
- `BOOKING_FLOW.md` — customer journey + status flow
- `BOOK_NOW_PAY_LATER.md` — payment policy
- `FREE_TOUR_STRATEGY.md` — lead-gen model
- `TOUR_OPERATION_MODEL.md` — self-op vs partner hybrid
- `ADD_ON_SERVICES.md` — spa/dental/wellness affiliate
- `OTA_INTEGRATIONS.md` — Civitatis/GetYourGuide/Klook
- `SOCIAL_MEDIA_INTEGRATION.md` — sharing/login/embed
- `MEDIA_STRATEGY.md` — image pipeline

**Development:**
- `DEVELOPMENT_APPROACH.md` — phases & timeline
- `DEVELOPMENT_SETUP.md` — local setup
- `DATABASE_SCHEMA.md` — Payload collections + fields
- `TESTING_STRATEGY.md` — test plan, priority cases, CI expectations
- `EXTENSION_GUIDE.md` — how to add markets, providers, payment, languages
- `CODING_GUIDELINES.md` — code style
- `AGENTS.md` — human-dev oriented guidelines
- `DEPLOYMENT_GUIDE.md`
- `DOCS_INDEX.md` — full documentation map
