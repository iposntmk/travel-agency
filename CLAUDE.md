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
