/**
 * Seed non-default locales by copying the English values into each target
 * locale, giving the content team a starting point to translate from.
 *
 * Safe + idempotent: a locale field is only seeded when it is currently empty
 * (read with fallbackLocale:false → null), so existing translations are never
 * overwritten. Run: node --env-file=.env --import=tsx/esm scripts/seed-localizations.ts
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { routing } from "../src/i18n/routing";

// Per-collection localized fields to copy from `en` into other locales.
const LOCALIZED_FIELDS: Record<string, string[]> = {
  tours: [
    "title", "slug", "description", "durationText", "routeSummary", "startEnd",
    "travelStyle", "guideLanguages", "highlightIntro", "highlights", "inclusions",
    "exclusions", "itinerary", "faqs", "seo"
  ],
  posts: ["title", "slug", "content", "tags", "seo"],
  destinations: ["title", "slug", "description", "summary", "bestTimeToVisit", "hubIntro", "seo"],
  attractions: ["title", "slug", "summary", "seo"],
  "car-rentals": ["title", "slug", "routeFrom", "routeTo", "durationText", "seo"],
  cruises: ["title", "slug", "description", "durationText", "routeSummary", "cabinTypes", "itinerary", "seo"],
  "product-categories": ["title", "slug"]
};

const isEmpty = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

// Localized array/group rows carry the default-locale row `id`s; Payload rejects
// those when writing another locale (each locale owns its own rows). Strip every
// `id` key at any depth so the values are inserted as fresh target-locale rows.
function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "id") continue;
      out[k] = stripIds(v);
    }
    return out;
  }
  return value;
}

async function main() {
  const payload = await getPayload({ config });
  const targetLocales = routing.locales.filter((l) => l !== routing.defaultLocale);
  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [collection, fields] of Object.entries(LOCALIZED_FIELDS)) {
    const all = await payload.find({ collection: collection as never, locale: "en", limit: 1000, depth: 0 });
    for (const doc of all.docs as Array<Record<string, unknown> & { id: number | string }>) {
      const enData: Record<string, unknown> = {};
      for (const field of fields) {
        if (doc[field] !== undefined) enData[field] = stripIds(doc[field]);
      }

      for (const locale of targetLocales) {
        // Read the existing localized doc without fallback to detect blanks.
        const existing = (await payload.findByID({
          collection: collection as never,
          id: doc.id,
          locale: locale as never,
          fallbackLocale: false,
          depth: 0
        })) as Record<string, unknown>;

        if (!isEmpty(existing.title)) {
          skipped++;
          continue;
        }

        try {
          await payload.update({
            collection: collection as never,
            id: doc.id,
            locale: locale as never,
            data: enData as never
          });
          seeded++;
        } catch (err) {
          const e = err as { data?: { errors?: Array<{ message?: string; path?: string }> } };
          const detail = e.data?.errors?.map((x) => x.path ?? x.message).join(", ") ?? String(err);
          console.warn(`  ! ${collection}#${doc.id} [${locale}] failed: ${detail}`);
          failed++;
        }
      }
    }
    console.log(`[${collection}] processed ${all.docs.length} docs`);
  }

  console.log(`\nDone. Seeded ${seeded}, skipped ${skipped} already-translated, failed ${failed}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
