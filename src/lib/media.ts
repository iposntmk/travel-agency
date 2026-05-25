import type { Media } from "@/payload-types";
import { getPayloadStorageEnv } from "@/config/env";

export interface ResolvedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isFallback: boolean;
}

const FALLBACK_URL = "/og-fallback.svg";
const FALLBACK_ALT = "TC Travel Vietnam";

type MaybeMedia = number | Media | null | undefined;

function encodeKey(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function publicR2Url(key: string | null | undefined, publicBaseUrl?: string): string | undefined {
  if (!key || !publicBaseUrl) return undefined;
  return `${publicBaseUrl.replace(/\/$/, "")}/${encodeKey(key)}`;
}

function getR2PublicBaseUrl(): string | undefined {
  try {
    return getPayloadStorageEnv()?.R2_PUBLIC_URL;
  } catch {
    return undefined;
  }
}

function isUsableRemoteUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith("/")) return true;

  try {
    const parsed = new URL(url);
    return parsed.hostname !== "dash.cloudflare.com";
  } catch {
    return false;
  }
}

export function resolveImage(input: MaybeMedia, fallbackAlt?: string, publicBaseUrl = getR2PublicBaseUrl()): ResolvedImage {
  if (!input || typeof input === "number") {
    return { url: FALLBACK_URL, alt: fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  if (input.status !== "ready") {
    return { url: FALLBACK_URL, alt: input.alt ?? fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  const url =
    (isUsableRemoteUrl(input.publicUrl) ? input.publicUrl : undefined) ??
    publicR2Url(input.r2Key, publicBaseUrl) ??
    publicR2Url(input.filename, publicBaseUrl) ??
    (isUsableRemoteUrl(input.url) ? input.url : undefined) ??
    FALLBACK_URL;

  return {
    url,
    alt: input.alt ?? fallbackAlt ?? FALLBACK_ALT,
    width: input.width ?? undefined,
    height: input.height ?? undefined,
    isFallback: url === FALLBACK_URL
  };
}

export function resolveOgImage(input: MaybeMedia, siteUrl: string): string {
  const resolved = resolveImage(input);
  if (resolved.isFallback) {
    return `${siteUrl.replace(/\/$/, "")}${FALLBACK_URL}`;
  }
  return resolved.url;
}
