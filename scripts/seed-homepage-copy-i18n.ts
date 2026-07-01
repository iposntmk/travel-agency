/**
 * Seed per-locale translations for SiteSettings.homepage CMS copy.
 *
 * The English base is written by scripts/seed.ts (upsertSiteSettings). Because
 * Payload localization uses `fallback: true`, non-default locales show English
 * until a value is written for that locale — this script writes them.
 *
 * Data source: scripts/seed-data/homepage-copy-i18n.ts. Idempotent — re-running
 * rewrites the same values. Array rows (hero trust items, why-us items) keep the
 * English row `id`s so each locale sets its own localized leaf values on the
 * SHARED base rows (dropping the id would recreate rows and wipe other locales).
 *
 * GOTCHA: the storefront caches homepage data in unstable_cache. After running,
 * clear .next/cache + restart dev, or let ISR revalidate (300s), or edit the doc
 * once in the admin to bust the `site-settings` tag.
 *
 * Run: node --env-file=.env --import=tsx/esm scripts/seed-homepage-copy-i18n.ts
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { routing } from "../src/i18n/routing";
import {
  heroTrustItemsI18n,
  homepageCopyI18n,
  whyUsItemsI18n,
  type LT,
  type NonDefaultLocale,
} from "./seed-data/homepage-copy-i18n";

type Row = { id?: string | number } & Record<string, unknown>;

const pick = (text: LT | undefined, locale: NonDefaultLocale): string | undefined => text?.[locale];

// Build the { field: value } patch for a scalar section, dropping untranslated keys.
function scalarSection(section: string, locale: NonDefaultLocale): Record<string, string> {
  const out: Record<string, string> = {};
  const fields = homepageCopyI18n[section] ?? {};
  for (const [field, text] of Object.entries(fields)) {
    const value = pick(text, locale);
    if (value !== undefined) out[field] = value;
  }
  return out;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const found = await payload.find({ collection: "site-settings", limit: 1, depth: 0, overrideAccess: true });
  const doc = found.docs[0] as unknown as (Row & { homepage?: Record<string, Row & { trustItems?: Row[]; items?: Row[] }> }) | undefined;
  if (!doc) throw new Error("No site-settings doc found. Run `pnpm seed` first.");

  const enHomepage = doc.homepage ?? {};
  const enTrustItems = enHomepage.hero?.trustItems ?? [];
  const enWhyItems = enHomepage.whyUs?.items ?? [];
  const targetLocales = routing.locales.filter((l) => l !== routing.defaultLocale) as NonDefaultLocale[];

  for (const locale of targetLocales) {
    const homepage: Record<string, unknown> = {
      search: scalarSection("search", locale),
      whoWeAre: scalarSection("whoWeAre", locale),
      featuredTours: scalarSection("featuredTours", locale),
      cruises: scalarSection("cruises", locale),
      destinations: scalarSection("destinations", locale),
      freeTours: scalarSection("freeTours", locale),
      featuredExperiences: scalarSection("featuredExperiences", locale),
      testimonials: scalarSection("testimonials", locale),
      team: scalarSection("team", locale),
      blog: scalarSection("blog", locale),
      newsletter: scalarSection("newsletter", locale),
      // hero: only translate trust-item leaves (title/subtitle/body stay blank so
      // the next-intl defaults render). Preserve base-row ids.
      hero: {
        trustItems: enTrustItems.map((row, i) => ({
          id: row.id,
          label: pick(heroTrustItemsI18n[i]?.label, locale) ?? (row.label as string),
          hint: pick(heroTrustItemsI18n[i]?.hint, locale) ?? (row.hint as string | undefined),
        })),
      },
      whyUs: {
        ...scalarSection("whyUs", locale),
        items: enWhyItems.map((row, i) => ({
          id: row.id,
          title: pick(whyUsItemsI18n[i]?.title, locale) ?? (row.title as string),
          body: pick(whyUsItemsI18n[i]?.body, locale) ?? (row.body as string),
        })),
      },
    };

    await payload.update({
      collection: "site-settings",
      id: doc.id as string | number,
      locale: locale as never,
      data: { homepage } as never,
      overrideAccess: true,
      disableTransaction: true,
    });
    console.log(`  ~ site-settings.homepage [${locale}]`);
  }

  console.log(`\nHomepage copy translated for ${targetLocales.length} locales.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
