"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitReview } from "@/app/actions/submit-review";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  tourId: number | string;
}

export function ReviewForm({ tourId }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "submitting") return;
    if (rating < 1) {
      setStatus("error");
      setErrorMessage(t("ratingRequired"));
      return;
    }
    setStatus("submitting");
    const result = await submitReview({
      tourId,
      rating,
      authorName: name,
      authorEmail: email,
      comment,
      website: website as ""
    });
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error.message);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 p-5 text-sm leading-6 text-navy-950">
        <p className="font-semibold">{t("thanksTitle")}</p>
        <p className="mt-1 text-slate-600">{t("pendingNote")}</p>
      </div>
    );
  }

  return (
    <form id="write-review" onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-navy-950">{t("write")}</h3>

      <div className="flex items-center gap-1" role="radiogroup" aria-label={t("ratingLabel")}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star}/5`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hovered || rating) >= star ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
              )}
            />
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-green"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-green"
        />
      </div>

      <textarea
        required
        minLength={10}
        maxLength={2000}
        rows={4}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("commentPlaceholder")}
        className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-green"
      />

      {/* Honeypot — hidden from real users, bots fill it and get silently dropped. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {status === "error" ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-60"
      >
        {status === "submitting" ? "…" : t("submit")}
      </button>
      <p className="text-[11px] leading-4 text-slate-400">{t("moderationNote")}</p>
    </form>
  );
}
