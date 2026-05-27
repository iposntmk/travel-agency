import type { Metadata } from "next";
import { BlogCard } from "@/components/blog-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { EmptyState, PageHero } from "@/components/section";
import { getPublishedPosts } from "@/lib/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Travel Blog",
  description: "Stories, guides, and tips for visiting Central Vietnam.",
  alternates: { canonical: "/blog" }
};

export default async function BlogPage() {
  const posts = await getPublishedPosts(24);

  return (
    <main>
      <PageHero
        eyebrow="Stories from the ground"
        title="Travel Blog"
        subtitle="Local guides, season-by-season tips, and stories from our team in Central Vietnam."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          {posts.length === 0 ? (
            <EmptyState>No posts published yet.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
