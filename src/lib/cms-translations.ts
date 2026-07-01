import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Config } from "@/payload-types";

// UI strings live in the Payload `translations` collection (one row per
// dot-notation key, `value` localized). We fetch every row for a locale, rebuild
// the nested next-intl messages object, and cache it under a single tag so a
// content edit (revalidateTranslationsAfterChange) refreshes all pages. Results
// merge OVER the static JSON seed in i18n/request.ts, so DB is the source of
// truth while the JSON stays as an offline/empty-DB fallback.

const DEFAULT_LOCALE = "en";
export const TRANSLATIONS_TAG = "translations";

type Messages = Record<string, unknown>;

// Write `value` into a nested object following a dot path, e.g.
// "footer.tagline" -> { footer: { tagline: value } }. Mutates `root` in place;
// callers pass a fresh object.
function assignPath(root: Messages, dotKey: string, value: string): void {
  const parts = dotKey.split(".");
  let node = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!isRecord(node[part])) node[part] = {};
    node = node[part] as Messages;
  }
  node[parts[parts.length - 1]] = value;
}

function isRecord(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function fetchTranslations(locale: string): Promise<Messages> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    // Cast: the generated `Config` union only includes "translations" once
    // `payload generate:types` has run against this collection.
    collection: "translations" as never,
    locale: locale as Config["locale"],
    limit: 2000,
    pagination: false,
    depth: 0
  });

  const messages: Messages = {};
  for (const row of result.docs as Array<{ key?: string | null; value?: string | null }>) {
    if (row.key && typeof row.value === "string" && row.value.length > 0) {
      assignPath(messages, row.key, row.value);
    }
  }
  return messages;
}

const getDbMessagesCached = cache((locale: string) =>
  unstable_cache(() => fetchTranslations(locale), ["cms", "translations", locale], {
    tags: [TRANSLATIONS_TAG]
  })()
);

// Never throws: before the collection is migrated/seeded the query would fail,
// so we degrade to an empty object and let the JSON fallback carry the UI.
export async function getDbMessages(locale?: string): Promise<Messages> {
  try {
    return await getDbMessagesCached(locale ?? DEFAULT_LOCALE);
  } catch (error: unknown) {
    console.warn("[i18n] translations DB unavailable, using JSON fallback:", getErrorMessage(error));
    return {};
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
