import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { ShareButtons } from "@/components/share-buttons";
import { getSiteUrl } from "@/config/env";
import { getApprovedCommentsForTarget, getPostBySlug, getPublishedPosts } from "@/lib/cms";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import type { Destination, Post, Tour } from "@/payload-types";
import { BlogComments } from "./blog-comments";

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
    title: post.seo?.metaTitle ? { absolute: post.seo.metaTitle } : post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seo?.metaTitle ?? post.title,
      description,
      images: [{ url: ogImage }],
      type: "article",
      siteName: "TC Travel Vietnam",
      locale: "en_US",
      url: `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const comments = await getApprovedCommentsForTarget("posts", post.id, 12);

  const image = resolveImage(post.featuredImage, post.title, { variant: "hero" });
  const html = lexicalToHtml(post.content);
  const destination =
    post.destination && typeof post.destination === "object" ? (post.destination as Destination) : null;
  const relatedTour =
    post.relatedTour && typeof post.relatedTour === "object" ? (post.relatedTour as Tour) : null;
  const relatedPosts = (Array.isArray(post.relatedPosts) ? post.relatedPosts : []).filter(
    (entry): entry is Post => Boolean(entry) && typeof entry === "object"
  );
  const description = post.seo?.metaDescription?.trim() || lexicalToPlainText(post.content) || post.title;
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const postUrl = absoluteUrl(siteUrl, `/blog/${post.slug}`);

  return (
    <main className="bg-mist pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Blog", url: absoluteUrl(siteUrl, "/blog") },
            { name: post.title, url: postUrl }
          ]),
          blogPostingJsonLd({
            title: post.title,
            url: postUrl,
            description,
            image: image.isFallback ? undefined : image.url,
            datePublished: post.createdAt,
            dateModified: post.updatedAt
          })
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title }
          ]}
        />

        <header className="mt-6 space-y-4">
          {destination ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
              {destination.title}
            </p>
          ) : null}
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-navy-950 md:text-5xl">
            {post.title}
          </h1>
          {post.readingTime ? (
            <p className="text-sm text-slate-500">{post.readingTime} min read</p>
          ) : null}
        </header>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-navy-50 shadow-card">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
            style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
          />
        </div>

        {html ? (
          <div
            className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950 prose-a:text-navy-700 prose-strong:text-navy-900 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : null}

        <div className="mt-10">
          <ShareButtons url={postUrl} title={post.title} medium="blog" campaignId={post.slug} />
        </div>

        <BlogComments comments={comments} />

        <section className="mt-12 rounded-2xl border border-navy-100 bg-white p-6 shadow-card md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Plan your trip</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-950">
            Book now — pay when you meet your guide.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Submit an inquiry and our team confirms details by WhatsApp or email — no prepayment required.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {relatedTour ? (
              <Link
                href={`/booking/${relatedTour.slug}?source=blog-cta`}
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                Book {relatedTour.title}
              </Link>
            ) : (
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                Browse tours
              </Link>
            )}
            <Link
              href="/free-tours"
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-navy-50"
            >
              Join free tours
            </Link>
          </div>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-navy-950">More reads</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {relatedPosts.slice(0, 4).map((related) => (
                <li key={related.id}>
                  <Link className="text-navy-700 hover:underline" href={`/blog/${related.slug}`}>
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
