import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/config/env";
import { getPayloadClient } from "@/lib/payload";
import { affiliateClickEventSchema } from "@/schemas/affiliate-click";
import { checkRateLimit } from "@/services/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = affiliateClickEventSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const allowed = await checkRateLimit(`click:${ip}`, {
    keyPrefix: "affiliate-click",
    limit: 30,
    windowMs: 60_000
  });
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate-limit" }, { status: 429 });
  }

  const env = getEnv();
  const referrer = req.headers.get("referer") ?? undefined;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? undefined;
  const ipHash =
    ip === "anonymous"
      ? "anonymous"
      : createHash("sha256").update(`${env.PAYLOAD_SECRET}:${ip}`).digest("hex").slice(0, 32);

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "affiliate-clicks",
      overrideAccess: true,
      data: {
        ...parsed.data,
        referrer,
        userAgent,
        ipHash
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "system" }, { status: 500 });
  }
}
