import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { getNextConfigEnv } from "./src/config/env";

const env = getNextConfigEnv();
const devOrigin = env.DEV_ORIGIN ? new URL(env.DEV_ORIGIN) : undefined;

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
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default withPayload(nextConfig);
