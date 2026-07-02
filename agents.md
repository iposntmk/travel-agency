# AGENTS.md

Canonical guidelines for all AI coding agents — **Claude Code, Codex, opencode** — in this repository. `CLAUDE.md` adds Claude Code-specific tooling and points here for everything else.

## MANDATORY: Three tools every session (all agents)

> **Hard requirement. No exceptions. No skipping.**

### 1. Caveman / terse mode
- **Claude Code**: Invoke `Skill("caveman")` at session start — activates compressed token-efficient output
- **All other agents**: Default to terse, fragment-style output. Drop filler, articles, pleasantries. Pattern: `[thing] [action] [reason]`

### 2. agentmemory recall + save (ALL agents)
- **Before touching any code**: `memory_recall` project `Travel-Agency` — load cross-session context, past decisions, gotchas
- **After non-trivial work**: `memory_save` project `Travel-Agency` — persist decisions + progress
- Skip `memory_save` only for trivial one-liners (typo, rename). Skip `memory_recall` never.
- MCP server: `http://localhost:3111` — if unreachable, warn user and continue

### 3. codegraph before editing (ALL agents)
- **Before writing or editing any symbol**: `codegraph_explore` — returns verbatim source of relevant symbols; most often the only call needed
- Never start a grep/read loop when codegraph covers it in one call
- `codegraph_search` to locate a symbol; `codegraph_impact` before deleting/renaming
- Index lags ~1s behind writes; consult before editing, not during

### Mandatory session sequence
```
1. terse/caveman mode active
2. memory_recall project Travel-Agency  ← topic/files you'll touch
3. codegraph_explore <symbols>          ← before writing; grep/read to fill gaps
4. write code
5. memory_save project Travel-Agency    ← after non-trivial work
```

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

Package manager: **pnpm** only — never `npm install` or `yarn`.

## Architecture

### Route groups

- `src/app/(frontend)/` — public-facing Next.js pages (Server Components by default)
- `src/app/(payload)/` — Payload CMS admin panel and API routes (do not modify)
- `src/app/actions/` — Next.js Server Actions for internal mutations
- Route Handlers (`route.ts`) reserved for: external webhooks, QStash callbacks, signed upload URLs, health checks only — never for internal form mutations

### Core directories

```
src/
  collections/         # Payload collection configs + access control contracts
  collections/payload/ # Actual Payload CollectionConfig objects (Users, Media)
  schemas/             # Shared Zod schemas (booking, customer, partner, payment, env)
  services/            # Pure business logic (no React, no Payload config)
  types/domain.ts      # Canonical domain types (BookingRecord, BookingStatus, etc.)
  config/env.ts        # Central env validation — always use getEnv(), never process.env
  lib/sample-data.ts   # Static seed data used until Payload reads are wired in
tests/
  schemas/             # Zod schema unit tests
  services/            # Service unit tests (booking-transitions, etc.)
  actions/             # Server Action integration tests
  collections/         # Access control tests
```

### Key design constraints

**Booking status machine** — new inquiries always start as `Pending`. Valid transitions enforced in `src/services/booking-transitions.ts`:
```
New → Pending → Confirmed - Pay Later → Confirmed - Paid → Completed
                                      ↘ Cancelled
                           ↘ Cancelled
```
Admin reversal requires explicit audit reason. Every status change appends `StatusHistoryEntry` (actor, source, reason, timestamps) — never overwrite history.

**Idempotency** — booking submissions, payment webhooks, upload callbacks, QStash jobs must all be idempotent. Booking repository deduplicates on `idempotencyKey`.

**Server Actions return typed unions** — always `{ ok: true; data: T } | { ok: false; error: { type: "validation" | "business" | "rate-limit" | "system"; message: string; fieldErrors?: ... } }`. UI must not parse thrown exceptions for expected failures.

**Validation is 3-tier** — (1) React Hook Form + Zod resolver in UI, (2) Zod `.safeParse()` at top of every Server Action, (3) Payload hooks for business-limit enforcement. Zod schemas live in `src/schemas/` shared client+server.

