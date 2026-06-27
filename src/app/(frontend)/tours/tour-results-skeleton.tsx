export function TourResultsSkeleton() {
  return (
    <section className="mt-8 flex flex-col gap-5">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="grid w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-card sm:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr]"
        >
          <div className="h-[260px] animate-pulse bg-navy-50 sm:h-full sm:min-h-[280px]" />
          <div className="flex flex-col p-[18px]">
            <div className="flex items-start justify-between gap-4">
              <div className="h-5 w-3/5 animate-pulse rounded bg-navy-50" />
              <div className="h-6 w-16 animate-pulse rounded-[5px] bg-navy-50" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-navy-50" />
              <div className="h-3 w-16 animate-pulse rounded bg-navy-50" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-4/5 animate-pulse rounded bg-navy-50" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-navy-50" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-navy-50" />
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <div className="h-4 w-24 animate-pulse rounded bg-navy-50" />
              <div className="h-9 w-24 animate-pulse rounded-[5px] bg-navy-50" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
