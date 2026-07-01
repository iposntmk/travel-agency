import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveImage } from "@/lib/media";
import type { Destination, Post } from "@/payload-types";

interface BlogFeaturedProps {
  posts: Post[];
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function destinationLabel(post: Post): string | null {
  return post.destination && typeof post.destination === "object"
    ? (post.destination as Destination).title
    : null;
}

export function BlogFeatured({ posts }: BlogFeaturedProps) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;
  const sidebar = rest.slice(0, 5);
  const heroImage = resolveImage(featured.featuredImage, featured.title, { variant: "hero" });
  const heroDestination = destinationLabel(featured);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative block aspect-[16/11] overflow-hidden rounded-2xl bg-navy-50 shadow-card md:aspect-[16/10]"
          >
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
              style={heroImage.objectPosition ? { objectPosition: heroImage.objectPosition } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              {heroDestination ? (
                <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
                  {heroDestination}
                </span>
              ) : null}
              <h2 className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight text-white drop-shadow-sm md:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm font-medium text-navy-100">{formatDate(featured.createdAt)}</p>
            </div>
          </Link>

          <ul className="flex flex-col divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
            {sidebar.map((post) => {
              const thumb = resolveImage(post.featuredImage, post.title, { variant: "thumb" });
              return (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-center gap-4 p-3 transition-colors hover:bg-mist"
                  >
                    <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                      <Image
                        src={thumb.url}
                        alt={thumb.alt}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.05]"
                        style={thumb.objectPosition ? { objectPosition: thumb.objectPosition } : undefined}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-navy-950 transition-colors group-hover:text-navy-700">
                        {post.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">{formatDate(post.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
