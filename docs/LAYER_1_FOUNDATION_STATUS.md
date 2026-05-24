# Layer 1 Foundation Status

Updated: 2026-05-24

## Completed

- Next.js 15.4.x App Router with TypeScript strict.
- pnpm-only dependency setup.
- Tailwind base and shadcn/ui base configuration.
- Vitest test runner and behavior-based test folders.
- Central Zod env loader in `src/config/env.ts`.
- Payload CMS colocated in the Next app:
  - Admin route: `/admin`
  - REST route: `/api/[...slug]`
  - Config: `payload.config.ts`
  - Base collections: `users`, `media`
  - Postgres adapter wired through `DATABASE_URL`.
- Neon local `.env` configured.
- Baseline Payload migration created in `src/migrations`.
- Payload migration ran successfully against Neon.
- Payload admin create-first-user screen is reachable at `/admin/create-first-user`.
- Clerk provider base in root layout.
- CI gate in `.github/workflows/ci.yml`.
- Vercel build config in `vercel.json`.
- Mobile-first product law added to coding rules.
- Same-Wi-Fi local dev works at `http://192.168.2.7:3000`.

## Verified

- `pnpm payload:generate-importmap`
- `pnpm payload:generate-types`
- `pnpm payload:migrate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Blocked Before Closing Layer 1

- Create the first Payload admin user at `/admin`.
- Connect the repo to Vercel and validate a Preview deployment.

## Notes

- If Neon connection strings include `sslmode=require`, update them to `sslmode=verify-full` when possible. The current Postgres driver accepts the URL but warns that SSL mode semantics will change in a future major version.

## Mobile-First Gate

Every UI change from Layer 1 onward must be checked on a mobile viewport before it is marked complete:

- No horizontal overflow.
- Text remains readable.
- Primary CTAs are visible and reachable.
- Forms use touch-friendly controls.
- No content overlap.
