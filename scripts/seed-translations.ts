/**
 * Seed the `translations` collection from the JSON message files.
 *
 * Source of truth for the SEED is src/i18n/messages/<locale>/common.json:
 *   - English keys define which rows exist (one row per flattened dot-key).
 *   - Each locale file supplies that locale's `value`.
 *
 * Idempotent: upserts by `key`. The English value is always (re)written; other
 * locales are written only when the JSON provides a non-empty string, so
 * hand-edits made in the admin for locales the JSON doesn't cover are preserved.
 *
 * Run: node --env-file=.env --import=tsx/esm scripts/seed-translations.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import config from "../payload.config";
import { routing } from "../src/i18n/routing";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(dirname, "../src/i18n/messages");

type Json = Record<string, unknown>;

function readLocale(locale: string): Json {
  const file = path.join(MESSAGES_DIR, locale, "common.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Json;
}

// Flatten nested messages into { "footer.tagline": "…" } dot-key pairs.
function flatten(obj: Json, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const dotKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value as Json, dotKey, out);
    } else if (typeof value === "string") {
      out[dotKey] = value;
    }
  }
  return out;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const defaultLocale = routing.defaultLocale;
  const otherLocales = routing.locales.filter((l) => l !== defaultLocale);

  const enFlat = flatten(readLocale(defaultLocale));
  const localeFlat: Record<string, Record<string, string>> = {};
  for (const locale of otherLocales) localeFlat[locale] = flatten(readLocale(locale));

  let created = 0;
  let updated = 0;

  for (const [key, enValue] of Object.entries(enFlat)) {
    const group = key.includes(".") ? key.slice(0, key.indexOf(".")) : "misc";
    const existing = await payload.find({
      collection: "translations" as never,
      where: { key: { equals: key } },
      limit: 1,
      locale: defaultLocale as never,
      overrideAccess: true
    });

    const doc = existing.docs[0] as { id: number | string } | undefined;
    const baseData = { key, group, value: enValue } as never;

    let id: number | string;
    if (doc) {
      await payload.update({
        collection: "translations" as never,
        id: doc.id,
        data: baseData,
        locale: defaultLocale as never,
        overrideAccess: true,
        disableTransaction: true
      });
      id = doc.id;
      updated += 1;
    } else {
      const res = await payload.create({
        collection: "translations" as never,
        data: baseData,
        locale: defaultLocale as never,
        overrideAccess: true,
        disableTransaction: true
      });
      id = (res as { id: number | string }).id;
      created += 1;
    }

    for (const locale of otherLocales) {
      const value = localeFlat[locale]?.[key];
      if (!value) continue;
      await payload.update({
        collection: "translations" as never,
        id,
        data: { value } as never,
        locale: locale as never,
        overrideAccess: true,
        disableTransaction: true
      });
    }
    console.log(`  ${doc ? "~" : "+"} ${key}`);
  }

  console.log(`\nDone. ${created} created, ${updated} updated across ${Object.keys(enFlat).length} keys.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
