/**
 * Seed sample per-locale CONTENT translations for storefront cards
 * (tour / cruise / blog-post display fields) into the localized collections.
 *
 * Complements seed-localizations.ts: that script copies English into every empty
 * locale as a placeholder; this one overwrites a curated sample of docs with real
 * translations so the localized storefront visibly switches languages. Anything
 * not listed here keeps whatever seed-localizations left (English fallback).
 *
 * Source of truth: scripts/seed-data/translations.ts. Idempotent — re-running
 * just rewrites the same values. Matches docs by `slug`.
 *
 * Run: node --env-file=.env --import=tsx/esm scripts/seed-content-translations.ts
 */
import { getPayload } from "payload";
import config from "../payload.config";
import {
  cruiseTranslations,
  postTitleTranslations,
  tourTitleTranslations,
  type LocaleText,
} from "./seed-data/translations";

type Payload = Awaited<ReturnType<typeof getPayload>>;

// Regroup { field: { locale: value } } into { locale: { field: value } } so each
// locale row is written in a single update.
function byLocale(fieldMaps: Record<string, LocaleText>): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>();
  for (const [field, localeText] of Object.entries(fieldMaps)) {
    for (const [locale, value] of Object.entries(localeText)) {
      const bucket = out.get(locale) ?? {};
      bucket[field] = value;
      out.set(locale, bucket);
    }
  }
  return out;
}

async function findIdBySlug(payload: Payload, collection: string, slug: string): Promise<number | string | null> {
  const result = await payload.find({
    collection: collection as never,
    where: { slug: { equals: slug } } as never,
    locale: "en",
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return (result.docs[0] as { id: number | string } | undefined)?.id ?? null;
}

async function applyCollection(
  payload: Payload,
  collection: string,
  entries: Record<string, Record<string, LocaleText>>
): Promise<{ updated: number; missing: number }> {
  let updated = 0;
  let missing = 0;
  for (const [slug, fieldMaps] of Object.entries(entries)) {
    const id = await findIdBySlug(payload, collection, slug);
    if (id === null) {
      console.warn(`  ! ${collection}:${slug} not found — run \`pnpm seed\` first`);
      missing++;
      continue;
    }
    const locales = byLocale(fieldMaps);
    for (const [locale, data] of locales) {
      await payload.update({
        collection: collection as never,
        id,
        locale: locale as never,
        data: data as never,
        overrideAccess: true,
        disableTransaction: true,
      });
    }
    console.log(`  ~ ${collection}:${slug} (${locales.size} locales)`);
    updated++;
  }
  return { updated, missing };
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const tourEntries = Object.fromEntries(
    Object.entries(tourTitleTranslations).map(([slug, title]) => [slug, { title }])
  );
  const postEntries = Object.fromEntries(
    Object.entries(postTitleTranslations).map(([slug, title]) => [slug, { title }])
  );

  const tours = await applyCollection(payload, "tours", tourEntries);
  const cruises = await applyCollection(payload, "cruises", cruiseTranslations);
  const posts = await applyCollection(payload, "posts", postEntries);

  const updated = tours.updated + cruises.updated + posts.updated;
  const missing = tours.missing + cruises.missing + posts.missing;
  console.log(`\nContent translations seeded. Updated ${updated} docs, ${missing} missing.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
