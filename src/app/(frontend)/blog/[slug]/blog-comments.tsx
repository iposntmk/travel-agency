import { Stars } from "@/components/stars";
import type { Comment, User } from "@/payload-types";
import { BlogCommentForm } from "./blog-comment-form";

interface BlogCommentsProps {
  comments: Comment[];
  postId: number;
}

function authorLabel(comment: Comment): string {
  if (comment.authorName?.trim()) return comment.authorName.trim();
  const author = comment.author && typeof comment.author === "object" ? (comment.author as User) : null;
  if (!author?.email) return "TC Travel reader";
  return author.email.split("@")[0].replace(/[._-]+/g, " ");
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function averageRating(comments: Comment[]): { avg: number; count: number } {
  const rated = comments.filter((c): c is Comment & { rating: number } => typeof c.rating === "number");
  if (rated.length === 0) return { avg: 0, count: 0 };
  const avg = rated.reduce((sum, c) => sum + c.rating, 0) / rated.length;
  return { avg, count: rated.length };
}

export function BlogComments({ comments, postId }: BlogCommentsProps) {
  const { avg, count } = averageRating(comments);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-navy-950">
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </h2>
        {count > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold leading-none text-navy-950">{avg.toFixed(1)}</span>
            <div className="flex flex-col">
              <Stars rating={avg} size={16} />
              <span className="text-[11px] text-slate-400">{count} rating{count !== 1 ? "s" : ""}</span>
            </div>
          </div>
        ) : null}
      </div>

      {comments.length > 0 ? (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="flex gap-3 rounded-xl border border-navy-100 bg-white p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                {authorLabel(comment).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-navy-950">{authorLabel(comment)}</p>
                  <span className="text-[11px] text-slate-400">{formatDate(comment.createdAt)}</span>
                  {typeof comment.rating === "number" ? (
                    <span className="ml-auto">
                      <Stars rating={comment.rating} size={12} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{comment.content}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No comments yet — be the first to share your thoughts.
        </p>
      )}

      <BlogCommentForm postId={postId} />
    </section>
  );
}
