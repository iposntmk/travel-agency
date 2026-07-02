import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import withBundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import { getNextConfigEnv } from "./src/config/env";

const env = getNextConfigEnv();
const devOrigin = env.DEV_ORIGIN ? new URL(env.DEV_ORIGIN) : undefined;
const robotsHeader = "noindex, nofollow, noarchive, nosnippet";
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://www.google.com https://maps.google.com https://www.youtube-nocookie.com",
  "media-src 'self' https: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
  "report-to csp-endpoint"
].join("; ");
const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  { key: "Reporting-Endpoints", value: 'csp-endpoint="/api/csp-report"' },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

// Listing pages read searchParams (filters/pagination) so Next renders them
// dynamically on every request — revalidate/ISR does not apply. Their HTML is
// user-agnostic (currency/consent are client-side), so let Netlify's CDN cache
// them instead: 5 min fresh + serve-stale-while-revalidating. Netlify keys the
// function-response cache by full URL including the query string, so each
// filter combination caches separately. Vercel ignores this header (harmless).
const LOCALES_PATTERN = "(en|fr|es|de|it|pt|zh-Hans|zh-Hant)";
const netlifyCdnCacheHeader = {
  key: "Netlify-CDN-Cache-Control",
  value: "public, durable, s-maxage=300, stale-while-revalidate=86400"
};
const dynamicListingSources = [
  `/:locale${LOCALES_PATTERN}/tours`,
  `/:locale${LOCALES_PATTERN}/car-rentals`,
  `/:locale${LOCALES_PATTERN}/cruises`,
  `/:locale${LOCALES_PATTERN}/blog/all`,
  `/:locale${LOCALES_PATTERN}/blog/destination/:slug`
];

function buildRemotePatterns() {
  const patterns: { protocol: "https"; hostname: string }[] = [
    { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    { protocol: "https", hostname: "**.cloudflare.com" },
    { protocol: "https", hostname: "**.r2.dev" },
    { protocol: "https", hostname: "images.unsplash.com" }
  ];

  if (env.R2_PUBLIC_URL) {
    try {
      const hostname = new URL(env.R2_PUBLIC_URL).hostname;
      const wildcardHostname = `**.${hostname.split(".").slice(-2).join(".")}`;
      const isAlreadyAllowed = patterns.some((p) => p.hostname === hostname || p.hostname === wildcardHostname);

      if (!isAlreadyAllowed) {
        patterns.push({ protocol: "https", hostname });
      }
    } catch {
      return patterns;
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // Allows a parallel prod build/serve (e.g. QA) without clobbering the .next
  // directory a running dev server holds open.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  ...(devOrigin
    ? {
        allowedDevOrigins: [devOrigin.hostname],
        experimental: {
          serverActions: {
            allowedOrigins: [devOrigin.host]
          }
        }
      }
    : {}),
  images: {
    remotePatterns: buildRemotePatterns(),
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2_678_400
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          ...(env.ALLOW_INDEXING ? [] : [{ key: "X-Robots-Tag", value: robotsHeader }])
        ]
      },
      ...dynamicListingSources.map((source) => ({
        source,
        headers: [netlifyCdnCacheHeader]
      }))
    ];
  }
};

const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true", openAnalyzer: false });
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default analyze(withPayload(withNextIntl(nextConfig)));
