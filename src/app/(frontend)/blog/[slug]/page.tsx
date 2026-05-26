import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/config/env";
import { getPostBySlug, getPublishedPosts } from "@/lib/cms";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import type { Destination, Post, Tour } from "@/payload-types";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getPublishedPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const siteUrl = getSiteUrl();
  const description =
    post.seo?.metaDescription?.trim() || lexicalToPlainText(post.content) || post.title;
  const ogImage = resolveOgImage(post.seo?.ogImage ?? post.featuredImage, siteUrl);

  return {
    title: post.seo?.metaTitle ?? post.title,
    description,
    openGraph: {
      title: post.seo?.metaTitle ?? post.title,
      description,
      images: [{ url: ogImage }],
      type: "article",
      url: `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const image = resolveImage(post.featuredImage, post.title, { variant: "hero" });
  const html = lexicalToHtml(post.content);
  const destination =
    post.destination && typeof post.destination === "object" ? (post.destination as Destination) : null;
  const relatedTour =
    post.relatedTour && typeof post.relatedTour === "object" ? (post.relatedTour as Tour) : null;
  const relatedPosts = (Array.isArray(post.relatedPosts) ? post.relatedPosts : []).filter(
    (entry): entry is Post => Boolean(entry) && typeof entry === "object"
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <nav className="text-sm text-slate-500">
        <Link className="hover:underline" href="/blog">Blog</Link>
      </nav>

      <header className="mt-4 space-y-3">
        {destination ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{destination.title}</p>
        ) : null}
        <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">{post.title}</h1>
        {post.readingTime ? <p className="text-xs text-slate-500">{post.readingTime} min read</p> : null}
      </header>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>

      {html ? (
        <article
          className="prose prose-slate mt-6 max-w-none prose-headings:text-slate-950"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      <section className="mt-10 rounded-md bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Plan your trip</h2>
        <p className="mt-2 text-sm text-slate-600">
          Book Now - Pay Later. Submit an inquiry and our team confirms details by WhatsApp or email.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {relatedTour ? (
            <Link
              href={`/tours/${relatedTour.slug}`}
              className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {relatedTour.title}
            </Link>
          ) : (
            <Link
              href="/tours"
              className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Browse tours
            </Link>
          )}
          <Link
            href="/free-tours"
            className="rounded-md border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-blue-50"
          >
            Join free tours
          </Link>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">More reads</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {relatedPosts.slice(0, 4).map((related) => (
              <li key={related.id}>
                <Link className="text-brand-blue hover:underline" href={`/blog/${related.slug}`}>
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
