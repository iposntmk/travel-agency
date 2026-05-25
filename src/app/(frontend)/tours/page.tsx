import type { Metadata } from "next";
import Link from "next/link";
import { TourCard } from "@/components/tour-card";
import { getDestinations, getTours } from "@/lib/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tours",
  description: "Browse paid and free tours in Hội An, Huế, and Đà Nẵng. Filter by destination, type, season, and price."
};

const TOUR_TYPES = [
  { value: "paid-private", label: "Private" },
  { value: "paid-group", label: "Small group" },
  { value: "free-walking", label: "Free walking" },
  { value: "free-cycling", label: "Free cycling" },
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "cultural", label: "Cultural" }
] as const;

const SEASONS = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "year-round", label: "Year-round" }
] as const;

type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function readPriceMax(value: SearchParamValue): number | undefined {
  const raw = readParam(value);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

interface ToursPageProps {
  searchParams?: Promise<{
    destination?: SearchParamValue;
    type?: SearchParamValue;
    season?: SearchParamValue;
    operation?: SearchParamValue;
    priceMax?: SearchParamValue;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = (await searchParams) ?? {};
  const destination = readParam(params.destination);
  const type = readParam(params.type);
  const season = readParam(params.season);
  const operation = readParam(params.operation);
  const priceMax = readPriceMax(params.priceMax);

  const [tours, destinations] = await Promise.all([
    getTours({
      destinationSlug: destination,
      tourType: type,
      season,
      operationType: operation,
      priceMax,
      limit: 48
    }),
    getDestinations()
  ]);

  const queryString = (overrides: Record<string, string | undefined>): string => {
    const merged: Record<string, string | undefined> = {
      destination,
      type,
      season,
      operation,
      priceMax: priceMax ? String(priceMax) : undefined,
      ...overrides
    };
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, value);
    }
    const str = search.toString();
    return str ? `?${str}` : "";
  };

  const Chip = ({
    href,
    label,
    active
  }: {
    href: string;
    label: string;
    active: boolean;
  }) => (
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

  const hasFilters = Boolean(destination || type || season || operation || priceMax);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Tours</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Private, small group, partner, and free tours across Central Vietnam.
      </p>

      <section className="mt-6 space-y-4 rounded-md border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip href={`/tours${queryString({ destination: undefined })}`} label="All" active={!destination} />
            {destinations.map((d) => (
              <Chip
                key={d.id}
                href={`/tours${queryString({ destination: d.slug })}`}
                label={d.title}
                active={destination === d.slug}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tour type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip href={`/tours${queryString({ type: undefined })}`} label="All" active={!type} />
            {TOUR_TYPES.map((t) => (
              <Chip
                key={t.value}
                href={`/tours${queryString({ type: t.value })}`}
                label={t.label}
                active={type === t.value}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Season</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip href={`/tours${queryString({ season: undefined })}`} label="All" active={!season} />
            {SEASONS.map((s) => (
              <Chip
                key={s.value}
                href={`/tours${queryString({ season: s.value })}`}
                label={s.label}
                active={season === s.value}
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

      <section className="mt-6">
        {tours.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No tours match these filters. <Link className="text-brand-blue underline" href="/tours">Clear filters</Link>.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
