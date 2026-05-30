import type { CollectionBeforeValidateHook } from "payload";
import { sanitizeOptionalPlainText } from "@/lib/sanitize";

/**
 * beforeValidate hook factory that strips HTML/script/control characters from a
 * user-supplied text field, forcing it to plain text before persistence. Used
 * for public UGC (comment bodies, review comments) so stored content can never
 * be rendered as executable HTML. Empty-after-sanitize collapses to "" so a
 * `required` field still fails validation rather than persisting markup-only.
 */
export function sanitizeTextField(field: string): CollectionBeforeValidateHook {
  return ({ data }) => {
    if (!data) return data;
    const record = data as Record<string, unknown>;
    if (typeof record[field] !== "string") return data;
    return { ...data, [field]: sanitizeOptionalPlainText(record[field] as string) ?? "" };
  };
}
