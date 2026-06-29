import { Stars } from "@/components/stars";
import type { Customer, Review } from "@/payload-types";
import { TourShareBar } from "./tour-share-bar";

interface TourReviewsProps {
  reviews: Review[];
  tourUrl?: string;
  tourTitle?: string;
}

function customerOf(review: Review): Customer | null {
  return review.customer && typeof review.customer === "object" ? review.customer : null;
}

export function TourReviews({ reviews, tourUrl, tourTitle }: TourReviewsProps) {
  if (reviews.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Reviews</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Guest reviews are shared after each confirmed trip.
        </p>
      </section>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Reviews</h2>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-navy-900 hover:bg-slate-50 transition-colors cursor-pointer">
          Write your review
        </button>
      </div>

      {/* Rating summary */}
      <div className="mb-6 flex items-start gap-3">
        <span className="text-5xl font-bold text-navy-950 leading-none">{avgRating.toFixed(1)}</span>
        <div className="flex flex-col">
          <Stars rating={avgRating} size={20} />
          <span className="mt-1 text-sm text-slate-400">{reviews.length} reviews</span>
        </div>
      </div>

      {/* Share bar */}
      {tourUrl && tourTitle && (
        <div className="mb-6">
          <TourShareBar url={tourUrl} title={tourTitle} />
        </div>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const customer = customerOf(review);
          return (
            <div key={review.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">
                  {customer?.name?.charAt(0) ?? "V"}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy-950">
                    {customer?.name ?? "Verified traveller"}
                    {customer?.nationality ? (
                      <span className="ml-1 font-normal text-slate-500">· {customer.nationality}</span>
                    ) : null}
                  </div>
                  {review.createdAt && (
                    <div className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  <Stars rating={review.rating} size={12} />
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-6 text-slate-600">{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
