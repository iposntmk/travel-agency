"use server";

import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";
import { validateVoucher } from "@/services/voucher-service";
import { checkRateLimit } from "@/services/rate-limit";
import { requestIp } from "./request-ip";
import type { ActionResult } from "./submit-booking";

const validateVoucherSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^TC-[A-Z0-9]{4}-[A-Z0-9]{4}$/i, "Invalid voucher code format"),
  productType: z.enum(["tours", "experiences"]),
  productId: z.union([z.string().min(1), z.number()])
});

export type ValidateVoucherInput = z.infer<typeof validateVoucherSchema>;

export type VoucherCheckResult = {
  valid: boolean;
  discountLabel?: string;
  promotionName?: string;
  reason?: "not-found" | "expired" | "used" | "not-applicable";
};

/** Public voucher check. Rate-limited (10/min/IP) against brute-forcing codes. */
export async function checkVoucher(input: ValidateVoucherInput): Promise<ActionResult<VoucherCheckResult>> {
  const parsed = validateVoucherSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: { type: "validation", message: "Voucher codes look like TC-XXXX-XXXX." }
    };
  }

  const requester = (await requestIp()) ?? "anonymous";
  if (!(await checkRateLimit(requester, { keyPrefix: "voucher", limit: 10, windowMs: 60_000 }))) {
    return {
      ok: false,
      error: { type: "rate-limit", message: "Too many attempts. Please try again shortly." }
    };
  }

  try {
    const payload = await getPayloadClient();
    const result = await validateVoucher(payload, parsed.data.code, {
      relationTo: parsed.data.productType,
      id: parsed.data.productId
    });

    if (!result.valid) {
      return { ok: true, data: { valid: false, reason: result.reason } };
    }

    const discountLabel =
      result.discountType === "percentage" ? `-${result.discountValue}%` : `-$${result.discountValue}`;
    return {
      ok: true,
      data: { valid: true, discountLabel, promotionName: result.promotionName }
    };
  } catch (error: unknown) {
    console.error("[validate-voucher] failed", error);
    return {
      ok: false,
      error: { type: "system", message: "We couldn’t check this code. Please try again later." }
    };
  }
}
