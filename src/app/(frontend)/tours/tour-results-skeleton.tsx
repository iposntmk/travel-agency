export function TourResultsSkeleton() {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="aspect-[16/10] animate-pulse bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="flex items-center justify-between pt-3">
              <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
