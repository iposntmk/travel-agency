import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { ShareButtons } from "@/components/share-buttons";
import { getSiteUrl } from "@/config/env";
import { getApprovedCommentsForTarget, getPostBySlug, getPublishedPosts } from "@/lib/cms";
import { lexicalToHtml, lexicalToHeadings, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import type { Destination, Post, Tour } from "@/payload-types";
import { BlogAuthorBio } from "./blog-author-bio";
import { BlogComments } from "./blog-comments";
import { BlogRelatedPosts } from "./blog-related-posts";
import { BlogSidebar } from "./blog-sidebar";
import { BlogToc } from "./blog-toc";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  const posts = await getPublishedPosts(100);
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: "Post not found" };

  const siteUrl = getSiteUrl();
  const description =
    post.seo?.metaDescription?.trim() || lexicalToPlainText(post.content) || post.title;
  const ogImage = resolveOgImage(post.seo?.ogImage ?? post.featuredImage, siteUrl);
  const path = `/blog/${post.slug}`;

  return {
    title: post.seo?.metaTitle ? { absolute: post.seo.metaTitle } : post.title,
    description,
    alternates: { canonical: localizedUrl(siteUrl, locale, path), languages: buildAlternates(siteUrl, path) },
    openGraph: {
      title: post.seo?.metaTitle ?? post.title,
      description,
      images: [{ url: ogImage }],
      type: "article",
      siteName: "TC Travel Vietnam",
      url: localizedUrl(siteUrl, locale, path)
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();
  const comments = await getApprovedCommentsForTarget("posts", post.id, 12);

  const image = resolveImage(post.featuredImage, post.title, { variant: "hero" });
  const html = lexicalToHtml(post.content);
  const headings = lexicalToHeadings(post.content);
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

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            ...(destination ? [{ label: destination.title, href: `/destinations/${destination.slug}` }] : []),
            { label: post.title }
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <article>
            <header className="space-y-3">
              {destination ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
                  {destination.title}
                </p>
              ) : null}
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-navy-950 md:text-4xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  {post.author ? <span className="font-medium text-navy-900">By {post.author}</span> : null}
                  <span>·</span>
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </time>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View: {post.viewCount ?? 0}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Comment: {comments.length}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  Latest Update: {post.updateCount ?? 0}
                </span>
                {post.readingTime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readingTime} min read
                  </span>
                ) : null}
              </div>
            </header>

            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-navy-50 shadow-card">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
              />
            </div>

            <BlogToc headings={headings} />

            {html ? (
              <div
                className="prose prose-slate mt-6 max-w-none prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950 prose-a:text-navy-700 prose-strong:text-navy-900 prose-p:leading-relaxed prose-figure:my-6 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-slate-500 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : null}

            <div className="mt-8">
              <ShareButtons url={postUrl} title={post.title} medium="blog" campaignId={post.slug} />
            </div>

            <BlogAuthorBio author={post.author} createdAt={post.createdAt} />

            <BlogComments comments={comments} postId={post.id} />

            <BlogRelatedPosts posts={relatedPosts} />
          </article>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BlogSidebar
                relatedTour={relatedTour}
                relatedPosts={relatedPosts}
                comments={comments}
              />
            </div>
          </div>
        </div>

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
      </div>
    </main>
  );
}
