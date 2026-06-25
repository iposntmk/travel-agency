# Current Status

**Updated:** 2026-06-25 (Homepage/frontend shell redesigned toward Izitour structure with Payload-backed data)

## Current Layer / Stage

The project is currently at **Layer 8 - Monetization Without Payment** with the OTA/dashboard work, the **Travel Platform Expansion** (`79ad0cf`), the CMS-configurable SiteSettings work (`da07b3f` + fix `75ebac6`), and a **frontend polish batch** (`8c7afd6`) all shipped to `origin/master`.

`8c7afd6` is **production-verified**: the Vercel deploy reached READY (region `sin1`) and `pnpm qa:smoke https://tc-travel-vietnam.vercel.app` passed 20/20 on 2026-05-31 (health 200 / db latency 11ms, 7 public pages 200 with `noindex` headers, sitemap/robots 200, `/internal/affiliate-clicks` auth-gated 307).

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
- **OTA widget (done, default-off)** — `src/components/ota-widget.tsx` server component, renders provider label + "More things to do in {city}" + external-partner disclosure + `<TrackedLink>` to the provider search. `resolveOtaWidgets()` now returns `[]` unless Payload `SiteSettings.ota.enabled === true` and the specific placement is also explicitly enabled.
- **OTA surfaces wired (default-off)** — homepage Featured Experiences, destination detail `Top things to do in {city}`, and tour detail `Similar experiences in {destination}` remain wired, but no OTA cards render by default. Staff must enable the master OTA switch plus the placement in Payload; leaving provider selection blank still uses the placement's built-in provider defaults.
- **Affiliate IDs (pending)** — partner accounts not yet registered. Revenue = 0 until partner IDs are appended to `buildUrl()` per provider. See `docs/OTA_INTEGRATIONS.md` § "Adding affiliate IDs".
- **Internal clicks dashboard (done)** — `/internal/affiliate-clicks` (admin-only, Payload session gate) renders totals, top targets, top sources, OTA provider breakdown, day-by-day bar chart, and recent rows. Range selector `?range=7|30|90`. Aggregation lives in `src/services/affiliate-stats.ts` (pure aggregator + Payload loader). Disallowed in `robots.txt` and noindex'd via the internal layout. Verified with `pnpm test` (13 new tests) + `pnpm build`.

Travel Platform Expansion status (committed, pending production verification):

- **Schema expansion implemented** — new Payload collections: `car-rentals`, `attractions`, `product-categories`, `custom-inquiries`, `team-members`, `site-settings`; expanded `destinations`, `tours`, and `posts` for city hubs, richer tour cards, ratings, guide categories, featured relationships, and sorting.
- **Migration/types generated** — `src/migrations/20260529_124032_travel_platform_expansion.ts` and `.json` created; `src/payload-types.ts` regenerated.
- **Custom inquiry flow implemented** — `submitCustomInquiry` Server Action with Zod validation, IP/email rate limiting, plain-text sanitization, idempotency, customer reuse, Payload persistence, and non-blocking Resend customer/sales emails.
- **Frontend routes implemented** — `/free-proposal` multi-step proposal form, `/car-rentals`, `/car-rentals/[slug]`, destination hub sections for tours/car rentals/guides/attractions.
- **Frontend UX refresh implemented** — lighter Authentik-inspired hero, emerald proposal CTA, mobile horizontal cards, expanded tour filters, itinerary accordion, mobile sticky tabs, and sticky tour bottom CTA.
- **Tests added** — custom inquiry schema/action coverage for validation, destination requirement, duplicate idempotency, email suppression on duplicates, and rate limiting.
- **Migration reviewed before push** — `up` is additive for new collections/fields/indexes/relationships; destructive SQL is limited to `down`.
- **Committed and pushed** — `79ad0cf Broaden lead capture before payment work` was pushed to `origin/master` on 2026-05-30.

Expansion verification:

