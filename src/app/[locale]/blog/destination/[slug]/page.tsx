import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { getBlogPostList } from "@/lib/cms";
import { BlogHero } from "../../blog-hero";
import { BlogPostList } from "../../blog-post-list";

export const revalidate = 300;

interface DestinationGuidesPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: DestinationGuidesPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { destination } = await getBlogPostList({ destinationSlug: slug, page: 1, locale });
  if (!destination) return { title: "Travel Guides" };
  const path = `/blog/destination/${slug}`;
  return {
    title: `${destination.title} Travel Guides`,
    description: `Travel guides and stories for ${destination.title}, Vietnam.`,
    alternates: { canonical: localizedUrl(getSiteUrl(), locale, path), languages: buildAlternates(getSiteUrl(), path) }
  };
}

export default async function DestinationGuidesPage({ params, searchParams }: DestinationGuidesPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);

  const { posts, total, totalPages, page: current, destination } = await getBlogPostList({
    destinationSlug: slug,
    page: pageNum,
    locale
  });

  if (!destination) notFound();

  const hrefForPage = (p: number): string =>
    p > 1 ? `/blog/destination/${slug}?page=${p}` : `/blog/destination/${slug}`;

  return (
    <main>
      <BlogHero />
      <BlogPostList
        heading={`Travel guides in ${destination.title}`}
        posts={posts}
        total={total}
        page={current}
        totalPages={totalPages}
        hrefForPage={hrefForPage}
        clearHref="/blog"
      />
    </main>
  );
}
