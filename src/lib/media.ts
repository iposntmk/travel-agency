import type { Media } from "@/payload-types";
import { getPayloadStorageEnv } from "@/config/env";

export interface ResolvedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  objectPosition?: string;
  isFallback: boolean;
}

const FALLBACK_URL = "/og-fallback.svg";
// Social platforms don't render SVG OG images, so OG-specific fallbacks use a
// raster route (/og-default) instead of the on-page SVG placeholder.
const OG_FALLBACK_URL = "/og-default";
const FALLBACK_ALT = "TC Travel Vietnam";

type MaybeMedia = number | Media | null | undefined;
type ImageVariant = "thumb" | "card" | "hero";
type VariantRecord = {
  avif?: unknown;
  webp?: unknown;
  jpg?: unknown;
  url?: unknown;
};

interface ResolveImageOptions {
  variant?: ImageVariant;
  publicBaseUrl?: string;
}

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

function asVariantRecord(value: unknown): VariantRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as VariantRecord) : undefined;
}

function variantsRecord(input: Media): Record<string, unknown> | undefined {
  return input.variants && typeof input.variants === "object" && !Array.isArray(input.variants)
    ? (input.variants as Record<string, unknown>)
    : undefined;
}

function variantValueUrl(value: unknown, publicBaseUrl: string | undefined): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return isUsableRemoteUrl(value) ? value : publicR2Url(value, publicBaseUrl);
}

function variantUrl(input: Media, variant: ImageVariant | undefined, publicBaseUrl: string | undefined): string | undefined {
  if (!variant) return undefined;

  const variants = variantsRecord(input);
  const selected = variants ? asVariantRecord(variants[variant]) : undefined;

  return (
    variantValueUrl(selected?.avif, publicBaseUrl) ??
    variantValueUrl(selected?.webp, publicBaseUrl) ??
    variantValueUrl(selected?.url, publicBaseUrl)
  );
}

function ogVariantUrl(input: Media, publicBaseUrl: string | undefined): string | undefined {
  const og = variantsRecord(input)?.og;
  const selected = asVariantRecord(og);

  return (
    variantValueUrl(og, publicBaseUrl) ??
    variantValueUrl(selected?.jpg, publicBaseUrl) ??
    variantValueUrl(selected?.url, publicBaseUrl)
  );
}

function focalPoint(input: Media): string | undefined {
  if (typeof input.focalX !== "number" || typeof input.focalY !== "number") return undefined;
  return `${clampPercent(input.focalX)}% ${clampPercent(input.focalY)}%`;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function resolveImage(input: MaybeMedia, fallbackAlt?: string, options: ResolveImageOptions = {}): ResolvedImage {
  const publicBaseUrl = options.publicBaseUrl ?? getR2PublicBaseUrl();

  if (!input || typeof input === "number") {
    return { url: FALLBACK_URL, alt: fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  if (input.status !== "ready") {
    return { url: FALLBACK_URL, alt: input.alt ?? fallbackAlt ?? FALLBACK_ALT, isFallback: true };
  }

  const url =
    variantUrl(input, options.variant, publicBaseUrl) ??
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
    objectPosition: focalPoint(input),
    isFallback: url === FALLBACK_URL
  };
}

export function resolveOgImage(input: MaybeMedia, siteUrl: string): string {
  const publicBaseUrl = getR2PublicBaseUrl();
  if (input && typeof input === "object" && input.status === "ready") {
    const ogUrl = ogVariantUrl(input, publicBaseUrl);
    if (ogUrl) return ogUrl;
  }

  const resolved = resolveImage(input, undefined, { publicBaseUrl });

  if (resolved.isFallback) {
    return `${siteUrl.replace(/\/$/, "")}${OG_FALLBACK_URL}`;
  }
  return resolved.url;
}
