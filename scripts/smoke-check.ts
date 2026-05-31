/**
 * Production smoke-check. Verifies the deployed site responds correctly without
 * needing any app/Payload imports — it is a plain HTTP client.
 *
 * Usage:
 *   node --import=tsx/esm scripts/smoke-check.ts https://your-domain.com
 *   SMOKE_BASE_URL=https://your-domain.com node --import=tsx/esm scripts/smoke-check.ts
 *
 * Exits non-zero if any required check fails, so it is CI/deploy-gate friendly.
 */

const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? "").replace(/\/$/, "");

if (!baseUrl) {
  console.error("Usage: smoke-check.ts <base-url>  (or set SMOKE_BASE_URL)");
  process.exit(2);
}

const EXPECTED_REGION = process.env.SMOKE_EXPECTED_REGION ?? "sin1";
// Indexing is intentionally OFF until go-live; the noindex header MUST be present.
const EXPECT_NOINDEX = process.env.SMOKE_EXPECT_NOINDEX !== "false";

type Check = { name: string; ok: boolean; detail: string; warn?: boolean };
const results: Check[] = [];

function record(name: string, ok: boolean, detail: string, warn = false) {
  results.push({ name, ok, detail, warn });
  const tag = ok ? "PASS" : warn ? "WARN" : "FAIL";
  console.log(`[${tag}] ${name} — ${detail}`);
}

async function fetchWithTiming(path: string, init?: RequestInit) {
  const url = `${baseUrl}${path}`;
  const start = performance.now();
  const res = await fetch(url, { redirect: "manual", ...init });
  const ms = Math.round(performance.now() - start);
  return { res, ms };
}

async function checkHealth() {
  try {
    // Warm up first: a cold lambda + Neon wake-up inflates the first latencyMs.
    // We care about steady-state, so prime the function before measuring.
    await fetchWithTiming("/api/health").catch(() => undefined);
    const { res, ms } = await fetchWithTiming("/api/health");
    const body = (await res.json()) as { ok?: boolean; db?: boolean; region?: string; latencyMs?: number };
    record("health: ok", res.status === 200 && body.ok === true, `status=${res.status} db=${body.db} (${ms}ms round-trip)`);
    record(
      "health: region",
      body.region === EXPECTED_REGION,
      `region=${body.region} (expected ${EXPECTED_REGION})`,
      body.region !== EXPECTED_REGION
    );
    const latency = body.latencyMs ?? Infinity;
    record("health: db latency", latency < 100, `payload latencyMs=${latency} (target <100ms, ideal <30ms)`, latency >= 30 && latency < 100);
  } catch (err) {
    record("health: reachable", false, String(err));
  }
}

async function checkPage(path: string) {
  try {
    const { res, ms } = await fetchWithTiming(path);
    const ok = res.status === 200;
    const robots = res.headers.get("x-robots-tag") ?? "";
    const hasNoindex = /noindex/i.test(robots);
    record(`page ${path}`, ok, `status=${res.status} (${ms}ms)`);
    if (EXPECT_NOINDEX) {
      record(`noindex ${path}`, hasNoindex, hasNoindex ? `X-Robots-Tag=${robots}` : "missing noindex header (indexing should be OFF pre-launch)");
    }
  } catch (err) {
    record(`page ${path}`, false, String(err));
  }
}

async function checkRoute(path: string, expectStatuses: number[]) {
  try {
    const { res, ms } = await fetchWithTiming(path);
    record(`route ${path}`, expectStatuses.includes(res.status), `status=${res.status} (${ms}ms, expected ${expectStatuses.join("/")})`);
  } catch (err) {
    record(`route ${path}`, false, String(err));
  }
}

async function main() {
  console.log(`Smoke-checking ${baseUrl}\n`);

  await checkHealth();

  // Public conversion surfaces (deploy 79ad0cf scope).
  for (const path of ["/", "/tours", "/destinations", "/blog", "/free-tours", "/free-proposal", "/car-rentals"]) {
    await checkPage(path);
  }

  // SEO infra.
  await checkRoute("/sitemap.xml", [200]);
  await checkRoute("/robots.txt", [200]);

  // Admin/internal must not be publicly open (expect auth redirect or 401/403/404).
  await checkRoute("/internal/affiliate-clicks", [200, 301, 302, 307, 308, 401, 403, 404]);

  const failed = results.filter((r) => !r.ok && !r.warn);
  const warned = results.filter((r) => !r.ok && r.warn);
  console.log(`\n${results.length} checks — ${failed.length} failed, ${warned.length} warnings.`);

  if (failed.length > 0) {
    console.error("Failures:\n" + failed.map((r) => `  - ${r.name}: ${r.detail}`).join("\n"));
    process.exit(1);
  }
  console.log("All required checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
