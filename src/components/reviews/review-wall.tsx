import { getTranslations } from "next-intl/server";
import { Stars } from "@/components/stars";
import type { Review } from "@/payload-types";
import { RatingDistribution } from "./rating-distribution";
import { ReviewCard } from "./review-card";

interface ReviewWallProps {
  reviews: Review[];
  /** Optional authoritative aggregate (e.g. tour.ratingAverage/Count); falls back to computing from the given reviews. */
  ratingAverage?: number | null;
  ratingCount?: number | null;
  title?: string;
  children?: React.ReactNode;
}

function distributionOf(reviews: Review[]): [number, number, number, number, number] {
  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating)));
    counts[star - 1] += 1;
  }
  return counts;
}

/**
 * GetYourGuide-style review wall: big average + stars + distribution bars +
 * review cards. Props-driven server component so tour pages and destination
 * hubs share it. `children` slot renders the write-review form below the list.
 */
export async function ReviewWall({ reviews, ratingAverage, ratingCount, title, children }: ReviewWallProps) {
  const t = await getTranslations("reviews");
  const count = ratingCount ?? reviews.length;
  const average =
    ratingAverage ?? (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);

  return (
    <section id="reviews">
      <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-navy-950">
        {title ?? t("title")}
      </h2>

      {count > 0 ? (
        <div className="mb-6 flex flex-wrap items-start gap-6">
          <div className="flex items-start gap-3">
            <span className="text-5xl font-bold leading-none text-navy-950">{average.toFixed(1)}</span>
            <div className="flex flex-col">
              <Stars rating={average} size={20} />
              <span className="mt-1 text-sm text-slate-400">{t("count", { count })}</span>
            </div>
          </div>
          <RatingDistribution counts={distributionOf(reviews)} />
        </div>
      ) : (
        <p className="mb-6 text-sm leading-6 text-slate-600">{t("empty")}</p>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