**Access control** — `src/collections/access.ts` defines role helpers (`publicRead`, `staffOnly`, `adminOnly`, `isAuthenticated`). Every Payload collection must have explicit access rules — never leave access undefined.

**Environment variables** — all env vars validated at startup via `src/config/env.ts`. Import `getEnv()` — never read `process.env` directly.

**File size limits** — UI components: 150 lines. Server Actions/Services: 250 lines. Payload collection configs: 200 lines. Extract complex hooks into `/hooks` subdirectory.

### Tailwind brand palette

```
brand-blue  #0f67b1   (primary CTA, links)
brand-red   #c83232   (destination labels, accents)
brand-gold  #f4b545   (seasonal/badge)
brand-ink   #111827   (headings)
```

### Tech stack

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
| Hosting | **Netlify Free (production, cost-saving phase)** + Vercel in parallel — push `main` deploys both; single shared Neon prod DB |

## Knowledge stores

Three stores hold project knowledge — not interchangeable.

| Store | Holds | Shared? | Authoritative? |
|---|---|---|---|
| **Repo `.md` + code (git)** | Intent, status, roadmap, guardrails, the code | Yes — all agents, humans, CI | **Yes — source of truth** |
| **agentmemory** (`:3111`) | Cross-session recall: decisions, gotchas | This machine only | No — notebook; verify against code |
| **codegraph** (`.codegraph/`) | Derived code-structure index | This machine only | No — regenerated from code, never hand-edited |

**Conflict order:** code > git `.md` > agentmemory (hint only, verify before trusting).

### Read — before starting work
1. This file (guardrails) + `docs/CURRENT_STATUS.md` (current layer/stage, last commits, next work)
2. `memory_recall` project `Travel-Agency` — cross-session context (hints; verify against code)
3. `codegraph_explore` / grep to locate code as needed (not an up-front full read)

### Write — after a task
Update **both git docs and agentmemory** for non-trivial work:
1. `docs/CURRENT_STATUS.md` — what shipped + commit hash, what's verified, next work
2. `memory_save` project `Travel-Agency` — mirror progress + decisions/gotchas
3. codegraph — do **not** hand-edit; regenerates from code

Skip both for trivial changes (typo, rename) — commit message is enough.

## Before writing any code

1. Read this file (guardrails, architecture, constraints)
2. `docs/CURRENT_STATUS.md` — current layer/stage, last shipped commits, next work
3. Relevant domain doc: booking → `docs/BOOKING_FLOW.md` + `docs/DATABASE_SCHEMA.md`; media → `docs/MEDIA_STRATEGY.md`; perf/SEO/security → `docs/toiuu.md`; coding rules → `docs/CODING_GUIDELINES.md`
4. `pnpm typecheck` and `pnpm test` — confirm baseline green before changes

## Workflow

```
understand task → memory_recall → codegraph_explore → write code → typecheck → test → commit → push → memory_save
```

Never skip typecheck or tests before committing. Tests fail before your changes → report to user, do not proceed.

## Coding rules (authoritative: docs/CODING_GUIDELINES.md)

- `pnpm` only — never `npm install` or `yarn`
- Never read `process.env` directly — use `getEnv()` from `src/config/env.ts`
- Server Actions must return typed unions — never throw for expected failures
- Every Payload collection must have explicit access rules — never leave undefined
- New booking inquiries always start as `Pending` — never bypass `src/services/booking-transitions.ts`
- All status changes append to history — never overwrite `StatusHistoryEntry[]`
- File size limits: components 150 lines, actions/services 250 lines, collection configs 200 lines

## Deployment

```
git commit → git push origin main → Netlify AND Vercel both auto-deploy production
```

