import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { createSignedPutUrl, r2PublicUrl } from "@/lib/r2";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 20 * 1024 * 1024;

const requestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME),
  fileSize: z.number().int().positive().max(MAX_SIZE),
  alt: z.string().min(1).max(500),
  caption: z.string().max(1000).optional(),
});

export type SignedUploadRequest = z.infer<typeof requestSchema>;

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { filename, mimeType, fileSize, alt, caption } = parsed.data;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";

  const media = await payload.create({
    collection: "media",
    data: { alt, caption, status: "uploading" },
    overrideAccess: false,
    user,
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const r2Key = `originals/${year}/${month}/${media.id}/original.${ext}`;

  await payload.update({
    collection: "media",
    id: media.id,
    data: { r2Key, publicUrl: r2PublicUrl(r2Key) },
    overrideAccess: true,
  });

  const signedUrl = await createSignedPutUrl(r2Key, mimeType, 600);

  return NextResponse.json({ signedUrl, mediaId: media.id, r2Key });
}
