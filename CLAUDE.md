# CLAUDE.md

> All project protocol, architecture, commands, coding rules, and deployment live in **`AGENTS.md`** — read that first.

## Claude Code-specific: Mandatory tools every session

| Tool | When | How |
|---|---|---|
| **Caveman skill** | Session start | `Skill("caveman")` — terse token-efficient mode |
| **agentmemory** | Before touching code | `mcp__agentmemory__memory_recall` project `Travel-Agency` |
| **codegraph** | Before writing/editing any symbol | `mcp__codegraph__codegraph_explore` |

**Sequence:** `Skill("caveman")` → `memory_recall` → `codegraph_explore` → code → `memory_save`

Skip order never allowed. Skip `memory_save` only for trivial one-liners (typo, rename).

## Netlify production — hard rules (full list: AGENTS.md § "Netlify Free + frontend performance rules")

Production runs on **Netlify Free** (parallel with Vercel, shared Neon DB). Admin slow = OK; public pages slow = bug. Before touching any page, route, caching, or env:

1. Never read `searchParams` in a page/`generateMetadata` that has no filters — it forces dynamic rendering and silently kills ISR (`revalidate` ignored).
2. New query-param page → add to `dynamicListingSources` in `next.config.ts` (Netlify CDN cache header).
3. CMS reads only via `unstable_cache`-wrapped getters (`src/lib/cms*.ts`) — never raw `payload.find()` in a render path; new collections need revalidate hooks.
4. Media stays on R2; no sync Sharp in requests (10s timeout); new `NEXT_PUBLIC_*` env → add to `SECRETS_SCAN_OMIT_KEYS` in `netlify.toml`; new domain → add to R2 bucket CORS.
5. Parallel prod build without breaking the running dev server: `NEXT_DIST_DIR=.next-prod pnpm build`.
