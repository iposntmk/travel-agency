import { type NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { postCommentSchema } from "@/schemas/comment";
import { checkRateLimit } from "@/services/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const parsed = postCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const allowed = await checkRateLimit(`comment:${ip}`, {
    keyPrefix: "post-comment",
    limit: 5,
    windowMs: 60_000
  });
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate-limit" }, { status: 429 });
  }

  const { postId, authorName, content, rating } = parsed.data;

  try {
    const payload = await getPayloadClient();

    // Confirm the target post exists and is published before accepting a comment.
    const post = await payload
      .findByID({ collection: "posts", id: postId, depth: 0, overrideAccess: true })
      .catch(() => null);
    if (!post || post.status !== "published") {
      return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
    }

    await payload.create({
      collection: "comments",
      overrideAccess: true,
      data: {
        authorName,
        content,
        ...(rating ? { rating } : {}),
        target: { relationTo: "posts", value: postId },
        status: "pending"
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "system" }, { status: 500 });
  }
}
