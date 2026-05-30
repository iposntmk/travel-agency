import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
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
  "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "media-src 'self' https: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
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
      }
    ];
  }
};

export default withPayload(nextConfig);
