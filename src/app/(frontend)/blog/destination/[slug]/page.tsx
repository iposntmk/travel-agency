import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostList } from "@/lib/cms";
import { BlogHero } from "../../blog-hero";
import { BlogPostList } from "../../blog-post-list";

export const revalidate = 300;

interface DestinationGuidesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: DestinationGuidesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { destination } = await getBlogPostList({ destinationSlug: slug, page: 1 });
  if (!destination) return { title: "Travel Guides" };
  return {
    title: `${destination.title} Travel Guides`,
    description: `Travel guides and stories for ${destination.title}, Vietnam.`,
    alternates: { canonical: `/blog/destination/${slug}` }
  };
}

export default async function DestinationGuidesPage({ params, searchParams }: DestinationGuidesPageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);

  const { posts, total, totalPages, page: current, destination } = await getBlogPostList({
    destinationSlug: slug,
    page: pageNum
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
