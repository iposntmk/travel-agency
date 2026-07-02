"use server";

import { getPayloadClient } from "@/lib/payload";
import { reviewSubmitSchema, type ReviewSubmitInput } from "@/schemas/review";
import { checkRateLimit } from "@/services/rate-limit";
import { requestIp } from "./request-ip";
import type { ActionResult } from "./submit-booking";

/**
 * Public review submission. The Reviews collection keeps create: staffOnly —
 * this action (overrideAccess) is the only public write path. Every submission
 * lands as status "pending" and never displays before staff approval.
 */
export async function submitReview(input: ReviewSubmitInput): Promise<ActionResult<{ submitted: true }>> {
  const parsed = reviewSubmitSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "validation",
        message: "Please check the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    };
  }

  // Honeypot filled → pretend success, never persist.
  if (typeof input.website === "string" && input.website !== "") {
    return { ok: true, data: { submitted: true } };
  }

  const requester = (await requestIp()) ?? "anonymous";
  if (!(await checkRateLimit(requester, { keyPrefix: "review", limit: 3, windowMs: 600_000 }))) {
    return {
      ok: false,
      error: { type: "rate-limit", message: "Too many reviews submitted. Please try again later." }
    };
  }

  try {
    const payload = await getPayloadClient();

    // Reject unknown tour ids up front (also blocks reviews for paused tours).
    const tour = await payload.find({
      collection: "tours",
      where: { id: { equals: parsed.data.tourId } },
      limit: 1,
      depth: 0,
      select: { slug: true }
    });
    if (!tour.docs[0]) {
      return { ok: false, error: { type: "validation", message: "This tour could not be found." } };
    }

    await payload.create({
      collection: "reviews",
      data: {
        tour: tour.docs[0].id,
        rating: parsed.data.rating,
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail,
        comment: parsed.data.comment,
        submissionSource: "public",
        status: "pending"
      },
      overrideAccess: true
    });

    return { ok: true, data: { submitted: true } };
  } catch (error: unknown) {
    console.error("[submit-review] failed", error);
    return {
      ok: false,
      error: { type: "system", message: "We couldn’t submit your review. Please try again later." }
    };
  }
}
