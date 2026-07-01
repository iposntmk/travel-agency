import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { getBlogPostList } from "@/lib/cms";
import { BlogHero } from "../blog-hero";
import { BlogPostList } from "../blog-post-list";

export const revalidate = 300;

export async function generateMetadata({ params }: AllGuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "All Travel Guides",
    description: "Browse every travel guide and story for Central Vietnam.",
    alternates: { canonical: localizedUrl(getSiteUrl(), locale, "/blog/all"), languages: buildAlternates(getSiteUrl(), "/blog/all") }
  };
}

interface AllGuidesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AllGuidesPage({ params, searchParams }: AllGuidesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);

  const { posts, total, totalPages, page: current } = await getBlogPostList({ page: pageNum, locale });

  const hrefForPage = (p: number): string => (p > 1 ? `/blog/all?page=${p}` : "/blog/all");

  return (
    <main>
      <BlogHero />
      <BlogPostList
        heading="All travel guides"
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
