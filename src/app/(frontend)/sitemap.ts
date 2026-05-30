import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import {
  getDestinationSitemapEntries,
  getPostSitemapEntries,
  getTourSitemapEntries
} from "@/lib/cms-sitemap";

const STATIC_ROUTES = [
  "/",
  "/tours",
  "/free-tours",
  "/destinations",
  "/car-rentals",
  "/blog",
  "/about-us",
  "/contact",
  "/free-proposal"
] as const;
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  const [tours, destinations, posts] = await Promise.all([
    getTourSitemapEntries(200),
    getDestinationSitemapEntries(100),
    getPostSitemapEntries(200)
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7
  }));

  for (const tour of tours) {
    entries.push({
      url: `${base}/tours/${tour.slug}`,
      lastModified: tour.updatedAt ? new Date(tour.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8
    });
  }
  for (const destination of destinations) {
    entries.push({
      url: `${base}/destinations/${destination.slug}`,
      lastModified: destination.updatedAt ? new Date(destination.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6
    });
  }
  for (const post of posts) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.5
    });
  }

  return entries;
}
