import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { getNextConfigEnv } from "./src/config/env";

const env = getNextConfigEnv();
const devOrigin = env.DEV_ORIGIN ? new URL(env.DEV_ORIGIN) : undefined;

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
    remotePatterns: buildRemotePatterns()
  }
};

export default withPayload(nextConfig);
