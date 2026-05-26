import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  jsonLdScriptContent,
  tourProductJsonLd
} from "@/lib/structured-data";

describe("structured data helpers", () => {
  it("builds absolute URLs without double slashes", () => {
    expect(absoluteUrl("https://example.com/", "/tours/hue")).toBe("https://example.com/tours/hue");
    expect(absoluteUrl("https://example.com", "blog/hoi-an")).toBe("https://example.com/blog/hoi-an");
  });

  it("escapes script-breaking characters in JSON-LD", () => {
    expect(jsonLdScriptContent({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });

  it("creates breadcrumb list positions", () => {
    expect(
      breadcrumbJsonLd([
        { name: "Home", url: "https://example.com" },
        { name: "Tours", url: "https://example.com/tours" }
      ])
    ).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Home" },
        { position: 2, name: "Tours" }
      ]
    });
  });

  it("omits offers when a tour has no price", () => {
    expect(
      tourProductJsonLd({
        title: "Custom tour",
        url: "https://example.com/tours/custom",
        description: "A custom itinerary"
      })
    ).not.toHaveProperty("offers");
  });
});
