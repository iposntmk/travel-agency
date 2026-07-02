import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Where } from "payload";
import type { Comment, Config, Destination, Post, Review, SiteSetting, TeamMember, Tour } from "@/payload-types";
import type { CurrencyOption, SymbolPosition } from "@/lib/currency";

const DEFAULT_LIMIT = 24;
const DEFAULT_LOCALE = "en";

// All getters accept an optional `locale` (loose `string` from route params /
// next-intl) and thread it into both the Payload query and the unstable_cache
// key + tags, so each locale is cached and revalidated independently. Omitting
// it falls back to the default locale.
type Locale = string;

// Narrow a loose locale string to Payload's generated locale union at the
// `find()` boundary (the middleware guarantees only valid locales reach here).
const asLocale = (locale?: string): Config["locale"] | undefined =>
  locale as Config["locale"] | undefined;

function localeKey(locale?: string): Locale {
  return locale ?? DEFAULT_LOCALE;
}

async function fetchTourBySlug(slug: string, locale?: Locale): Promise<Tour | null> {
  const payload = await getPayloadClient();
  // Slug is localized but only the default locale is guaranteed populated, and
  // Payload's `where` does NOT apply locale fallback — so match the slug in the
  // default locale to find the doc, then load its content in the target locale.
  const idResult = await payload.find({
    collection: "tours",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;
  return (await payload.findByID({ collection: "tours", id, depth: 1, locale: asLocale(locale) })) as Tour;
}

const getTourBySlugCached = cache((slug: string, locale: Locale) =>
  unstable_cache(() => fetchTourBySlug(slug, locale), ["cms", "tour", slug, locale], {
    tags: ["tours", `tour-${slug}`, `${locale}-tour-${slug}`]
  })()
);

export function getTourBySlug(slug: string, locale?: Locale): Promise<Tour | null> {
  return getTourBySlugCached(slug, localeKey(locale));
}

const DESTINATION_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  description: true,
  updatedAt: true
} as const;

async function fetchDestinations(limit: number, locale?: Locale): Promise<Destination[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    limit,
    depth: 1,
    sort: "title",
    select: DESTINATION_LIST_SELECT,
    locale: asLocale(locale)
  });
  return result.docs as Destination[];
}

const getDestinationsCached = cache((limit: number, locale: Locale) =>
  unstable_cache(() => fetchDestinations(limit, locale), ["cms", "destinations", String(limit), locale], {
    tags: ["destinations"]
  })()
);

export function getDestinations(limit = DEFAULT_LIMIT, locale?: Locale): Promise<Destination[]> {
  return getDestinationsCached(limit, localeKey(locale));
}

async function fetchDestinationBySlug(slug: string, locale?: Locale): Promise<Destination | null> {
  const payload = await getPayloadClient();
  // Match slug in the default locale (see fetchTourBySlug note), load in target.
  const idResult = await payload.find({
    collection: "destinations",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;
  return (await payload.findByID({ collection: "destinations", id, depth: 1, locale: asLocale(locale) })) as Destination;
}

const getDestinationBySlugCached = cache((slug: string, locale: Locale) =>
  unstable_cache(() => fetchDestinationBySlug(slug, locale), ["cms", "destination", slug, locale], {
    tags: ["destinations", `destination-${slug}`, `${locale}-destination-${slug}`]
  })()
);

export function getDestinationBySlug(slug: string, locale?: Locale): Promise<Destination | null> {
  return getDestinationBySlugCached(slug, localeKey(locale));
}

const POST_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  destination: true,
  guideCategory: true,
  readingTime: true,
  status: true,
  createdAt: true,
  updatedAt: true
} as const;

async function fetchPublishedPosts(limit: number, locale?: Locale): Promise<Post[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 1,
    sort: "-createdAt",
    select: POST_LIST_SELECT,
    locale: asLocale(locale)
  });
  return result.docs as Post[];
}

const getPublishedPostsCached = cache((limit: number, locale: Locale) =>
  unstable_cache(() => fetchPublishedPosts(limit, locale), ["cms", "posts", String(limit), locale], {
    tags: ["posts"]
  })()
);

export function getPublishedPosts(limit = DEFAULT_LIMIT, locale?: Locale): Promise<Post[]> {
  return getPublishedPostsCached(limit, localeKey(locale));
}

