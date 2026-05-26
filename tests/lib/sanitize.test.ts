import { describe, expect, it } from "vitest";
import { sanitizeOptionalPlainText, sanitizePlainText } from "@/lib/sanitize";

describe("plain text sanitizer", () => {
  it("strips markup, script blocks, and control characters", () => {
    expect(
      sanitizePlainText("  Vegan <strong>meal</strong><script>alert(1)</script><br>Window seat\u0000  ")
    ).toBe("Vegan meal\nWindow seat");
  });

  it("normalizes whitespace without flattening paragraphs", () => {
    expect(sanitizePlainText("First\t\tline\n\n\n  Second   line  ")).toBe("First line\n\nSecond line");
  });

  it("returns undefined for empty optional text", () => {
    expect(sanitizeOptionalPlainText(" <b> </b> ")).toBeUndefined();
    expect(sanitizeOptionalPlainText(null)).toBeUndefined();
  });
});
