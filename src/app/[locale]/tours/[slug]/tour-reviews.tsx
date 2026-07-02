import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewWall } from "@/components/reviews/review-wall";
import type { Review } from "@/payload-types";
import { TourShareBar } from "./tour-share-bar";

interface TourReviewsProps {
  reviews: Review[];
  tourId: number | string;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  tourUrl?: string;
  tourTitle?: string;
}

export function TourReviews({ reviews, tourId, ratingAverage, ratingCount, tourUrl, tourTitle }: TourReviewsProps) {
  return (
    <div className="space-y-6">
      {tourUrl && tourTitle ? <TourShareBar url={tourUrl} title={tourTitle} /> : null}
      <ReviewWall reviews={reviews} ratingAverage={ratingAverage} ratingCount={ratingCount}>
        <ReviewForm tourId={tourId} />
      </ReviewWall>
    </div>
  );
}
