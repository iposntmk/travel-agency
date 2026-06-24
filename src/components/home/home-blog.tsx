import { BlogCard } from "@/components/blog-card";
import { SectionBand, SectionHead } from "@/components/section";
import type { Post } from "@/payload-types";

interface HomeBlogProps {
  posts: Post[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function HomeBlog({ posts, eyebrow, title, subtitle, actionLabel, actionHref }: HomeBlogProps) {
  if (posts.length === 0) return null;

  return (
    <SectionBand tone="soft">
      <SectionHead
        eyebrow={eyebrow ?? "Travel journal"}
        title={title ?? "From the Blog"}
        subtitle={
          subtitle ?? "Practical planning notes, food guides, and local context before you commit to a tour."
        }
        actionHref={actionHref ?? "/blog"}
        actionLabel={actionLabel ?? "Read the blog"}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </SectionBand>
  );
}
