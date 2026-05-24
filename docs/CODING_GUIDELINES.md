# An's Travel Agency - Project Core Directives & Coding Guidelines

**Project Name:** An's Travel Agency (VM Travel Platform)
**Tech Stack:** Next.js 15 (App Router), TypeScript (Strict), Payload CMS, Tailwind CSS, shadcn/ui, pnpm, Clerk Auth, Neon Postgres (Singapore), Cloudflare R2, Upstash QStash.

This document serves as an absolute, non-negotiable set of architectural guardrails for all AI code generation assistants (Claude Code, DeepSeek, Cursor). Every line of code generated must strictly comply with these rules.

---

## 1. Architectural Layers & Separation of Concerns

### 1.1 UI/UX Layer (Frontend)
- **Mobile-First Product Law:** All public, booking, and admin workflows must be designed and implemented mobile-first. Start layouts, spacing, navigation, forms, CTA placement, and performance budgets from the smallest supported viewport, then enhance for tablet and desktop.
- **Mobile Completion Gate:** A UI task is not complete until it is manually checked on mobile viewport width for readable text, reachable CTAs, stable layout, no horizontal overflow, no overlapping content, and usable form controls.
- **Desktop as Enhancement:** Desktop layouts may add density, sidebars, richer galleries, and comparison views, but they must not introduce workflows, fields, or calls to action that mobile users cannot access.
- **RSC by Default:** All pages, layouts, and data-fetching modules must be React Server Components (RSC).
- **Client Components Restriction:** Use the `"use client"` directive strictly at the leaf-level of the component tree only for interactive elements (e.g., forms, filters, toggles, carousels).
- **Next.js 15 Async APIs:** `params`, `searchParams`, `cookies()`, and `headers()` are asynchronous in Next.js 15. You MUST `await` them before reading properties.
- **No Bespoke Primitives:** Do not roll custom CSS or HTML components if an equivalent exists in `shadcn/ui`. Reuse shadcn/ui primitives strictly with Tailwind CSS.
- **Isolate Client Code:** Use the `"server-only"` package in all data access and service files to prevent accidental leakage into the client bundle.

### 1.2 Business Logic & Mutation Layer
- **Server Actions First:** Use Next.js Server Actions for all internal mutations (Booking Inquiries, Comments, Admin updates).
- **Route Handler Exceptions:** Create Route Handlers (`route.ts`) only for external webhooks, QStash/background callbacks, health checks, signed upload URLs, and technical endpoints that cannot be represented safely as Server Actions. Never duplicate an internal form mutation in both a Server Action and a Route Handler.
- **Domain Logic Isolation:** Core agency operations—such as calculating pricing based on `pricingTiers` or evaluating group consolidation via `currentPax` vs `minPax`—must live in isolated Service functions (`/services`), not inside UI components or actions.
- **Typed Action Results:** Every Server Action must return a typed result union such as `{ ok: true; data: T } | { ok: false; error: { type: "validation" | "business" | "rate-limit" | "system"; message: string; fieldErrors?: Record<string, string[]> } }`. UI must not parse thrown errors for expected validation or business failures.

### 1.3 Data & CMS Layer (Payload CMS)
- **Naming Conventions:** All Payload collections must use lowercase, plural names (e.g., `tours`, `bookings`, `destinations`, `partners`).
- **Explicit Access Control:** Every single collection must declare explicit, strict `access` control rules upon creation (e.g., public read for `tours`, authenticated write for `bookings`, admin-only for `partners.commissionRate`). Never leave access control undefined.

### 1.4 Validation Layer
- **3-Tier Validation Unified by Zod:** 1. *UI Level:* Use `react-hook-form` with `@hookform/resolvers/zod` for immediate reactive feedback.
  2. *Action Level:* Every Server Action input must be parsed and verified using a Zod schema before processing.
  3. *Database Level:* Ensure Payload hooks validate business limits (e.g., verifying `commissionRate` stays within the 20-35% range).
- **Shared Schemas:** Write Zod validation schemas into standalone files in `@/schemas` or `@/lib/validations` to be shared between client-side forms and server-side logic.
- **Environment Validation:** All environment variables must pass through one central Zod schema (for example `@/config/env.ts`). Do not read `process.env` directly from random modules except inside that env loader.

---

## 2. Modular Design & Reusability (DRY)

### 2.1 File Size & Line Limits (Strict Guardrails)
- **UI Components:** Max **150 lines** per file. If exceeded, break down into sub-components under a local `/components` directory.
- **Server Actions & Services:** Max **250 lines** per file. Group related utilities into smaller modules.
- **Payload Collection Configurations:** Max **200 lines** per file. Extract complex lifecycle hooks (`beforeValidate`, `afterChange`) into a separate `/hooks` folder inside the collection module.

### 2.2 Booking Module Architecture (Extensibility Constraint)
- **Modular Checkout Seams:** The "Book Now - Pay Later" strategy requires that no payment system be coupled with the core flow yet. However, the schema must handle online payments later without migrations.
- **Schema Rules:** All payment fields (`paymentMethod`, `paymentStatus`) must be optional/nullable from day one.
- **State Machine:** New inquiry submissions always start as `Pending`. Bookings must strictly transition via a clean Enum status: `Pending` → `Confirmed - Pay Later` → `Confirmed - Paid` → `Completed` | `Cancelled`.
- **Plug-in Comments:** Leave explicit `// TODO: Phase 5 Payment Gateway Hook` markers in the inquiry submission actions where Stripe/VNPay will plug in.
- **Idempotency:** Booking submit, payment webhook processing, signed upload callbacks, and QStash/background jobs must accept and persist an idempotency key or deterministic job key. Duplicate requests must return the existing result or no-op safely.
- **Audit Trail:** Booking status changes and admin-critical operations must append audit records with actor, previous value, next value, reason, source, and timestamp. Do not overwrite historical state without traceability.
- **i18n-Ready Model:** Routes, slugs, content fields, and SEO metadata must be modeled so English is default but future locales (French, German, Korean, Japanese) can be added without changing core collection shapes.

