import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Client } from "@upstash/qstash";
import { getEnv } from "@/config/env";
import { completeMediaUploadSchema } from "@/schemas/media";

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = completeMediaUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { mediaId, width, height } = parsed.data;

  const media = await payload.findByID({
    collection: "media",
    id: mediaId,
    overrideAccess: false,
    user,
  });

  if (!media?.r2Key) {
    return NextResponse.json({ error: "Media not found or upload incomplete" }, { status: 404 });
  }

  if (media.status === "ready") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const update: Record<string, unknown> = { status: "processing" };
  if (width) update.width = width;
  if (height) update.height = height;

  await payload.update({
    collection: "media",
    id: mediaId,
    data: update,
    overrideAccess: true,
  });

  const env = getEnv();
  const qstash = new Client({ token: env.QSTASH_TOKEN });

  await qstash.publishJSON({
    url: `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/media-process`,
    body: { mediaId, r2Key: media.r2Key, jobKey: `media:${mediaId}:${media.r2Key}` },
    retries: 3,
  });

  return NextResponse.json({ ok: true });
}
