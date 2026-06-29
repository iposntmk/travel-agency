import Link from "next/link";
import { SectionHead } from "@/components/section";
import type { Comment, Post, User } from "@/payload-types";

interface BlogRecentCommentsProps {
  comments: Comment[];
}

function authorName(comment: Comment): string {
  if (comment.authorName?.trim()) return comment.authorName.trim();
  const author = comment.author && typeof comment.author === "object" ? (comment.author as User) : null;
  if (author?.email) return author.email.split("@")[0].replace(/[._-]+/g, " ");
  return "TC Travel reader";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function targetPost(comment: Comment): Post | null {
  return comment.target?.relationTo === "posts" && typeof comment.target.value === "object"
    ? (comment.target.value as Post)
    : null;
}

export function BlogRecentComments({ comments }: BlogRecentCommentsProps) {
  if (comments.length === 0) return null;

  return (
    <section className="bg-mist py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <SectionHead align="center" eyebrow="From our readers" title="Last comments" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {comments.map((comment) => {
            const name = authorName(comment);
            const post = targetPost(comment);
            return (
              <article
                key={comment.id}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {initials(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold capitalize text-navy-950">{name}</p>
                    <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-700">{comment.content}</p>
                {post ? (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 line-clamp-1 text-xs font-semibold text-navy-700 transition-colors hover:text-navy-900"
                  >
                    on “{post.title}”
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
