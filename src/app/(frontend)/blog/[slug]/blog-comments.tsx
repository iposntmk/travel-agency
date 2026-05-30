import type { Comment, User } from "@/payload-types";

interface BlogCommentsProps {
  comments: Comment[];
}

function authorLabel(comment: Comment): string {
  const author = comment.author && typeof comment.author === "object" ? (comment.author as User) : null;
  if (!author?.email) return "TC Travel reader";
  return author.email.split("@")[0].replace(/[._-]+/g, " ");
}

export function BlogComments({ comments }: BlogCommentsProps) {
  if (comments.length === 0) return null;

  return (
    <section className="mt-12 rounded-2xl border border-navy-100 bg-white p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            Reader notes
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-navy-950">Comments</h2>
        </div>
        <p className="text-sm text-slate-500">{comments.length} approved comments</p>
      </div>
      <div className="mt-5 space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-lg border border-navy-100 bg-mist p-4">
            <p className="text-sm leading-6 text-slate-700">{comment.content}</p>
            <p className="mt-3 text-sm font-semibold capitalize text-navy-950">{authorLabel(comment)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
