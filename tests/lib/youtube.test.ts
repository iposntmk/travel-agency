import { describe, expect, it } from "vitest";
import { parseYouTubeId } from "@/lib/youtube";

describe("parseYouTubeId", () => {
  it("extracts id from watch URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extracts id from youtu.be short URL", () => {
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extracts id from embed URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("accepts a bare 11-char id", () => {
    expect(parseYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("returns null for empty or invalid", () => {
    expect(parseYouTubeId("")).toBeNull();
    expect(parseYouTubeId(null)).toBeNull();
    expect(parseYouTubeId("https://example.com/x")).toBeNull();
  });
});
