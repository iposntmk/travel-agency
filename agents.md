# agents.md

Guidelines for AI coding agents (Claude Code, Codex) working in this repository.

## Before writing any code

1. Read `CLAUDE.md` — architecture rules, design constraints, file size limits
2. Read the relevant doc in `docs/` for the area you are touching
3. Run `pnpm typecheck` and `pnpm test` to confirm the baseline is green before making changes

## Workflow

```
understand task → read relevant docs → write code → typecheck → test → commit → push
```

Never skip typecheck or tests before committing. If tests fail before your changes, report to the user — do not proceed.

## Coding rules (summary — authoritative version in docs/CODING_GUIDELINES.md)

- `pnpm` only — never run `npm install` or `yarn`
- Never read `process.env` directly — use `getEnv()` from `src/config/env.ts`
- Server Actions must return `{ ok: true; data: T } | { ok: false; error: ... }` — never throw for expected failures
- Every Payload collection must have explicit access rules — never leave access undefined
- New booking inquiries always start as `Pending` — never bypass the state machine in `src/services/booking-transitions.ts`
- All status changes append to history — never overwrite `StatusHistoryEntry[]`
- File size limits: components 150 lines, actions/services 250 lines, collection configs 200 lines

## Deployment flow

```
git commit → git push origin master → Vercel auto-deploys production
```

- Do not run `vercel --prod` from local unless the user explicitly asks
- Data (Neon Postgres, Cloudflare R2) is external to deployments — pushing new code never affects existing data
- See `CLAUDE.md#deployment` for full rules

## What NOT to do

- Do not modify anything under `src/app/(payload)/` unless the task is specifically about Payload admin
- Do not add npm/yarn lockfiles
- Do not commit `.vercel/`, `.env*.local`, or any file under `API-keys/`
- Do not create Route Handlers (`route.ts`) for internal form mutations — use Server Actions
- Do not add comments that describe what the code does — only comment non-obvious WHY
- Do not add error handling for scenarios that cannot happen — trust internal guarantees
- Do not design for hypothetical future requirements

## After completing a task

1. `pnpm typecheck` — must pass with zero errors
2. `pnpm test` — must pass
3. `pnpm lint` — fix any new lint errors
4. Commit with a clear message describing why, not what
5. Push — Vercel will auto-deploy
