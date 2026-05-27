export function TourResultsSkeleton() {
  return (
    <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-navy-50" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-navy-50" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-navy-50" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-navy-50" />
            <div className="flex items-center justify-between pt-3">
              <div className="h-5 w-24 animate-pulse rounded bg-navy-50" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-navy-50" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
