interface StarsProps {
  rating: number;
  size?: number;
}

export function Stars({ rating, size = 16 }: StarsProps) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex gap-0.5" aria-label={`${rounded} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < rounded ? "text-[#faca1a]" : "text-slate-300"}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