- **Production hosting is Netlify Free** (https://tc-travel.netlify.app) — deliberate cost decision while traffic is low. Vercel kept in parallel. Both targets point at the **same Neon prod DB**.
- Netlify build baseline is `netlify.toml` + `scripts/netlify-build.sh` and is **verified working — do not change it without a measured reason**:
  - `@netlify/plugin-nextjs` plugin (defaults fail without it, exit 2), `publish = ".next"`, `NODE_VERSION = "22"`.
  - `SECRETS_SCAN_OMIT_KEYS` must list every `NEXT_PUBLIC_*` var (Next inlines them into the client bundle; Netlify secrets scanning fails the build otherwise). Add new `NEXT_PUBLIC_*` vars to this list.
  - `netlify-build.sh` runs `pnpm payload:migrate` **only when `$CONTEXT=production`** (Netlify var, not `VERCEL_ENV`) — preview builds must never touch the prod DB.
- Data (Neon Postgres, Cloudflare R2, Payload content) is external — independent of deployments. Redeploy never loses data.
- Do not run `vercel --prod` / `netlify deploy` from local unless user explicitly asks. If used, `git push` immediately after.
- Do not commit `.vercel/`, `.netlify/`, `.env*.local`, or any file under `API-keys/`
- Full detail: `docs/NETLIFY_FREE_DEPLOYMENT_PLAN.md` (setup + risks), `docs/NETLIFY_FREE_LUU_Y.md` (Free limits + upgrade triggers).

## Netlify Free + frontend performance rules (MANDATORY)

Operating principle: **admin/Payload slow is acceptable; public pax-facing pages slow is not.** Netlify Free has hard limits (100 GB bandwidth, ~125k function invocations, 10s function timeout, 300 build min/month) — cache hits cost nothing, cache misses cost money and UX.

### Rendering & caching (source of today's slow-page bugs)
1. **Reading `searchParams` in a page forces dynamic rendering on every request** — `revalidate` is silently ignored. Build-table tell: route shows `●` but no revalidate column. Never read `searchParams` (page or `generateMetadata`) unless the page actually uses filters/pagination.
2. Dynamic listing pages (`/tours`, `/car-rentals`, `/cruises`, `/blog/all`, `/blog/destination/[slug]`) are CDN-cached via `Netlify-CDN-Cache-Control` (s-maxage=300 + SWR) in `next.config.ts` `dynamicListingSources`. **Any new query-param page must be added to that list.** Netlify keys the cache by full URL including query string, so filters cache per-combination. Vercel ignores the header (harmless).
3. **Every CMS read must go through `cache()` + `unstable_cache` with tags** (pattern: `src/lib/cms.ts`, `src/lib/cms-list.ts`). A raw `payload.find()` in a page/component path is a bug — it hits Neon (US↔Singapore latency) per request.
4. **Every content collection needs revalidate hooks** (`src/collections/payload/hooks/revalidate-content.ts`, `afterChange`/`afterDelete`) matching the cache tags. CarRentals was missed for months — check when adding collections.
5. `revalidateTag` purges the Next data cache but **not** Netlify's CDN cache — content edits can serve stale HTML up to `s-maxage` (5 min). Acceptable; do not "fix" by removing CDN caching.

### Cost/limit guardrails
6. **Images stay on Cloudflare R2** — never serve media through Netlify (burns the 100 GB bandwidth limit).
7. **No synchronous Sharp / heavy work in any request path** — Free function timeout is 10s. Image processing goes through QStash → `/api/qstash/media-process`.
8. Heavy new dependencies risk the Lambda bundle limit (50 MB zipped) — Payload+Sharp+Lexical already fits tightly; check deploy logs after adding server deps.
9. Keep `ALLOW_INDEXING=false` until launch sign-off — crawlers burn function invocations. Never enable indexing on the `*.netlify.app` subdomain.
10. **R2 CORS is per-origin**: every new deploy domain must be added to the R2 bucket CORS `AllowedOrigins`, or admin uploads fail with CORS/"Failed to fetch".

### Dev ergonomics
11. `NEXT_DIST_DIR=.next-prod pnpm build` builds into a separate dist dir so a running dev server's `.next` isn't clobbered (env hook in `next.config.ts`; ignored by git/eslint).
12. Do not assume Vercel behavior on Netlify — verify build output and runtime headers (`x-nextjs-cache`, `netlify-cdn-cache-control`) after deploy.

## What NOT to do

- Do not modify `src/app/(payload)/` unless task is specifically Payload admin
- Do not create Route Handlers for internal form mutations — use Server Actions
- Do not add comments describing what code does — only comment non-obvious WHY
- Do not add error handling for scenarios that cannot happen
- Do not design for hypothetical future requirements
- Do not deploy from local for normal features — use git push
- Do not commit `.vercel/` (in `.gitignore`)

## ECC Integration (Agent Harness Operating System)

This project integrates **ECC v2.0.0** (https://github.com/affaan-m/ECC) — the agent harness performance optimization system. ECC provides 271+ skills, 67+ agents, hooks, rules, and cross-harness workflows.

### ECC Installation

ECC is installed via npm package `ecc-universal@2.0.0`:
```bash
pnpm add -D ecc-universal
```

ECC files are in `node_modules/ecc-universal/`:
- `agents/` — Agent definitions (markdown with YAML frontmatter)
- `skills/` — Skill definitions (SKILL.md format)
- `hooks/` — Hook scripts (pre/post tool use)
- `rules/` — Coding rules (immutability, TypeScript, security)
- `config/` — MCP configurations

### ECC Skills (Loaded in .claude/skills/)

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `ecc-planner` | Implementation planning | Complex features, refactoring |
| `ecc-architect` | System design | Architectural decisions |
| `ecc-tdd-guide` | Test-driven development | New features, bug fixes |
| `ecc-code-review` | Code quality review | After writing/modifying code |
| `ecc-security-review` | Security analysis | Before commits, sensitive code |
| `ecc-build-fix` | Build error fixes | When build fails |
| `ecc-e2e-testing` | E2E testing (Playwright) | Critical user flows |

### ECC Agent Orchestration

Use ECC skills proactively:
- Complex feature requests → **ecc-planner**
- Code just written/modified → **ecc-code-review**
- Bug fix or new feature → **ecc-tdd-guide**
- Architectural decision → **ecc-architect**
- Security-sensitive code → **ecc-security-review**
- Build errors → **ecc-build-fix**

### ECC Rules

ECC coding style and security rules are enforced via `.claude/rules/ecc-*.md`:
- **Immutability**: Always create new objects, never mutate
- **TypeScript**: Strict types, no `any`, explicit public APIs
- **Security**: No hardcoded secrets, validate inputs, parameterized queries
- **Code Quality**: Small functions (<50 lines), small files (<800 lines)

### ECC Agent Files

ECC agent definitions are available in `node_modules/ecc-universal/agents/`:
- `planner.md` — Implementation planning
- `architect.md` — System design
- `tdd-guide.md` — Test-driven development
- `code-reviewer.md` — Code review
- `security-reviewer.md` — Security analysis
- `build-error-resolver.md` — Build error fixes
- `e2e-runner.md` — E2E testing

## After completing a task

1. `pnpm typecheck` — zero errors
2. `pnpm test` — all pass
3. `pnpm lint` — fix new errors
4. Commit with clear "why" message
5. Push — Vercel auto-deploys
6. Non-trivial work: update `docs/CURRENT_STATUS.md` + `memory_save` project `Travel-Agency`

## Development docs

Key files before writing code in an area:

- `docs/CURRENT_STATUS.md` — exact current layer/stage, last shipped commits, next-dev handoff (single source of truth for status)
- `docs/CODING_GUIDELINES.md` — architectural guardrails (authoritative)
- `docs/BOOKING_FLOW.md` — customer journey and status transitions
- `docs/DATABASE_SCHEMA.md` — full Payload collection field reference
- `docs/TESTING_STRATEGY.md` — test plan and priority cases
- `docs/MEDIA_STRATEGY.md` — R2 upload and Sharp variant pipeline
- `docs/EXTENSION_GUIDE.md` — how to add markets, payment providers, OTA integrations, languages
- `docs/DEVELOPMENT_APPROACH.md` — layer-by-layer build roadmap
- `docs/toiuu.md` — performance, SEO, security, and production readiness backlog
- `docs/NETLIFY_FREE_DEPLOYMENT_PLAN.md` — Netlify production setup, verified config, risk checklist
- `docs/NETLIFY_FREE_LUU_Y.md` — Netlify Free limits, weekly usage watch, upgrade triggers