- 2026-05-29: `tsc --noEmit`, `vitest run`, and `eslint .` passed via local binaries, but `next build` timed out twice.
- 2026-05-30: `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `pnpm build` passed. Build completed in roughly 140 seconds and generated 28 static pages. Lint still reports the 4 pre-existing warnings in `src/migrations/20260527_041941.ts`.
- 2026-05-30 commit gate: `git diff --cached --check` passed before commit; staged scope contained only intended docs/source/migration/test files.

Latest production-readiness verification:

- `pnpm qa:clerk-sync` on 2026-05-27 — Clerk → Payload customer sync confirmed end-to-end (creates throwaway Clerk user, waits for webhook, asserts Payload `customers` row, cleans up both sides).
- Resend booking email + internal sales notification confirmed delivered ("resend mail: passed, done").
- Vercel Deployment Protection patched off (`ssoProtection: null`) so webhooks reach the deployed routes.
- All Vercel Production envs synced 2026-05-27 (Clerk webhook secret, Upstash Redis REST, Resend, R2, QStash, Neon, Payload).

Last shipped commits (top to bottom = newest to oldest):

- `81693f6 fix(ota): require explicit CMS opt-in` — OTA widgets now render only when Payload `SiteSettings.ota.enabled` and the specific placement are both explicitly enabled; SiteSettings OTA defaults and DB defaults are false via `20260531_232000_disable_ota_defaults`.
- `003b32e` / `cd733ee` docs — removed obsolete `docs/CLAUDE.md` + duplicate `docs/AGENTS.md` (both carried drifted status); the single agents file is now root `agents.md`.
- `a2dc2a3` / `da2c19c docs(agents)` — codified the cross-agent knowledge-store read/write protocol in root `agents.md` (Claude/Codex/Gemini/Grok/opencode share agentmemory `:3111`; project status lives only in this file).
- `06e6844` / `529f3ef docs` — mobile Lighthouse baseline (`docs/lighthouse-baseline.md`).
- `ad89b8d perf(lcp): add fetchPriority=high to hero images` — Next 15.4 `priority` doesn't set fetchpriority; LCP discovery audit now passes (home perf 67→75). Verified live.
- `8a4b721 feat(seo): add OpenGraph/Twitter defaults and a raster OG fallback` — `/og-default` route (next/og 1200×630), twitter card site-wide. Verified live.
- `fdf01f0 fix(seo): stop double-appending site name in detail page titles` — `{absolute}` bypasses the title template. Verified live.
- `8c7afd6 feat(frontend): polish header/hero/footer, add topbar & floating WhatsApp` — brand-green tokens, SiteTopbar, SiteFloating/FloatingActions, footer social icons, HomeHero contrast fix, CSP Google Maps, clientUuid() booking, dev without turbopack, qa:smoke + scripts/smoke-check.ts. **Production-verified 2026-05-31 (deploy READY sin1, qa:smoke 20/20).**
- `75ebac6 fix(deploy): include components required by CMS pages` — recovery for the da07b3f deploy ERROR.
- `da07b3f feat(cms): make OTA, free tours, free proposal & homepage sections CMS-configurable` — SiteSettings homepage/ota/freeProposal groups; OTA urlTemplate with {city} for affiliate IDs without redeploy.
- `79ad0cf Broaden lead capture before payment work` — Travel platform expansion: schema, custom inquiries, car rentals, city hubs, proposal UX, and updated priority docs deferring online payment.
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

1. ~~Verify the Vercel production deployment, then smoke-check the public conversion surfaces.~~ **Done 2026-05-31** — `8c7afd6` deploy READY (sin1), `pnpm qa:smoke https://tc-travel-vietnam.vercel.app` passed 20/20.
2. ~~Confirm production migration/application health.~~ **Done** — new Payload collections load, existing content renders, no runtime migration errors.
3. ~~Complete frontend QA/polish for the public conversion surfaces on mobile first.~~ **Done 2026-06-19** (`1692465`) — code audit across all 7 surfaces; fixed: footer email `break-all` (horizontal overflow), booking confirmation placeholder content replaced with SiteSettings-driven contact info, tour detail `pb-24 md:pb-8`; no horizontal overflow on /, /tours, /free-proposal, /car-rentals, /booking/confirmation.
4. ~~Security hardening: CSP report-only headers, access-control spot checks.~~ **Done 2026-06-19** — CSP `Content-Security-Policy-Report-Only` already in `next.config.ts`; `/api/csp-report` route with rate limiting exists; all Payload collection contracts have explicit access rules. Remaining: production booking E2E (requires user action — submit real booking, verify Resend emails both sides).
5. ~~Performance + SEO backlog.~~ **Largely done 2026-06-19** — added `@next/bundle-analyzer` + `ANALYZE=true` support (bundles healthy: `/tours` 103 kB, `/free-proposal` 135 kB); `.lighthouserc.js` + `@lhci/cli` + `pnpm qa:lighthouse` script; migration `20260619_062646` (OTA DEFAULT alignment); verified Điểm 5/6/16/30 already implemented. Remaining: Điểm 4/27 (image pipeline decision), Điểm 12 (3rd-party script audit), Điểm 37 (AggregateRating JSON-LD).
6. **Layer 8 K** — Move OTA partner IDs into Payload `partners` (or new `ota-partners`) collection when owner provides IDs. This is revenue-enabling but should not block security/performance/SEO/frontend completion.
7. Booking slot/capacity transaction locking only if bookings mutate availability or `currentPax`.
8. **Layer 9 Online Payment** — explicitly deferred until the end, after Pay Later, security, performance, SEO, frontend, and production operations are stable.

