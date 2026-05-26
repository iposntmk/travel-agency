import type { CollectionBeforeValidateHook } from "payload";
import type { Booking } from "@/payload-types";
import { sanitizeOptionalPlainText } from "@/lib/sanitize";
import { createInitialStatusHistory } from "@/services/booking-transitions";

export const hardenBookingBeforeValidate: CollectionBeforeValidateHook<Booking> = ({ data, operation, req }) => {
  const next = { ...data };

  if (typeof data?.specialRequest === "string") {
    next.specialRequest = sanitizeOptionalPlainText(data.specialRequest) ?? null;
  }

  if (operation === "create" && !req.user && req.payloadAPI !== "local") {
    next.status = "Pending";
    next.statusHistory = createInitialStatusHistory("public");
  }

  return next;
};