async function fetchSearchedPosts(query: string, category: string, limit: number, locale?: Locale): Promise<Post[]> {
  const payload = await getPayloadClient();
  const conditions: Where[] = [{ status: { equals: "published" } }];

  const q = query.trim();
  if (q) {
    conditions.push({
      or: [{ title: { like: q } }, { "tags.tag": { like: q } }]
    });
  }

  const cat = category.trim();
  if (cat) {
    conditions.push({ guideCategory: { equals: cat } });
  }

  const result = await payload.find({
    collection: "posts",
    where: { and: conditions },
    limit,
    depth: 1,
    sort: "-createdAt",
    select: POST_LIST_SELECT,
    locale: asLocale(locale)
  });
  return result.docs as Post[];
}

const getSearchedPostsCached = cache((query: string, category: string, limit: number, locale: Locale) =>
  unstable_cache(
    () => fetchSearchedPosts(query, category, limit, locale),
    ["cms", "posts", "search", query, category, String(limit), locale],
    { tags: ["posts"] }
  )()
);

export function searchPublishedPosts(
  query: string,
  category: string,
  limit = DEFAULT_LIMIT,
  locale?: Locale
): Promise<Post[]> {
  return getSearchedPostsCached(query, category, limit, localeKey(locale));
}

const POSTS_PER_PAGE = 9;

export interface BlogPostListResult {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  destination: Destination | null;
}

async function fetchBlogPostList(
  query: string,
  category: string,
  destinationSlug: string,
  page: number,
  limit: number,
  locale?: Locale
): Promise<BlogPostListResult> {
  const empty: BlogPostListResult = { posts: [], total: 0, page: 1, totalPages: 0, destination: null };

  let destination: Destination | null = null;
  if (destinationSlug) {
    destination = await getDestinationBySlug(destinationSlug, locale);
    if (!destination) return empty;
  }

  const payload = await getPayloadClient();
  const conditions: Where[] = [{ status: { equals: "published" } }];

  const q = query.trim();
  if (q) {
    conditions.push({ or: [{ title: { like: q } }, { "tags.tag": { like: q } }] });
  }

  const cat = category.trim();
  if (cat) {
    conditions.push({ guideCategory: { equals: cat } });
  }

  if (destination) {
    conditions.push({ destination: { equals: destination.id } });
  }

  const result = await payload.find({
    collection: "posts",
    where: { and: conditions },
    limit,
    page,
    depth: 1,
    sort: "-createdAt",
    select: POST_LIST_SELECT,
    locale: asLocale(locale)
  });

  return {
    posts: result.docs as Post[],
    total: result.totalDocs,
    page: result.page ?? page,
    totalPages: result.totalPages ?? 1,
    destination
  };
}

const getBlogPostListCached = cache(
  (query: string, category: string, destinationSlug: string, page: number, limit: number, locale: Locale) =>
    unstable_cache(
      () => fetchBlogPostList(query, category, destinationSlug, page, limit, locale),
      ["cms", "posts", "list", query, category, destinationSlug, String(page), String(limit), locale],
      { tags: ["posts"] }
    )()
);

export function getBlogPostList(
  args: {
    query?: string;
    category?: string;
    destinationSlug?: string;
    page?: number;
    limit?: number;
    locale?: Locale;
  } = {}
): Promise<BlogPostListResult> {
  return getBlogPostListCached(
    args.query ?? "",
    args.category ?? "",
    args.destinationSlug ?? "",
    Math.max(1, args.page ?? 1),
    args.limit ?? POSTS_PER_PAGE,
    localeKey(args.locale)
  );
}

