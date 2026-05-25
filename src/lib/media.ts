import type { Media } from "@/payload-types";

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

export function resolveImage(input: MaybeMedia, fallbackAlt?: string): ResolvedImage {
  if (!input || typeof input === "number") {
    return { url: FALLBACK_URL, alt: fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  if (input.status !== "ready") {
    return { url: FALLBACK_URL, alt: input.alt ?? fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  const url = input.publicUrl ?? input.url ?? FALLBACK_URL;

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
