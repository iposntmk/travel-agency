import Link from "next/link";
import type { Destination } from "@/payload-types";

const DOT_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='2' cy='2' r='1' fill='white'/></svg>\")";

const TRUST_ITEMS = [
  { label: "4.9★ rating", hint: "From inbound travellers" },
  { label: "Book now · Pay later", hint: "No prepayment required" },
  { label: "Local guides", hint: "Hội An · Huế · Đà Nẵng" },
  { label: "Free walking tours", hint: "Tips appreciated" }
];

interface HomeHeroProps {
  destinations: Destination[];
}

export function HomeHero({ destinations }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 480px at 80% -10%, rgba(74,144,217,0.35), transparent 60%), radial-gradient(820px 540px at 10% 110%, rgba(15,103,177,0.45), transparent 55%)"
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: DOT_PATTERN }} />
      <div className="relative mx-auto grid max-w-page gap-12 px-4 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            Central Vietnam · Private & Free Tours
          </p>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Discover Hội An, Huế & Đà Nẵng on your terms.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-navy-100 md:text-lg md:leading-8">
            Private guides, small groups, and free walking tours from locals who live the region.
            Submit an inquiry now and pay later when you meet your guide.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 shadow-elevated transition hover:bg-navy-50"
            >
              Explore tours
              <ArrowIcon />
            </Link>
            <Link
              href="/free-tours"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Join free tours
            </Link>
          </div>
          <TrustStrip />
        </div>
        <DestinationsPanel destinations={destinations} />
      </div>
    </section>
  );
}

function DestinationsPanel({ destinations }: HomeHeroProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 -translate-y-3 translate-x-3 rounded-3xl bg-white/10 blur-md md:translate-x-6" aria-hidden />
      <div className="relative rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-100">Featured destinations</p>
        <div className="mt-4 grid gap-3">
          {destinations.length === 0 ? (
            <p className="text-sm text-navy-100">Destinations coming soon.</p>
          ) : (
            destinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15"
              >
                <span className="font-semibold text-white">{destination.title}</span>
                <span className="text-xs text-navy-100">
                  {destination.region === "central" ? "Central Vietnam" : "Vietnam"} →
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <dt className="text-sm font-semibold text-white">{item.label}</dt>
          <dd className="mt-0.5 text-[11px] uppercase tracking-wide text-navy-100">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
