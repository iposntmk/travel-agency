"use server";

import { customInquirySchema, type CustomInquiryInput } from "@/schemas/custom-inquiry";
import { createCustomInquiryOnce, type CustomInquiryRecord } from "@/services/custom-inquiry-repository";
import { sendCustomInquiryEmails } from "@/services/custom-inquiry-emails";
import { checkRateLimit } from "@/services/rate-limit";
import type { ActionResult } from "./submit-booking";
import { requestIp } from "./request-ip";

export async function submitCustomInquiry(
  input: CustomInquiryInput,
  rateLimitKey?: string
): Promise<ActionResult<{ inquiry: CustomInquiryRecord; duplicate: boolean }>> {
  const parsed = customInquirySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "validation",
        message: "Please check your travel project details.",
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    };
  }

  if (!(await checkRateLimit(await customInquiryRateLimitKey(parsed.data, rateLimitKey), { keyPrefix: "custom-inquiry" }))) {
    return {
      ok: false,
      error: {
        type: "rate-limit",
        message: "Too many proposal requests. Please try again shortly."
      }
    };
  }

  try {
    const result = await createCustomInquiryOnce(parsed.data);
    if (!result.duplicate) {
      await sendCustomInquiryEmails(result.inquiry).catch(() => undefined);
    }

    return { ok: true, data: result };
  } catch {
    return {
      ok: false,
      error: {
        type: "system",
        message: "Your travel project could not be submitted. Please contact our team directly."
      }
    };
  }
}

async function customInquiryRateLimitKey(input: CustomInquiryInput, explicitKey?: string): Promise<string> {
  const requester = explicitKey ?? (await requestIp()) ?? "anonymous";
  return `${requester}:${input.email}`;
}
