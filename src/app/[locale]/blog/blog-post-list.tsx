import { Link } from "@/i18n/navigation";
import { BlogCard } from "@/components/blog-card";
import { EmptyState } from "@/components/section";
import type { Post } from "@/payload-types";

interface BlogPostListProps {
  heading: string;
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  /** Builds the href for a given page number (page 1 should omit ?page). */
  hrefForPage: (page: number) => string;
  clearHref?: string;
}

export function BlogPostList({ heading, posts, total, page, totalPages, hrefForPage, clearHref }: BlogPostListProps) {
  return (
    <section className="bg-mist py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">{heading}</h2>
            <p className="mt-1 text-sm text-navy-600">
              {total} {total === 1 ? "article" : "articles"}
            </p>
          </div>
          {clearHref ? (
            <Link href={clearHref} className="text-sm font-semibold text-navy-700 transition hover:text-navy-900">
              Clear filters
            </Link>
          ) : null}
        </div>

        {posts.length === 0 ? (
          <EmptyState>No articles match your search yet.</EmptyState>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {totalPages > 1 ? <BlogPagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} /> : null}
          </>
        )}
      </div>
    </section>
  );
}

function BlogPagination({
  page,
  totalPages,
  hrefForPage
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          rel="prev"
          className="rounded-md border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
        >
          Previous
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefForPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
              : "rounded-md border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
          }
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          rel="next"
          className="rounded-md border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-700 transition hover:border-navy-400"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