### 2.3 Global Reusable Components
- **OTAWidget:** Must accept `provider`, `city`, `experienceIds`, and `variant` props to safely render across Homepage, Tour Details, and Destinations.
- **SocialShare:** Must accept `title`, `url`, `image`, `description`, and `platforms[]` props.

---

## 3. Performance, Async Operations & Privacy

### 3.1 Non-Blocking Media Pipeline
- **No Synchronous Image Processing:** Do not invoke `sharp` or heavy transformations synchronously inside Payload hooks, Route Handlers, or Server Actions. This causes Vercel runtime execution timeouts.
- **Background Jobs:** Enqueue background optimization tasks via Upstash QStash. Payload CMS should manage image metadata and processing status only; file storage belongs to Cloudflare R2.
- **R2 as Source of Truth:** Upload originals directly to Cloudflare R2 via signed URL. Sharp processors generate variants asynchronously and write variants back to R2. Cloudinary is not part of MVP except as an explicit fallback if the R2 pipeline is abandoned.

### 3.2 Third-Party Script Controls & Fallbacks
- **Lazy Loading:** All third-party integrations (OTA widgets, Tripadvisor embeds, Social feeds) must use Next.js `<Script lazyOnload />` or load only after LCP to prevent render-blocking.
- **Resilience:** Wrap external API lookups and embeds inside React Error Boundaries or provide explicit Graceful Fallbacks. If a partner's widget crashes, the main agency application must remain fully functional.
- **Consent Gate:** GA4, GTM, Facebook Pixel, TikTok Pixel, and interactive social embeds must not load until cookie consent is granted. Social embeds should render a click-to-load placeholder before opt-in.

---

## 4. Quality Control, Security & Tooling

### 4.1 Test-Driven Focus
- **Test Placement:** Use top-level test directories by behavior: `tests/schemas`, `tests/services`, `tests/actions`, and `tests/collections`. Keep fixtures close to those tests.
- **Default Runner:** Use Vitest unless the scaffolded Payload starter already includes a stronger project-specific test setup. Do not introduce a second runner without removing or justifying the first.
- **CI Gate:** After scaffolding, CI should run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` before merge.
- **Priority Matrix:** Write comprehensive automated unit tests parallel to drafting core workflows, focusing on:
  1. Zod Validation Schemas.
  2. Booking status transitions.
  3. Payload Collection Access Control policies.
  4. Pricing tiers, `currentPax`/`minPax`, and add-on commission service logic.
  5. Server Action smoke flows: valid submit, invalid submit, rate limit, and duplicate submit.
- **Migration Safety:** Schema changes must include Payload migrations and, when needed, seed/backfill updates. Do not rely on manual admin edits to make Preview or Production boot.
- **Fixtures:** Test fixtures must avoid real emails, phone numbers, credentials, partner contracts, or customer data.

### 4.2 Code Cleanliness & Noise Reduction
- **No UI/Tailwind Comments:** Do not write documentation inside standard Tailwind CSS configurations or boilerplate JSX. 
- **Critical Path Comments:** Comments are strictly reserved for core business exceptions, temporary payment hooks, rate limits, and access controls.

### 4.3 Security Boundaries
- **Rate Limiting:** Apply server-side rate-limiting to the Booking Inquiry Server Action to block automated lead-form spamming.
- **No Secret Leaks:** Never commit `.env` files or hardcode API credentials. Use environment variables strictly through validated Next.js config files.

### 4.4 Toolchain Enforcement
- **Package Manager:** Use `pnpm` exclusively. Do not introduce `package-lock.json` or `yarn.lock`.
- **Strict TypeScript:** Keep TypeScript strict mode enabled. No `any` type overrides allowed.

---

## 5. Target Source Layout After Scaffold

When the app exists, keep the code organized by responsibility:

```text
travel-agency/
  src/
    app/                  # Next.js routes, layouts, pages, route handlers
    app/actions/          # Server Actions for internal mutations
    collections/          # Payload collection configs, hooks, access rules
    components/           # shared UI, forms, widgets, layout
    config/               # env loader, constants, runtime config
    lib/                  # SDK clients and low-level adapters
    schemas/              # shared Zod schemas
    services/             # business logic independent from UI/Payload config
    jobs/                 # QStash/background processors
  tests/
    schemas/
    services/
    actions/
    collections/
    fixtures/
```

### Directory rules

- `services/*` must not import React components.
- `schemas/*` must be shareable between client and server when safe; server-only schemas may live beside server actions if they include private fields.
- `collections/*/hooks` should hold complex Payload lifecycle hooks instead of bloating collection config files.
- `app/api/*/route.ts` is reserved for external webhooks, QStash/background callbacks, signed upload URLs, health checks, and technical endpoints. Internal booking/comment/admin form mutations should stay in Server Actions.
- Add `server-only` to data access and service modules that must never enter the client bundle.

## 6. Extension Rules

Use `EXTENSION_GUIDE.md` before adding new markets, destinations, payment providers, OTA providers, add-on categories, languages, or tracking integrations.

Core extension principle: add new behavior by extending typed enums/config and isolated services first, then wire UI/admin after tests exist. Do not special-case market/provider logic inside page components.