async function fetchPostBySlug(slug: string, locale?: Locale): Promise<Post | null> {
  const payload = await getPayloadClient();
  // Match slug in the default locale (see fetchTourBySlug note), load in target.
  const idResult = await payload.find({
    collection: "posts",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;
  return (await payload.findByID({ collection: "posts", id, depth: 1, locale: asLocale(locale) })) as Post;
}

const getPostBySlugCached = cache((slug: string, locale: Locale) =>
  unstable_cache(() => fetchPostBySlug(slug, locale), ["cms", "post", slug, locale], {
    tags: ["posts", `post-${slug}`, `${locale}-post-${slug}`]
  })()
);

export function getPostBySlug(slug: string, locale?: Locale): Promise<Post | null> {
  return getPostBySlugCached(slug, localeKey(locale));
}

async function fetchSiteSettings(locale?: Locale): Promise<SiteSetting | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({ collection: "site-settings", limit: 1, depth: 0, locale: asLocale(locale) });
  return (result.docs[0] as SiteSetting | undefined) ?? null;
}

const getSiteSettingsCached = cache((locale: Locale) =>
  unstable_cache(() => fetchSiteSettings(locale), ["cms", "site-settings", locale], {
    tags: ["site-settings"]
  })()
);

export function getSiteSettings(locale?: Locale): Promise<SiteSetting | null> {
  return getSiteSettingsCached(localeKey(locale));
}

async function fetchBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({ collection: "site-settings", limit: 1, depth: 1 });
    const doc = result.docs[0] as SiteSetting | undefined;
    return doc?.blogMedia ?? null;
  } catch (error) {
    // Schema may lag the running DB (migration not yet applied). Degrade
    // gracefully so the blog page renders without the video/gallery sections.
    console.error("getBlogMedia failed; hiding blog media sections", error);
    return null;
  }
}

const getBlogMediaCached = cache(() =>
  unstable_cache(() => fetchBlogMedia(), ["cms", "blog-media"], {
    tags: ["site-settings"]
  })()
);

export function getBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null> {
  return getBlogMediaCached();
}

async function fetchFeaturedReviews(limit: number): Promise<Review[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "reviews",
    where: { status: { equals: "approved" } },
    limit,
    depth: 1,
    sort: "-createdAt"
  });
  return result.docs as Review[];
}

const getFeaturedReviewsCached = cache((limit: number) =>
  unstable_cache(() => fetchFeaturedReviews(limit), ["cms", "featured-reviews", String(limit)], {
    tags: ["reviews"]
  })()
);

export function getFeaturedReviews(limit = 3): Promise<Review[]> {
  return getFeaturedReviewsCached(limit);
}

async function fetchReviewsForTour(tourId: number | string, limit: number): Promise<Review[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "reviews",
    where: { and: [{ tour: { equals: tourId } }, { status: { equals: "approved" } }] },
    limit,
    depth: 1,
    sort: "rating"
  });
  return result.docs as Review[];
}

const getReviewsForTourCached = cache((tourId: number | string, limit: number) =>
  unstable_cache(() => fetchReviewsForTour(tourId, limit), ["cms", "tour-reviews", String(tourId), String(limit)], {
    tags: ["reviews"]
  })()
);

export function getReviewsForTour(tourId: number | string, limit = 5): Promise<Review[]> {
  return getReviewsForTourCached(tourId, limit);
}

async function fetchApprovedCommentsForTarget(
  relationTo: "posts" | "tours",
  targetId: number | string,
  limit: number
): Promise<Comment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "comments",
    where: {
      and: [
        { "target.relationTo": { equals: relationTo } },
        { "target.value": { equals: targetId } },
        { status: { equals: "approved" } }
      ]
    },
    limit,
    depth: 1,
    sort: "createdAt"
  });
  return result.docs as Comment[];
}

const getApprovedCommentsForTargetCached = cache((relationTo: "posts" | "tours", targetId: number | string, limit: number) =>
  unstable_cache(
    () => fetchApprovedCommentsForTarget(relationTo, targetId, limit),
    ["cms", "comments", relationTo, String(targetId), String(limit)],
    { tags: ["comments"] }
  )()
);

export function getApprovedCommentsForTarget(
  relationTo: "posts" | "tours",
  targetId: number | string,
  limit = 10
): Promise<Comment[]> {
  return getApprovedCommentsForTargetCached(relationTo, targetId, limit);
}

async function fetchRecentPostComments(limit: number): Promise<Comment[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "comments",
    where: {
      and: [
        { "target.relationTo": { equals: "posts" } },
        { status: { equals: "approved" } }
      ]
    },
    limit,
    depth: 1,
    sort: "-createdAt"
  });
  return result.docs as Comment[];
}

const getRecentPostCommentsCached = cache((limit: number) =>
  unstable_cache(() => fetchRecentPostComments(limit), ["cms", "recent-post-comments", String(limit)], {
    tags: ["comments"]
  })()
);

export function getRecentPostComments(limit = 6): Promise<Comment[]> {
  return getRecentPostCommentsCached(limit);
}

async function fetchTeamMembers(limit: number): Promise<TeamMember[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "team-members",
    where: { status: { equals: "published" } },
    limit,
    depth: 1,
    sort: "sortWeight"
  });
  return result.docs as TeamMember[];
}