## toiuu.md Backlog Status (audited 2026-06-19)

**DONE — verified in codebase (updated 2026-06-19):**
- ✅ Điểm 1 — Vercel region `sin1` in `vercel.json`
- ✅ Điểm 2 — CMS `unstable_cache` + `cache()` dedup in `src/lib/cms.ts`
- ✅ Điểm 3 — `revalidateTag` hooks in `src/collections/payload/hooks/revalidate-content.ts`
- ✅ Điểm 7 — `/api/health` endpoint live
- ✅ Điểm 8 — Neon pooler URL + pool tuning + migration detection in `payload.config.ts`; `DATABASE_URL_UNPOOLED` in env schema
- ✅ Điểm 9 — R2 `CacheControl: immutable` in `src/lib/r2.ts`; `r2SetCacheControl` backfill helper added
- ✅ Điểm 10 — `<link rel="preconnect">` R2 origin in `src/app/(frontend)/layout.tsx`
- ✅ Điểm 11 — Suspense + `TourResultsSkeleton` in `/tours`
- ✅ Điểm 14 — JSON-LD: tour (`tourProductJsonLd`), destination (`touristDestinationJsonLd`), blog (`blogPostingJsonLd`), home (`organizationJsonLd` + `webSiteJsonLd`), tours list (`itemListJsonLd`), booking confirmation (`bookingConfirmationJsonLd`)
- ✅ Điểm 15 — Canonical filter: `/tours` page sets `alternates: { canonical: "/tours" }`
- ✅ Điểm 17 — `src/app/robots.ts` fixed: `allow: "/"`, disallows `/admin /api /booking/ /internal /*?*`
- ✅ Điểm 19 — `getToursForList` with `select` fields in `src/lib/cms-list.ts`
- ✅ Điểm 23 — Clerk absent from public layout; server-side webhook only
- ✅ Điểm 24 — `<Analytics />` from `@vercel/analytics/next` in layout
- ✅ Điểm 26 — `metadataBase: new URL(siteUrl)` in frontend layout
- ✅ Điểm 29 — `sanitizeTextField` hooks on `Comments.content` and `Reviews.comment`
- ✅ Điểm 5 — Split getters: `depth: 1` on `getTourBySlug` is optimal; separate queries would be slower (multiple round trips). No action needed.
- ✅ Điểm 6 — DB indexes: confirmed captured in `travel_platform_expansion` migration. `20260619_062646` generated for OTA DEFAULT alignment only.
- ✅ Điểm 16 — Sitemap `select` fields: `cms-sitemap.ts` already uses `SITEMAP_SELECT = { slug, updatedAt }` + `depth: 0`.
- ✅ Điểm 18 — Bundle audit: `@next/bundle-analyzer` installed, `ANALYZE=true pnpm build` wired. Bundles healthy: `/tours` 103 kB, `/free-proposal` 135 kB — all under 150 kB target.
- ✅ Điểm 22 — Lighthouse CI: `.lighthouserc.js` + `@lhci/cli` + `pnpm qa:lighthouse` added (`1692465`). Runs mobile assertions against production URL.
- ✅ Điểm 30 — CSP `Content-Security-Policy-Report-Only` + `Reporting-Endpoints` already in `next.config.ts`; `/api/csp-report` route with rate limiting exists.

