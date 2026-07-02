import { Stars } from "@/components/stars";
import type { Customer, Review } from "@/payload-types";

interface ReviewCardProps {
  review: Review;
}

function displayName(review: Review): string {
  if (review.authorName) return review.authorName;
  const customer = review.customer && typeof review.customer === "object" ? (review.customer as Customer) : null;
  return customer?.name ?? "Verified traveller";
}

function nationality(review: Review): string | null {
  const customer = review.customer && typeof review.customer === "object" ? (review.customer as Customer) : null;
  return customer?.nationality ?? null;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const name = displayName(review);
  const nation = nationality(review);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-bold text-navy-950">
            {name}
            {nation ? <span className="ml-1 font-normal text-slate-500">· {nation}</span> : null}
          </div>
          {review.createdAt ? (
            <div className="text-xs text-slate-400">
              {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          ) : null}
        </div>
        <div className="ml-auto">
          <Stars rating={review.rating} size={12} />
        </div>
      </div>
      {review.comment ? <p className="text-sm leading-6 text-slate-600">{review.comment}</p> : null}
    </div>
  );
}
