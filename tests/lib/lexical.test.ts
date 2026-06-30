import { describe, expect, it } from "vitest";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";

const sample = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Hello " },
          { type: "text", text: "world", format: 1 }
        ]
      },
      {
        type: "heading",
        tag: "h2",
        children: [{ type: "text", text: "Itinerary" }]
      }
    ]
  }
};

describe("lexicalToHtml", () => {
  it("renders paragraphs and bold runs", () => {
    expect(lexicalToHtml(sample)).toContain("<p>Hello <strong>world</strong></p>");
  });

  it("renders heading with the requested tag and an anchor id", () => {
    expect(lexicalToHtml(sample)).toContain('<h2 id="itinerary">Itinerary</h2>');
  });

  it("escapes HTML special characters", () => {
    const escaped = lexicalToHtml({
      root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "<script>" }] }] }
    });
    expect(escaped).toContain("&lt;script&gt;");
  });

  it("returns empty string for null input", () => {
    expect(lexicalToHtml(null)).toBe("");
  });
});

describe("lexicalToPlainText", () => {
  it("strips formatting and concatenates text", () => {
    expect(lexicalToPlainText(sample)).toContain("Hello world");
    expect(lexicalToPlainText(sample)).toContain("Itinerary");
  });

  it("truncates with ellipsis", () => {
    const long = {
      root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "a".repeat(500) }] }] }
    };
    const text = lexicalToPlainText(long, 50);
    expect(text.endsWith("…")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(50);
  });
});