**REMAINING — not yet implemented:**
- ❌ Điểm 4/27 — Image pipeline decision: codebase still uses `<Image unoptimized />` for R2 variants (Phương án B). Reconcile `docs/MEDIA_STRATEGY.md` and audit `resolveImage()` before removing `unoptimized` or switching to Vercel Image Optimization.
- ❌ Điểm 12 — Third-party script guardrail enforcement (GA4/FB Pixel must use `next/script strategy="afterInteractive"`; audit for raw `<script>` tags).
- ❌ Điểm 13 — hreflang (future, not blocking MVP English).
- ❌ Điểm 20 — Cold start: verify Fluid Compute is enabled on Vercel dashboard first; only add cron keepwarm if it isn't.
- ❌ Điểm 21 — LCP beyond images (font, CSS waterfall). Current system font is optimal; only investigate if Lighthouse shows CSS-blocked LCP.
- ❌ Điểm 25 — WebPageTest geographic matrix (SG / US-East / US-West / EU / AU / India) post-deploy automation.
- ❌ Điểm 32 — Slot/capacity transaction lock (only if booking mutates `currentPax` or `availableDates`).
- ❌ Điểm 33 — Online payment (Stripe + VNPay/MoMo) — Layer 9, deferred.
- ❌ Điểm 34 — Client uploader UI validation; R2 upload size policy (currently 20MB, not 8MB).
- ❌ Điểm 36 — i18n runtime decision (route model, `next-intl` vs Payload localization) — future.
- ❌ Điểm 37 — JSON-LD: `AggregateRating` on tour detail when approved reviews exist.

## Verification Baseline

Latest local verification (2026-06-19, implementation commit `1692465`):

- `pnpm typecheck` passed.
- `pnpm test` passed: 29 files, 157 tests.
- `pnpm lint` passed with 0 errors and 17 warnings (migration files only).
- `pnpm build` passed with `ANALYZE=true`; bundles: `/tours` 103 kB, `/free-proposal` 135 kB, shared 102 kB.
- No horizontal overflow on /, /tours, /free-proposal, /car-rentals, /booking/confirmation (verified via `scrollWidth === clientWidth`).

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before committing code changes.

Homepage redesign work-in-progress verification (2026-06-25):

- Homepage `/` now renders Izitour-style section order from Payload-backed adapters: hero carousel, search tabs, who-we-are, why-us, featured tours, testimonials, cruises, destinations, blog.
- Frontend shell now uses fixed Izitour-style header with desktop topbar/nav, mobile drawer, language toggle, `pt-[60px] lg:pt-[110px]` main offset, and floating widgets with pulse treatment.
- Section styling was tightened against the local Izitour template: centered WhoWeAre copy + orange CTA, gray `#f8f9fa` alternating bands, border-bottom separators, WhyChooseUs compact cards, tour overlay cards with orange CTA strip, testimonial source-card proportions, BestCruises two-row narrative layout, destination 4+2 grid, blog white cards, and dark footer.
- Tours/blog now use client carousels with responsive visible count, arrows, dots, and swipe handling. Destinations mobile now uses a single-card swipe carousel with arrows/dots instead of a simple scroll rail.
- Removed `upgrade-insecure-requests` from report-only CSP because browsers ignore it there and log a warning.
- Verified: `pnpm typecheck` passed, `pnpm test` passed (29 files, 157 tests), `pnpm lint` passed with 0 errors and 21 pre-existing warnings, local `/` returned 200 after `.next` reset and after the style tightening pass.
- `pnpm build` still needs a clean run after stopping `pnpm dev`; do not run build concurrently with the dev server because both mutate `.next`.
