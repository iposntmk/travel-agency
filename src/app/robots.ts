import type { MetadataRoute } from "next";
import { getSeoEnv } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const env = getSeoEnv();

  if (env.ALLOW_INDEXING) {
    const base = env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

    return {
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      ...(base ? { sitemap: `${base}/sitemap.xml` } : {})
    };
  }

  return {
    rules: { userAgent: "*", disallow: "/" }
  };
}
