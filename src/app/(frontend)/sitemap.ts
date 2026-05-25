import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import {
  getDestinations,
  getPublishedPosts,
  getTours
} from "@/lib/cms";

const STATIC_ROUTES = ["/", "/tours", "/free-tours", "/destinations", "/blog"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  const [tours, destinations, posts] = await Promise.all([
    getTours({ limit: 200 }),
    getDestinations(100),
    getPublishedPosts(200)
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
