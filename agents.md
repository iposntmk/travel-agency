# agents.md

Guidelines for AI coding agents — **Claude Code, Codex, Gemini CLI, Grok, opencode** — working in this repository. This file is the canonical, git-tracked protocol shared by every agent; `CLAUDE.md`, `GEMINI.md`, and `.grok/` point here.

## Knowledge stores: what to read and what to update

Three stores hold project knowledge. They are **not** interchangeable — know which is authoritative.

| Store | Holds | Shared? | Authoritative? |
|---|---|---|---|
| **Repo `.md` + code (git)** | Intent, status, roadmap, guardrails, the code | Yes — every agent, human, machine, CI | **Yes — source of truth** |
| **agentmemory** (local MCP server `:3111`, shared by all agents on this machine) | Cross-session recall: decisions, gotchas, "what we did" | This machine only (not in git) | No — a fast notebook; verify against code |
| **codegraph** (`.codegraph/`, local) | Derived code-structure index | This machine only | No — regenerated from code, never hand-edited |

**Conflict order:** code > git `.md` (for intent/status) > agentmemory (treat as a hint, verify before trusting).

### Read — before starting work
1. **Always** read `CLAUDE.md` / this file (guardrails) + `docs/CURRENT_STATUS.md` (current layer/stage, last commits, next work). Mandatory and cheap.
2. **Recall agentmemory** for the topic/files you'll touch (`memory_recall`, project `Travel-Agency`). Hits are hints — verify against current code; memory can be stale.
3. Use codegraph / grep to locate code as the task needs (not an up-front read).

### Write — after a task, or after finishing/advancing a layer or stage
Update **both git docs and agentmemory** whenever progress is non-trivial (task done, layer/stage changed, a decision made, or a non-obvious gotcha learned):
1. **git `.md`** — update `docs/CURRENT_STATUS.md` (what shipped + commit hash, what's verified, next work). Update `CLAUDE.md` / this file only when a guardrail or architecture rule changes. Commit with a clear "why" message.
2. **agentmemory** — `memory_save` a concise entry (project `Travel-Agency`) mirroring that progress + any decision/gotcha, so the next session (any agent) recalls it fast.
3. **codegraph** — do **not** hand-edit; it regenerates from code.

Skip both for trivial changes (typo, one-line refactor) — the commit message is enough. Over-documenting causes drift.

### Keep the stores in sync (avoid drift)
- git is the single source of truth for anything shared. If memory and docs disagree, fix the stale one; git docs win for shared facts.
- agentmemory is per-machine — a teammate or a fresh clone only sees git. Anything that must survive a machine switch or be read by humans/CI goes in git.
- All agents share **one** agentmemory backend (`:3111`); run in the same project/cwd (or pass project `Travel-Agency`) so scope matches. The backend must be running (`agentmemory`).

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
6. If the work completed a task or changed a layer/stage: update `docs/CURRENT_STATUS.md` **and** `memory_save` to agentmemory (see **Knowledge stores** above). Skip for trivial changes.
