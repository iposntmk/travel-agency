interface RatingDistributionProps {
  /** Count of reviews per star, index 0 = 1★ … index 4 = 5★. */
  counts: [number, number, number, number, number];
}

export function RatingDistribution({ counts }: RatingDistributionProps) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return null;

  return (
    <div className="w-full max-w-xs space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star - 1];
        const percent = Math.round((count / total) * 100);
        return (
          <div key={star} className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-6 shrink-0 font-medium text-navy-900">{star}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
