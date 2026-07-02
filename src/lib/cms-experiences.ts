import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Config, Experience } from "@/payload-types";

const asLocale = (locale?: string): Config["locale"] | undefined => locale as Config["locale"] | undefined;

const DEFAULT_LOCALE = "en";

const EXPERIENCE_LIST_SELECT = {
  title: true,
  slug: true,
  destination: true,
  experienceType: true,
  summary: true,
  featuredImage: true,
  venue: true,
  sessionDuration: true,
  priceFrom: true,
  currency: true,
  deal: true,
  isFeatured: true,
  isBestSeller: true,
  status: true,
  createdAt: true,
  updatedAt: true
} as const;

async function fetchExperiencesForList(limit: number, locale?: string): Promise<Experience[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "experiences",
    where: { status: { equals: "active" } },
    limit,
    depth: 1,
    sort: "-isFeatured",
    select: EXPERIENCE_LIST_SELECT,
    locale: asLocale(locale)
  });
  return result.docs as Experience[];
}

const getExperiencesForListCached = cache((limit: number, locale: string) =>
  unstable_cache(() => fetchExperiencesForList(limit, locale), ["cms", "experiences-list", String(limit), locale], {
    tags: ["experiences"]
  })()
);

export function getExperiencesForList(limit = 24, locale?: string): Promise<Experience[]> {
  return getExperiencesForListCached(limit, locale ?? DEFAULT_LOCALE);
}

/** Two-step slug getter — same localized-slug pattern as getTourBySlug. */
async function fetchExperienceBySlug(slug: string, locale?: string): Promise<Experience | null> {
  const payload = await getPayloadClient();
  const idResult = await payload.find({
    collection: "experiences",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;
  return (await payload.findByID({
    collection: "experiences",
    id,
    depth: 1,
    locale: asLocale(locale)
  })) as Experience;
}

const getExperienceBySlugCached = cache((slug: string, locale: string) =>
  unstable_cache(() => fetchExperienceBySlug(slug, locale), ["cms", "experience", slug, locale], {
    tags: ["experiences", `experience-${slug}`]
  })()
);

export function getExperienceBySlug(slug: string, locale?: string): Promise<Experience | null> {
  return getExperienceBySlugCached(slug, locale ?? DEFAULT_LOCALE);
}
