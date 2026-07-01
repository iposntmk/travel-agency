import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import {
  getDestinationSitemapEntries,
  getPostSitemapEntries,
  getTourSitemapEntries
} from "@/lib/cms-sitemap";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";

const STATIC_ROUTES = [
  "/",
  "/tours",
  "/free-tours",
  "/destinations",
  "/car-rentals",
  "/blog",
  "/about-us",
  "/contact",
  "/customize-tour"
] as const;
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  // Slugs are localized but currently only filled for the default locale (other
  // locales fall back), so a single default-locale fetch yields the slug used
  // across every locale URL.
  const [tours, destinations, posts] = await Promise.all([
    getTourSitemapEntries(200),
    getDestinationSitemapEntries(100),
    getPostSitemapEntries(200)
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Emit one entry per locale, each carrying the full hreflang alternates map
  // (+ x-default) so every localized URL is discoverable and cross-linked.
  const pushLocalized = (
    path: string,
    opts: { lastModified?: Date; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }
  ) => {
    const languages = buildAlternates(base, path);
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(base, locale, path),
        alternates: { languages },
        ...opts
      });
    }
  };

  for (const path of STATIC_ROUTES) {
    pushLocalized(path, { changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 });
  }
  for (const tour of tours) {
    pushLocalized(`/tours/${tour.slug}`, {
      lastModified: tour.updatedAt ? new Date(tour.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8
    });
  }
  for (const destination of destinations) {
    pushLocalized(`/destinations/${destination.slug}`, {
      lastModified: destination.updatedAt ? new Date(destination.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6
    });
  }
  for (const post of posts) {
    pushLocalized(`/blog/${post.slug}`, {
      lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.5
    });
  }

  return entries;
}
