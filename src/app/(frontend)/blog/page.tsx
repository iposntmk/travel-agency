import type { Metadata } from "next";
import { BlogCard } from "@/components/blog-card";
import { SectionHead } from "@/components/section";
import { getBlogMedia, getBlogPostList, getDestinations, getPublishedPosts, getRecentPostComments } from "@/lib/cms";
import { BlogHero } from "./blog-hero";
import { BlogPostList } from "./blog-post-list";
import { BlogFeatured } from "./blog-featured";
import { BlogDestinations } from "./blog-destinations";
import { BlogPlanTrip } from "./blog-plan-trip";
import { BlogRecentComments } from "./blog-recent-comments";
import { BlogVideo } from "./blog-video";
import { BlogGallery } from "./blog-gallery";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Travel Blog",
  description: "Stories, guides, and tips for visiting Central Vietnam.",
  alternates: { canonical: "/blog" }
};

interface BlogPageProps {
  searchParams: Promise<{ q?: string; cat?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q = "", cat = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const isSearching = Boolean(q.trim() || cat.trim());

  if (isSearching) {
    const { posts, total, totalPages, page: current } = await getBlogPostList({
      query: q,
      category: cat,
      page: pageNum
    });

    const heading = q.trim()
      ? `${total} ${total === 1 ? "article" : "articles"} for “${q.trim()}”`
      : `Guides in ${cat.replace(/-/g, " ")}`;

    const hrefForPage = (p: number): string => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (cat.trim()) sp.set("cat", cat.trim());
      if (p > 1) sp.set("page", String(p));
      const qs = sp.toString();
      return qs ? `/blog?${qs}` : "/blog";
    };

    return (
      <main>
        <BlogHero query={q} />
        <BlogPostList
          heading={heading}
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

  const [posts, destinations, comments, blogMedia] = await Promise.all([
    getPublishedPosts(24),
    getDestinations(12),
    getRecentPostComments(6),
    getBlogMedia()
  ]);

  return (
    <main>
      <BlogHero />
      <BlogFeatured posts={posts} />

      {posts.length > 0 ? (
        <section className="bg-mist py-12 md:py-16">
          <div className="mx-auto max-w-page px-4">
            <SectionHead eyebrow="Fresh off the trail" title="Latest guides" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <BlogDestinations destinations={destinations} />
      <BlogPlanTrip />
      <BlogRecentComments comments={comments} />
      <BlogVideo media={blogMedia} />
      <BlogGallery media={blogMedia} />
    </main>
  );
}
