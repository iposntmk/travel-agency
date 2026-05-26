import { NextResponse } from "next/server";
import { getHealthEnv } from "@/config/env";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();

  try {
    const payload = await getPayloadClient();
    await payload.find({
      collection: "tours",
      limit: 1,
      depth: 0,
      overrideAccess: true
    });

    return NextResponse.json({
      ok: true,
      db: true,
      region: getHealthEnv().VERCEL_REGION ?? "local",
      latencyMs: Math.round(performance.now() - startedAt)
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        db: false,
        region: getHealthEnv().VERCEL_REGION ?? "local",
        latencyMs: Math.round(performance.now() - startedAt)
      },
      { status: 503 }
    );
  }
}
