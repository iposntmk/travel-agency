# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains planning and specification documents only. There is no scaffolded application, source tree, test suite, or `package.json` yet.

- `PROJECT_BRIEF.md`: business goals, target audience, and MVP scope.
- `CLAUDE.md`: current agent instructions, target architecture, and bootstrap notes.
- `DEVELOPMENT_SETUP.md`: local setup prerequisites and initial scaffold steps.
- `CODING_GUIDELINES.md`: coding expectations for the future app.
- `DATABASE_SCHEMA.md`, `FEATURE_LIST.md`, `MARKET_SEASONALITY.md`, `RISKS_AND_MITIGATIONS.md`: domain constraints.
- `TESTING_STRATEGY.md`: test plan, priority cases, and CI expectations for the future app.
- `EXTENSION_GUIDE.md`: rules for adding markets, destinations, OTA providers, payments, languages, and background jobs.
- `DOCS_INDEX.md`: documentation map and source-of-truth hierarchy.

When scaffolded, place the app in `travel-agency/` unless the team chooses a different root. Expected stack: Next.js 15 App Router, TypeScript, Payload CMS, Tailwind CSS, shadcn/ui, Cloudflare R2, Upstash QStash, Neon, and Vercel.

## Build, Test, and Development Commands

There are no active build or test commands until the app is generated. Bootstrap:

```bash
npx create-payload-app@latest travel-agency
cd travel-agency
pnpm install
cp .env.example .env
```

After scaffolding, treat `travel-agency/package.json` as the source of truth:

```bash
pnpm dev      # local development server
pnpm build    # production build
pnpm lint     # lint checks, if configured
pnpm test     # tests, if configured
```

Use `pnpm` only. Do not add npm or yarn lockfiles.

## Coding Style & Naming Conventions

Use TypeScript strict mode. Prefer Server Components; add Client Components only for required interactivity. Use Server Actions for internal mutations such as booking submissions. Use Route Handlers only for external webhooks, QStash/background callbacks, signed upload URLs, health checks, or technical endpoints that do not fit Server Actions. Follow shadcn/ui conventions and Tailwind utilities. Use `react-hook-form`, `@hookform/resolvers/zod`, and Zod for forms and validation. Comment only business-critical logic, especially booking, payment, idempotency, audit trails, and access control.

Payload collections should use plural lowercase names such as `tours`, `destinations`, `bookings`, `customers`, `payments`, and `reviews`. Every collection must define explicit access control.

Booking submissions must start as `Pending`, then move through `Confirmed - Pay Later`, `Confirmed - Paid`, and finally `Completed` or `Cancelled`. Booking submit, payment webhook processing, and background jobs must be idempotent. Status changes and important admin actions must append audit history.

All environment variables must be validated through one central Zod schema. Public routes, slugs, content fields, and SEO metadata should be i18n-ready with English as the default locale.

## Testing Guidelines

No testing framework is configured yet. Once code exists, place tests under `tests/schemas`, `tests/services`, `tests/actions`, and `tests/collections`, then wire them through `pnpm test`. Prioritize booking status transitions, Zod schemas for booking/customer/payment-ready/partner commission fields, Payload access control, pricing tiers, `currentPax`/`minPax`, add-on commission, and Server Action smoke tests for valid, invalid, rate-limited, and duplicate submits.

Use `TESTING_STRATEGY.md` as the source of truth for test priorities and add Vitest by default unless the scaffolded starter already includes a stronger project-specific setup.

## Commit & Pull Request Guidelines

No project-specific commit convention is documented yet. Use concise imperative messages, for example `Add booking schema draft` or `Document Neon deployment risks`.

Pull requests should include a short summary, affected docs or modules, linked issue when applicable, screenshots for UI changes, and notes for environment or migration changes. Validate Vercel Preview before merging app changes to `main`.

## Security & Configuration Tips

Never commit `.env` files or secrets. Production should use Neon Singapore, Vercel, Cloudflare R2 for media storage, and QStash for background jobs. Keep Neon Scale-to-Zero disabled in production and set spending limits for Vercel, Neon, R2, and QStash. GA4/GTM/Facebook/TikTok Pixel and social embeds must load only after cookie consent.