const getTeamMembersCached = cache((limit: number) =>
  unstable_cache(() => fetchTeamMembers(limit), ["cms", "team-members", String(limit)], {
    tags: ["team-members"]
  })()
);

export function getTeamMembers(limit = 8): Promise<TeamMember[]> {
  return getTeamMembersCached(limit);
}

// Normalize raw currency docs into the lean client-facing shape. Kept tolerant
// of schema lag (the generated `Currency` type may not exist until types are
// regenerated) — same defensive pattern as cms-navigation.
function normalizeCurrency(value: unknown): CurrencyOption | null {
  const record = asRecord(value);
  const code = stringValue(record.code);
  const symbol = stringValue(record.symbol);
  if (!code || !symbol) return null;

  const position: SymbolPosition = record.symbolPosition === "after" ? "after" : "before";
  return {
    code,
    name: stringValue(record.name) ?? code,
    symbol,
    rateToBase: numberValue(record.rateToBase) ?? 1,
    decimals: numberValue(record.decimals) ?? 2,
    symbolPosition: position,
    isDefault: record.isDefault === true
  };
}

async function fetchCurrencies(): Promise<CurrencyOption[]> {
  try {
    const payload = (await getPayloadClient()) as unknown as PublicFindPayload;
    const result = await payload.find({
      collection: "currencies",
      where: { active: { equals: true } },
      limit: 50,
      depth: 0,
      sort: "sort"
    });
    return result.docs.map(normalizeCurrency).filter((c): c is CurrencyOption => c !== null);
  } catch (error) {
    // Table may not exist yet (migration not applied). Degrade to no
    // conversion rather than crashing every page.
    if (isMissingCurrenciesTableError(error)) return [];
    throw error;
  }
}

const getCurrenciesCached = cache(() =>
  unstable_cache(() => fetchCurrencies(), ["cms", "currencies"], {
    tags: ["currencies"]
  })()
);

export function getCurrencies(): Promise<CurrencyOption[]> {
  return getCurrenciesCached();
}

function isMissingCurrenciesTableError(error: unknown): boolean {
  const record = asRecord(error);
  const cause = asRecord(record.cause);
  if (cause.code === "42P01") return true;
  return typeof record.message === "string" && record.message.includes('relation "currencies" does not exist');
}

export type PublicCarRental = {
  id: number | string;
  title: string;
  slug: string;
  routeFrom?: string;
  routeTo?: string;
  vehicleType?: string;
  durationText?: string;
  priceFrom?: number;
  currency?: string;
  featuredImage?: unknown;
  destination?: unknown;
};

export type PublicAttraction = {
  id: number | string;
  title: string;
  slug: string;
  summary?: string;
  featuredImage?: unknown;
};

export type DestinationHub = {
  destination: Destination;
  tours: Tour[];
  carRentals: PublicCarRental[];
  guides: Post[];
  attractions: PublicAttraction[];
};

type PublicFindPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
};

export async function getDestinationHub(slug: string, locale?: Locale): Promise<DestinationHub | null> {
  const destination = await getDestinationBySlug(slug, locale);
  if (!destination) return null;
  const payload = (await getPayloadClient()) as unknown as PublicFindPayload;

  const [tours, carRentals, guides, attractions] = await Promise.all([
    payload.find({
      collection: "tours",
      where: { and: [{ destination: { equals: destination.id } }, { status: { equals: "active" } }] },
      limit: 6,
      depth: 1,
      sort: "-isFeatured",
      locale
    }),
    payload.find({
      collection: "car-rentals",
      where: { and: [{ destination: { equals: destination.id } }, { status: { equals: "active" } }] },
      limit: 6,
      depth: 1,
      sort: "priceFrom",
      locale
    }),
    payload.find({
      collection: "posts",
      where: { and: [{ destination: { equals: destination.id } }, { status: { equals: "published" } }] },
      limit: 6,
      depth: 1,
      sort: "-sortWeight",
      locale
    }),
    payload.find({
      collection: "attractions",
      where: { destination: { equals: destination.id } },
      limit: 8,
      depth: 1,
      sort: "-sortWeight",
      locale
    })
  ]);

  return {
    destination,
    tours: tours.docs as Tour[],
    carRentals: carRentals.docs.map(toCarRental),
    guides: guides.docs as Post[],
    attractions: attractions.docs.map(toAttraction)
  };
}

