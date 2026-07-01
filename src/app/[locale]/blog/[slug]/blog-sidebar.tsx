import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveImage } from "@/lib/media";
import type { Comment, Post, Tour } from "@/payload-types";

interface BlogSidebarProps {
  relatedTour: Tour | null;
  relatedPosts: Post[];
  comments: Comment[];
}

export function BlogSidebar({ relatedTour, relatedPosts, comments }: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      {relatedTour ? <TourCard tour={relatedTour} /> : null}
      {relatedPosts.length > 0 ? <RelatedPostsMini posts={relatedPosts} /> : null}
      {comments.length > 0 ? <RecentComments comments={comments} /> : null}
    </aside>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  const img = resolveImage(tour.featuredImage, tour.title, { variant: "thumb" });
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-card">
      <span className="relative block aspect-[16/9] overflow-hidden bg-navy-50">
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes="320px"
          className="object-cover"
          style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
        />
      </span>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">Related tour</p>
        <h3 className="mt-1 text-sm font-bold leading-snug text-navy-950">{tour.title}</h3>
        {tour.durationText ? (
          <p className="mt-1 text-xs text-slate-500">{tour.durationText}</p>
        ) : null}
        <Link
          href={`/booking/${tour.slug}?source=blog-sidebar`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-800"
        >
          Book now
        </Link>
      </div>
    </div>
  );
}

function RelatedPostsMini({ posts }: { posts: Post[] }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-card">
      <h3 className="text-sm font-bold text-navy-950">More articles</h3>
      <ul className="mt-3 space-y-3">
        {posts.slice(0, 5).map((post) => {
          const img = resolveImage(post.featuredImage, post.title, { variant: "thumb" });
          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3">
                <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.05]"
                    style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
                  />
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-snug text-navy-950 transition-colors group-hover:text-navy-700">
                  {post.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentComments({ comments }: { comments: Comment[] }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4 shadow-card">
      <h3 className="text-sm font-bold text-navy-950">Comments</h3>
      <ul className="mt-3 divide-y divide-navy-50">
        {comments.slice(0, 5).map((comment) => (
          <li key={comment.id} className="py-3 first:pt-0 last:pb-0">
            <p className="text-xs leading-5 text-slate-600 line-clamp-2">{comment.content}</p>
            <p className="mt-1 text-[11px] font-semibold text-navy-500">
              {comment.authorName || "Reader"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
