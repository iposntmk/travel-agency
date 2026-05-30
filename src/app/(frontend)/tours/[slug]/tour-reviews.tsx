import type { Customer, Review } from "@/payload-types";

interface TourReviewsProps {
  reviews: Review[];
}

function customerOf(review: Review): Customer | null {
  return review.customer && typeof review.customer === "object" ? review.customer : null;
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="text-brand-gold" aria-label={`${rounded} out of 5 stars`}>
      {"★".repeat(rounded)}
      <span className="text-navy-100">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export function TourReviews({ reviews }: TourReviewsProps) {
  if (reviews.length === 0) {
    return (
      <section id="reviews" className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight text-navy-950">Reviews</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Guest reviews are shared after each confirmed trip.
        </p>
      </section>
    );
  }

  return (
    <section id="reviews" className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            Traveller feedback
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-navy-950">Reviews</h2>
        </div>
        <p className="text-sm text-slate-500">{reviews.length} verified reviews</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {reviews.map((review) => {
          const customer = customerOf(review);
          return (
            <figure key={review.id} className="rounded-lg border border-navy-100 bg-mist p-4">
              <Stars rating={review.rating} />
              {review.comment ? (
                <blockquote className="mt-3 text-sm leading-6 text-slate-700">
                  “{review.comment}”
                </blockquote>
              ) : null}
              <figcaption className="mt-3 text-sm font-semibold text-navy-950">
                {customer?.name ?? "Verified traveller"}
                {customer?.nationality ? (
                  <span className="ml-1 font-normal text-slate-500">· {customer.nationality}</span>
                ) : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