interface CarRentalsListQuery {
  destinationSlug?: string;
  vehicleType?: string;
  route?: string;
  priceMax?: number;
  limit?: number;
  locale?: Locale;
}

async function fetchCarRentalsForList(query: CarRentalsListQuery): Promise<PublicCarRental[]> {
  const payload = (await getPayloadClient()) as unknown as PublicFindPayload;
  const and: Record<string, unknown>[] = [{ status: { equals: "active" } }];

  if (query.destinationSlug) {
    const destination = await getDestinationBySlug(query.destinationSlug, query.locale);
    if (!destination) return [];
    and.push({ destination: { equals: destination.id } });
  }
  if (query.vehicleType) and.push({ vehicleType: { equals: query.vehicleType } });
  if (query.route) and.push({ or: [{ routeFrom: { like: query.route } }, { routeTo: { like: query.route } }] });
  if (query.priceMax) and.push({ priceFrom: { less_than_equal: query.priceMax } });

  const result = await payload.find({
    collection: "car-rentals",
    where: { and },
    limit: query.limit ?? DEFAULT_LIMIT,
    depth: 1,
    sort: "priceFrom",
    locale: asLocale(query.locale)
  });

  return result.docs.map(toCarRental);
}

// Keyed on the full query JSON (same pattern as getToursForList). Tagged with
// "destinations" too because destinationSlug resolves through that collection.
const getCarRentalsForListCached = cache((cacheKey: string) =>
  unstable_cache(
    () => fetchCarRentalsForList(JSON.parse(cacheKey) as CarRentalsListQuery),
    ["cms", "car-rentals-list", cacheKey],
    { tags: ["car-rentals", "destinations"] }
  )()
);

export function getCarRentalsForList(query: CarRentalsListQuery = {}): Promise<PublicCarRental[]> {
  return getCarRentalsForListCached(
    JSON.stringify({
      destinationSlug: query.destinationSlug,
      vehicleType: query.vehicleType,
      route: query.route,
      priceMax: query.priceMax,
      limit: query.limit,
      locale: localeKey(query.locale)
    })
  );
}

export async function getTravelGuidesForDestination(
  destinationSlug: string,
  category?: string,
  locale?: Locale
): Promise<Post[]> {
  const destination = await getDestinationBySlug(destinationSlug, locale);
  if (!destination) return [];
  const payload = (await getPayloadClient()) as unknown as PublicFindPayload;
  const and: Record<string, unknown>[] = [
    { destination: { equals: destination.id } },
    { status: { equals: "published" } }
  ];
  if (category) and.push({ guideCategory: { equals: category } });

  const result = await payload.find({
    collection: "posts",
    where: { and },
    limit: DEFAULT_LIMIT,
    depth: 1,
    sort: "-sortWeight",
    locale: asLocale(locale)
  });

  return result.docs as Post[];
}

export async function getHomePageContent(locale?: Locale) {
  const [heroDestinations, featuredTours, guides] = await Promise.all([
    getDestinations(6, locale),
    import("@/lib/cms-list").then(({ getToursForList }) => getToursForList({ featuredOnly: true, limit: 6, locale })),
    getPublishedPosts(3, locale)
  ]);

  return {
    heroDestinations,
    featuredTours,
    guidePreview: guides,
    reviewSummary: { ratingAverage: 4.9, ratingCount: 120 },
    teamPreview: []
  };
}

function toCarRental(value: unknown): PublicCarRental {
  const record = asRecord(value);
  return {
    id: idValue(record.id),
    title: stringValue(record.title) ?? "Private car rental",
    slug: stringValue(record.slug) ?? "",
    routeFrom: stringValue(record.routeFrom),
    routeTo: stringValue(record.routeTo),
    vehicleType: stringValue(record.vehicleType),
    durationText: stringValue(record.durationText),
    priceFrom: numberValue(record.priceFrom),
    currency: stringValue(record.currency),
    featuredImage: record.featuredImage,
    destination: record.destination
  };
}

function toAttraction(value: unknown): PublicAttraction {
  const record = asRecord(value);
  return {
    id: idValue(record.id),
    title: stringValue(record.title) ?? "Attraction",
    slug: stringValue(record.slug) ?? "",
    summary: stringValue(record.summary),
    featuredImage: record.featuredImage
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function idValue(value: unknown): string | number {
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
