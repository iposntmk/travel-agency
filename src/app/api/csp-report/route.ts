import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/services/rate-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_384;

type CspViolation = {
  documentUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
};

// Normalize the two report shapes: legacy `report-uri` posts
// { "csp-report": {...} } as application/csp-report; the Reporting API
// `report-to` posts an array of { type: "csp-violation", body: {...} }.
function extractViolations(raw: unknown): CspViolation[] {
  const out: CspViolation[] = [];
  const pushLegacy = (r: Record<string, unknown>) => {
    out.push({
      documentUri: str(r["document-uri"]),
      violatedDirective: str(r["violated-directive"]),
      effectiveDirective: str(r["effective-directive"]),
      blockedUri: str(r["blocked-uri"])
    });
  };

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const body = isRecord(entry) && isRecord(entry.body) ? entry.body : undefined;
      if (body) {
        out.push({
          documentUri: str(body["documentURL"] ?? body["document-uri"]),
          violatedDirective: str(body["violatedDirective"] ?? body["violated-directive"]),
          effectiveDirective: str(body["effectiveDirective"] ?? body["effective-directive"]),
          blockedUri: str(body["blockedURL"] ?? body["blocked-uri"])
        });
      }
    }
  } else if (isRecord(raw) && isRecord(raw["csp-report"])) {
    pushLegacy(raw["csp-report"]);
  }

  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  // Cap log volume — CSP endpoints are an easy flood target.
  const allowed = await checkRateLimit(`csp:${ip}`, {
    keyPrefix: "csp-report",
    limit: 60,
    windowMs: 60_000
  });
  if (!allowed) return noContent();

  let body: string;
  try {
    body = await req.text();
  } catch {
    return noContent();
  }
  if (body.length > MAX_BODY_BYTES) return noContent();

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return noContent();
  }

  for (const v of extractViolations(raw)) {
    if (!v.violatedDirective && !v.effectiveDirective) continue;
    console.warn("[csp-report]", {
      directive: v.effectiveDirective ?? v.violatedDirective,
      blockedUri: v.blockedUri,
      documentUri: v.documentUri
    });
  }

  return noContent();
}
