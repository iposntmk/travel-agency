"use client";

import { useState } from "react";

interface BlogCommentFormProps {
  postId: number;
}

type Status = "idle" | "submitting" | "success" | "error";

const RATINGS = [1, 2, 3, 4, 5] as const;

export function BlogCommentForm({ postId }: BlogCommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isSubmitting = status === "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (authorName.trim().length < 2 || content.trim().length < 2) {
      setError("Please add your name and a comment.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/post-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: authorName.trim(),
          content: content.trim(),
          ...(rating ? { rating } : {})
        })
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(
          data?.error === "rate-limit"
            ? "Too many submissions. Please try again in a minute."
            : "Could not submit your comment. Please try again."
        );
        setStatus("error");
        return;
      }

      setAuthorName("");
      setContent("");
      setRating(0);
      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-800">Thanks for sharing!</p>
        <p className="mt-1 text-sm text-emerald-700">
          Your comment was submitted and will appear once our team approves it.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm font-semibold text-emerald-800 underline underline-offset-2"
        >
          Write another comment
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-navy-100 bg-white p-5 shadow-card"
    >
      <h3 className="text-base font-bold tracking-tight text-navy-950">Leave a comment</h3>
      <p className="mt-1 text-xs text-slate-500">
        Comments are reviewed before they appear. Your email is never collected here.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-navy-900">Your rating</span>
        <div className="flex gap-0.5">
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              className="cursor-pointer text-2xl leading-none transition-colors"
            >
              <span className={(hover || rating) >= value ? "text-[#faca1a]" : "text-slate-300"}>
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 ? (
          <button
            type="button"
            onClick={() => setRating(0)}
            className="ml-1 text-xs text-slate-400 underline underline-offset-2"
          >
            clear
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          maxLength={80}
          required
          className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm text-navy-950 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this article…"
          rows={4}
          maxLength={1000}
          required
          className="w-full resize-y rounded-lg border border-navy-200 px-3 py-2.5 text-sm text-navy-950 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting…" : "Post comment"}
      </button>
    </form>
  );
}
