import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { generateVariants } from "@/services/media-processor";
import { getEnv } from "@/config/env";

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const env = getEnv();
  const receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });
  try {
    return await receiver.verify({
      signature: req.headers.get("upstash-signature") ?? "",
      body: rawBody,
      url: `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/media-process`,
    });
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!(await verifySignature(req, rawBody))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId, r2Key } = JSON.parse(rawBody) as { mediaId: number; r2Key: string };

  const payload = await getPayload({ config: configPromise });

  const media = await payload.findByID({ collection: "media", id: mediaId, overrideAccess: true });

  // Idempotency: already processed
  if (media?.status === "ready") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const variants = await generateVariants(String(mediaId), r2Key);

    await payload.update({
      collection: "media",
      id: mediaId,
      data: { status: "ready", variants, processingError: null },
      overrideAccess: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown processing error";

    await payload.update({
      collection: "media",
      id: mediaId,
      data: { status: "failed", processingError: message },
      overrideAccess: true,
    });

    // Non-2xx causes QStash to retry
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
