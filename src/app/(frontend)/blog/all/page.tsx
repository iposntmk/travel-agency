import type { Metadata } from "next";
import { getBlogPostList } from "@/lib/cms";
import { BlogHero } from "../blog-hero";
import { BlogPostList } from "../blog-post-list";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Travel Guides",
  description: "Browse every travel guide and story for Central Vietnam.",
  alternates: { canonical: "/blog/all" }
};

interface AllGuidesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AllGuidesPage({ searchParams }: AllGuidesPageProps) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);

  const { posts, total, totalPages, page: current } = await getBlogPostList({ page: pageNum });

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
