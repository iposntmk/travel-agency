# Current Status

**Updated:** 2026-05-30 (Travel platform expansion local gate passed; commit/push pending)

## Current Layer / Stage

The project is currently at **Layer 8 - Monetization Without Payment** with the earlier OTA/dashboard work shipped, and a new **Travel Platform Expansion** implemented locally with the full local gate passing on 2026-05-30.

Do not treat the expansion as production-shipped until the changes are committed, pushed to `origin/master`, and the Vercel production deployment completes.

Layers 1-7 are complete enough to support the current production flow:

- Layer 1 Foundation: scaffold, CI scripts, env validation, Vercel setup.
- Layer 2 Core Data Models + Access Control: Payload collections (including `affiliate-clicks`), explicit access rules, migrations, Zod schemas.
- Layer 3 Media Pipeline: signed upload, R2 storage, QStash Sharp variant processing, public focal-point rendering.
- Layer 4 Public Pages: Payload-backed tours, destinations, blog, sitemap, robots, metadata, JSON-LD, cached public reads.
- Layer 5 Booking Lead Engine: booking Server Action, validation, sanitization, Upstash Redis-backed rate-limit guard, DB-backed idempotency, Payload/Postgres persistence, Resend customer/internal booking emails.
- Layer 6 Free Tours: `/free-tours` page, free-tour upsell on confirmation page, `source` tracking through the booking funnel.
- Layer 7 Trust + Engagement: Clerk customer sync (live + verified), cookie consent banner (`tc.consent.v1` localStorage gate, navy rounded card + cookie mark), social share buttons (FB / X / WhatsApp / Email round-icon buttons + Copy-link with check feedback) with UTM tagging.

Frontend polish (2026-05-27, 5 stages):

- Stage 1 — design tokens (`navy.50–navy.950` scale + `mist`, `shadow-card`/`shadow-elevated`, `max-w-page`, `ease-out-soft`), Inter via `next/font`, `.sr-only` + `.skip-link` + `prefers-reduced-motion` guard, **SiteHeader** with sticky-on-scroll + backdrop blur + hamburger drawer (ESC closes, focus management, body scroll lock, `aria-current`/`aria-expanded`/`aria-controls`), 4-column **SiteFooter**.
- Stage 2 — **HomeHero** (navy gradient + radial highlights + dot pattern, gold-dot eyebrow pill, glass `DestinationsPanel`, glass `TrustStrip`), **WhyTcTravel** 3-column with inline shield/compass/heart icons, shared **SectionBand**/`SectionHead`/`EmptyState`/`PageHero` primitives, **TourCard v2** (rounded-2xl, hover lift, image scale, destination badge + price/free chip, arrow CTA).
- Stage 3 — listing pages (`/tours`, `/destinations`, `/blog`, `/free-tours`) use `PageHero` + `Breadcrumb` (default + on-dark variants); new shared `DestinationCard` + `BlogCard`; navy filter chips with `aria-pressed`; navy-50 skeleton; refined empty states.
- Stage 4 — detail pages (`tours/[slug]`, `destinations/[slug]`, `blog/[slug]`) use shared `Breadcrumb`; rounded-2xl hero on navy-50 + `shadow-card`; prose uses `font-display` headings, navy links, relaxed leading; tour detail extracted into `TourBookingAside` (sticky `top-24`, prominent navy CTA, share buttons), `TourItinerary` (numbered chip + gold time eyebrow), `TourAddOns` (hover-lift cards) to stay under the 250-line page cap.
- Stage 5 — ConsentBanner refresh (floating rounded-2xl + backdrop blur + cookie-mark icon, pill CTAs, `pointer-events: none` outside panel so page stays interactive), ShareButtons refresh (round SVG-icon buttons + accessible labels + focus ring).

Layer 8 implementation status:

- **Click tracking infra (done)** — `affiliate-clicks` collection (`src/collections/payload/AffiliateClicks.ts`), `POST /api/events/click` with Zod + rate-limit (30/min/IP under `affiliate-click` prefix) + SHA-256 IP hashing, `<TrackedLink>` component (sendBeacon with fetch keepalive fallback, `rel="noopener noreferrer sponsored"`). Add-on partner clicks on tour detail also flow through this.
- **OTA provider catalog (done)** — `src/lib/ota-providers.ts` defines 5 providers: GetYourGuide, Viator, Klook, Civitatis, GuruWalk. `buildUrl(city)` returns generic search URLs (no `partner_id` yet).
- **OTA widget (done)** — `src/components/ota-widget.tsx` server component, renders provider label + "More things to do in {city}" + external-partner disclosure + `<TrackedLink>` to the provider search.
- **OTA surfaces live (done)** — homepage Featured Experiences strip (3 destination cards × GetYourGuide), destination detail `Top things to do in {city}` (GetYourGuide + Viator pair), tour detail `Similar experiences in {destination}` (GetYourGuide + Viator pair). Each surface passes a distinct `source` for attribution.
- **Affiliate IDs (pending)** — partner accounts not yet registered. Revenue = 0 until partner IDs are appended to `buildUrl()` per provider. See `docs/OTA_INTEGRATIONS.md` § "Adding affiliate IDs".
- **Internal clicks dashboard (done)** — `/internal/affiliate-clicks` (admin-only, Payload session gate) renders totals, top targets, top sources, OTA provider breakdown, day-by-day bar chart, and recent rows. Range selector `?range=7|30|90`. Aggregation lives in `src/services/affiliate-stats.ts` (pure aggregator + Payload loader). Disallowed in `robots.txt` and noindex'd via the internal layout. Verified with `pnpm test` (13 new tests) + `pnpm build`.

