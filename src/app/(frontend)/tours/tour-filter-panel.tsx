import Link from "next/link";
import type { Destination } from "@/payload-types";
import { queryString, SEASONS, TOUR_TYPES, type ToursPageQuery } from "./query";

interface TourFilterPanelProps {
  destinations: Destination[];
  query: ToursPageQuery;
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-white"
          : "rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue"
      }
    >
      {label}
    </Link>
  );
}

export function TourFilterPanel({ destinations, query }: TourFilterPanelProps) {
  const hasFilters = Boolean(query.destination || query.type || query.season || query.operation || query.priceMax);

  return (
    <section className="mt-6 space-y-4 rounded-md border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip href={`/tours${queryString(query, { destination: undefined })}`} label="All" active={!query.destination} />
          {destinations.map((d) => (
            <Chip
              key={d.id}
              href={`/tours${queryString(query, { destination: d.slug })}`}
              label={d.title}
              active={query.destination === d.slug}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tour type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip href={`/tours${queryString(query, { type: undefined })}`} label="All" active={!query.type} />
          {TOUR_TYPES.map((t) => (
            <Chip
              key={t.value}
              href={`/tours${queryString(query, { type: t.value })}`}
              label={t.label}
              active={query.type === t.value}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Season</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip href={`/tours${queryString(query, { season: undefined })}`} label="All" active={!query.season} />
          {SEASONS.map((s) => (
            <Chip
              key={s.value}
              href={`/tours${queryString(query, { season: s.value })}`}
              label={s.label}
              active={query.season === s.value}
            />
          ))}
        </div>
      </div>
      {hasFilters ? (
        <div>
          <Link
            href="/tours"
            className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </section>
  );
}
