import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveImage } from "@/lib/media";
import type { Post } from "@/payload-types";

interface BlogRelatedPostsProps {
  posts: Post[];
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold tracking-tight text-navy-950">Other articles</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.slice(0, 6).map((post) => {
          const img = resolveImage(post.featuredImage, post.title, { variant: "thumb" });
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-elevated"
            >
              <span className="relative block aspect-[3/2] overflow-hidden bg-navy-50">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 18vw, 45vw"
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                  style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
                />
              </span>
              <span className="block p-3">
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-navy-950 transition-colors group-hover:text-navy-700">
                  {post.title}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