Travel Platform Expansion status (local, verified):

- **Schema expansion implemented** — new Payload collections: `car-rentals`, `attractions`, `product-categories`, `custom-inquiries`, `team-members`, `site-settings`; expanded `destinations`, `tours`, and `posts` for city hubs, richer tour cards, ratings, guide categories, featured relationships, and sorting.
- **Migration/types generated** — `src/migrations/20260529_124032_travel_platform_expansion.ts` and `.json` created; `src/payload-types.ts` regenerated.
- **Custom inquiry flow implemented** — `submitCustomInquiry` Server Action with Zod validation, IP/email rate limiting, plain-text sanitization, idempotency, customer reuse, Payload persistence, and non-blocking Resend customer/sales emails.
- **Frontend routes implemented** — `/free-proposal` multi-step proposal form, `/car-rentals`, `/car-rentals/[slug]`, destination hub sections for tours/car rentals/guides/attractions.
- **Frontend UX refresh implemented** — lighter Authentik-inspired hero, emerald proposal CTA, mobile horizontal cards, expanded tour filters, itinerary accordion, mobile sticky tabs, and sticky tour bottom CTA.
- **Tests added** — custom inquiry schema/action coverage for validation, destination requirement, duplicate idempotency, email suppression on duplicates, and rate limiting.

Expansion verification:

- 2026-05-29: `tsc --noEmit`, `vitest run`, and `eslint .` passed via local binaries, but `next build` timed out twice.
- 2026-05-30: `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `pnpm build` passed. Build completed in roughly 140 seconds and generated 28 static pages. Lint still reports the 4 pre-existing warnings in `src/migrations/20260527_041941.ts`.

Latest production-readiness verification:

- `pnpm qa:clerk-sync` on 2026-05-27 — Clerk → Payload customer sync confirmed end-to-end (creates throwaway Clerk user, waits for webhook, asserts Payload `customers` row, cleans up both sides).
- Resend booking email + internal sales notification confirmed delivered ("resend mail: passed, done").
- Vercel Deployment Protection patched off (`ssoProtection: null`) so webhooks reach the deployed routes.
- All Vercel Production envs synced 2026-05-27 (Clerk webhook secret, Upstash Redis REST, Resend, R2, QStash, Neon, Payload).

Last shipped commits (top to bottom = newest to oldest):

- (pending commit/push) Travel platform expansion: schema, custom inquiries, car rentals, city hubs, proposal UX
- `7047eee Document Stage 1-5 frontend polish and add tech stack reference`
- `44758b3 Refresh consent banner and share buttons (Stage 5)`
- `547d9d2 Polish detail pages with breadcrumb, navy aside, prose tweaks (Stage 4)`
- `5da67a8 Polish listing pages with PageHero and refined cards (Stage 3)`
- `5d5079d2 Polish homepage hero, sections, and TourCard`
- `269f861 Refresh frontend design tokens and ship SiteHeader/Footer`
- `7e43aa0 Add internal affiliate-clicks dashboard (Layer 8 L)`
- `ab44f6d Update status docs to reflect Layer 8 UI shipped`
- `d1cda72 Show OTA Featured Experiences on home + destination pages`
- `c75fd9d Add OTA widget scaffold on tour detail (no affiliate IDs yet)`
- `198c1aa Track add-on partner clicks as affiliate events`
- `51aca80 Add cookie consent banner and social share buttons`

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

**Owner (non-dev) tasks — unblocks Layer 8 revenue:**

- Register OTA partner programs: GetYourGuide → Viator → Klook → Civitatis → GuruWalk (priority order from `docs/OTA_INTEGRATIONS.md` §3). Hand the partner IDs back to dev to wire in.

**Dev tasks — in order:**

1. Review generated migration `20260529_124032_travel_platform_expansion` before applying to Preview/Production.
2. Commit and push the travel platform expansion after staging only the intended source/docs/migration/test files.
3. Verify the Vercel production deployment completes after push.
4. Complete frontend QA/polish for the public conversion surfaces: homepage, `/tours`, `/tours/[slug]`, `/destinations/[slug]`, `/free-proposal`, `/car-rentals`, and booking confirmation on mobile first.
5. Security hardening before indexing/go-live: production booking + custom inquiry QA, comments/reviews sanitization if public UGC is enabled, CSP report review, access-control spot checks, and no secret/log/data files in commits.
6. Performance + SEO backlog in `docs/toiuu.md`: Vercel region/pooler verification, media Cache-Control/R2 audit, image strategy reconciliation, metadataBase/canonical, JSON-LD, sitemap, and mobile Lighthouse target.
7. **Layer 8 K** — Move OTA partner IDs into Payload `partners` (or new `ota-partners`) collection when owner provides IDs. This is revenue-enabling but should not block security/performance/SEO/frontend completion.
8. Booking slot/capacity transaction locking only if bookings mutate availability or `currentPax`.
9. **Layer 9 Online Payment** — explicitly deferred until the end, after Pay Later, security, performance, SEO, frontend, and production operations are stable.

## Verification Baseline

Latest local verification before this status update:

- `pnpm typecheck` passed.
- `pnpm test` passed: 24 files, 131 tests.
- `pnpm lint` passed with 4 pre-existing migration warnings unchanged.
- `pnpm build` passed; build completed in roughly 140 seconds and registered `/free-proposal`, `/car-rentals`, and `/car-rentals/[slug]`.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before committing code changes.
