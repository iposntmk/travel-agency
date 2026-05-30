import { describe, expect, it } from "vitest";
import type { CollectionBeforeValidateHook } from "payload";
import { sanitizeTextField } from "@/collections/payload/hooks/sanitize-ugc";

function run(hook: CollectionBeforeValidateHook, data: Record<string, unknown>) {
  return hook({ data, operation: "create", req: {} } as Parameters<CollectionBeforeValidateHook>[0]);
}

describe("sanitizeTextField beforeValidate hook", () => {
  it("strips HTML and script blocks from the target field", async () => {
    const result = await run(sanitizeTextField("content"), {
      content: "Great tour <strong>5/5</strong><script>alert(1)</script>",
      status: "pending"
    });
    expect(result).toMatchObject({ content: "Great tour 5/5", status: "pending" });
  });

  it("collapses markup-only input to empty string so required validation fails", async () => {
    const result = await run(sanitizeTextField("content"), { content: "<div> </div>" });
    expect(result).toMatchObject({ content: "" });
  });

  it("leaves non-string and missing values untouched", async () => {
    expect(await run(sanitizeTextField("comment"), { comment: undefined, rating: 5 })).toMatchObject({
      rating: 5
    });
    expect(await run(sanitizeTextField("comment"), { rating: 4 })).toMatchObject({ rating: 4 });
  });

  it("returns data unchanged when data is nullish", async () => {
    expect(await sanitizeTextField("content")({ operation: "create", req: {} } as Parameters<CollectionBeforeValidateHook>[0])).toBeUndefined();
  });
});
