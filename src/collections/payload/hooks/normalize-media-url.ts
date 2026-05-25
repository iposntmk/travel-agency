import type { CollectionAfterReadHook } from "payload";
import type { Media } from "@/payload-types";
import { getPayloadStorageEnv } from "@/config/env";

interface MediaSize {
  filename?: string | null;
  url?: string | null;
}

type MediaWithSizes = Media & {
  sizes?: Record<string, MediaSize | null> | null;
};

function encodeKey(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function needsPublicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  if (url.includes("/api/media/file/")) return true;

  try {
    return new URL(url).hostname === "dash.cloudflare.com";
  } catch {
    return false;
  }
}

function publicUrl(baseUrl: string, key: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${encodeKey(key)}`;
}

function getR2PublicBaseUrl(): string | undefined {
  try {
    return getPayloadStorageEnv()?.R2_PUBLIC_URL;
  } catch {
    return undefined;
  }
}

export function normalizeMediaDocumentUrls<T extends MediaWithSizes>(
  doc: T,
  baseUrl: string | undefined
): T {
  if (!baseUrl) return doc;

  if (needsPublicUrl(doc.url) && doc.filename) {
    doc.url = publicUrl(baseUrl, doc.filename);
  }

  if (doc.sizes) {
    for (const size of Object.values(doc.sizes)) {
      if (size?.filename && needsPublicUrl(size.url)) {
        size.url = publicUrl(baseUrl, size.filename);
      }
    }
  }

  return doc;
}

export const normalizeMediaUrlAfterRead: CollectionAfterReadHook<Media> = ({ doc }) =>
  normalizeMediaDocumentUrls(doc as MediaWithSizes, getR2PublicBaseUrl());
