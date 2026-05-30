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
      aria-pressed={active}
      className={
        active
          ? "inline-flex items-center rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-card"
          : "inline-flex items-center rounded-full border border-navy-100 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900"
      }
    >
      {label}
    </Link>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const DURATIONS = [{ value: "1", label: "1 day" }, { value: "3", label: "Up to 3 days" }, { value: "7", label: "Up to 1 week" }];
const GROUP_SIZES = [{ value: "2", label: "2 guests" }, { value: "4", label: "4 guests" }, { value: "8", label: "8+ guests" }];
const SORTS = [{ value: "featured", label: "Featured" }, { value: "price", label: "Price" }, { value: "rating", label: "Rating" }, { value: "duration", label: "Duration" }];

export function TourFilterPanel({ destinations, query }: TourFilterPanelProps) {
  const hasFilters = Boolean(query.destination || query.type || query.season || query.operation || query.priceMax || query.duration || query.groupSize || query.rating || query.sort);

  return (
    <section
      aria-label="Filter tours"
      className="space-y-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-card md:p-6"
    >
      <FilterGroup label="Destination">
        <Chip
          href={`/tours${queryString(query, { destination: undefined })}`}
          label="All"
          active={!query.destination}
        />
        {destinations.map((d) => (
          <Chip
            key={d.id}
            href={`/tours${queryString(query, { destination: d.slug })}`}
            label={d.title}
            active={query.destination === d.slug}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Tour type">
        <Chip
          href={`/tours${queryString(query, { type: undefined })}`}
          label="All"
          active={!query.type}
        />
        {TOUR_TYPES.map((t) => (
          <Chip
            key={t.value}
            href={`/tours${queryString(query, { type: t.value })}`}
            label={t.label}
            active={query.type === t.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Season">
        <Chip
          href={`/tours${queryString(query, { season: undefined })}`}
          label="All"
          active={!query.season}
        />
        {SEASONS.map((s) => (
          <Chip
            key={s.value}
            href={`/tours${queryString(query, { season: s.value })}`}
            label={s.label}
            active={query.season === s.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Duration">
        <Chip href={`/tours${queryString(query, { duration: undefined })}`} label="Any" active={!query.duration} />
        {DURATIONS.map((d) => (
          <Chip
            key={d.value}
            href={`/tours${queryString(query, { duration: d.value })}`}
            label={d.label}
            active={query.duration === Number(d.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Group size">
        <Chip href={`/tours${queryString(query, { groupSize: undefined })}`} label="Any" active={!query.groupSize} />
        {GROUP_SIZES.map((g) => (
          <Chip
            key={g.value}
            href={`/tours${queryString(query, { groupSize: g.value })}`}
            label={g.label}
            active={query.groupSize === Number(g.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Sort">
        {SORTS.map((s) => (
          <Chip
            key={s.value}
            href={`/tours${queryString(query, { sort: s.value === "featured" ? undefined : s.value })}`}
            label={s.label}
            active={s.value === "featured" ? !query.sort : query.sort === s.value}
          />
        ))}
        <Chip href={`/tours${queryString(query, { rating: "4" })}`} label="4★+" active={query.rating === 4} />
      </FilterGroup>

      {hasFilters ? (
        <div className="flex items-center justify-between border-t border-navy-100 pt-4">
          <p className="text-xs text-slate-500">Showing filtered results.</p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1 rounded-full border border-navy-100 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </section>
  );
}
