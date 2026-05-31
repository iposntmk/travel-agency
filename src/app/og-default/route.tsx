import { ImageResponse } from "next/og";

// Branded 1200x630 fallback Open Graph image. Social platforms (Facebook,
// X/Twitter, LinkedIn) do not render SVG OG images, so the static
// public/og-fallback.svg cannot be used as a share card — this route renders
// the same brand design as a PNG. Cached as a static asset.
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px",
          backgroundImage: "linear-gradient(135deg, #0f67b1, #c83232)",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ color: "#fff", fontSize: 72, fontWeight: 700 }}>TC Travel Vietnam</div>
        <div style={{ color: "#fff", fontSize: 32, opacity: 0.9, marginTop: 16 }}>
          Hoi An · Hue · Da Nang
        </div>
      </div>
    ),
    SIZE
  );
}
