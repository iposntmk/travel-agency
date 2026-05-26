import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/cms";
import { resolveImage } from "@/lib/media";
import type { Destination } from "@/payload-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Travel Blog",
  description: "Stories, guides, and tips for visiting Central Vietnam.",
  alternates: { canonical: "/blog" }
};

export default async function BlogPage() {
  const posts = await getPublishedPosts(24);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Travel Blog</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Local guides, season-by-season tips, and stories from our team.
      </p>

      <section className="mt-8">
        {posts.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No posts published yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const image = resolveImage(post.featuredImage, post.title, { variant: "card" });
              const destination =
                post.destination && typeof post.destination === "object"
                  ? (post.destination as Destination).title
                  : null;
              return (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
                >
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] bg-slate-100">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {destination ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{destination}</p>
                    ) : null}
                    <h2 className="text-lg font-semibold leading-tight text-slate-950">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.readingTime ? (
                      <p className="text-xs text-slate-500">{post.readingTime} min read</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
