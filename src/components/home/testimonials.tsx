import { SectionBand, SectionHead } from "@/components/section";
import type { Customer, Review, SiteSetting } from "@/payload-types";

interface TestimonialsProps {
  reviews: Review[];
  trust?: SiteSetting["trust"] | null;
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

export function Testimonials({ reviews, trust }: TestimonialsProps) {
  const quoted = reviews.filter((review) => review.comment?.trim());
  const hasTrust = Boolean(trust?.summary?.trim() || (trust?.reviewCount ?? 0) > 0);
  if (quoted.length === 0 && !hasTrust) return null;

  return (
    <SectionBand>
      <SectionHead
        eyebrow="What travellers say"
        title="Trusted by inbound travellers"
        subtitle={trust?.summary?.trim() || undefined}
      />

      {hasTrust ? (
        <div className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          {typeof trust?.reviewAverage === "number" ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-navy-950">
                {trust.reviewAverage.toFixed(1)}
              </span>
              <Stars rating={trust.reviewAverage} />
            </div>
          ) : null}
          {typeof trust?.reviewCount === "number" && trust.reviewCount > 0 ? (
            <p className="text-sm text-slate-600">
              Based on {trust.reviewCount.toLocaleString()} verified traveller reviews
            </p>
          ) : null}
        </div>
      ) : null}

      {quoted.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quoted.map((review) => {
            const customer = customerOf(review);
            return (
              <figure
                key={review.id}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-3 flex-1 text-sm leading-7 text-slate-700">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-navy-950">
                  {customer?.name ?? "Verified traveller"}
                  {customer?.nationality ? (
                    <span className="ml-1 font-normal text-slate-500">· {customer.nationality}</span>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : null}
    </SectionBand>
  );
}
