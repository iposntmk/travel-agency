import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import { QuickProposal } from "./quick-proposal";

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
  const heroDestination = destinations[0];
  const image = resolveImage(heroDestination?.featuredImage, "Tailor-made Vietnam travel", { variant: "hero" });

  return (
    <section className="relative bg-white">
      <div className="relative min-h-[660px] overflow-hidden md:min-h-[720px]">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="absolute inset-0 bg-white/70" aria-hidden />
        <div className="relative mx-auto flex min-h-[660px] max-w-page flex-col justify-center px-4 pb-28 pt-20 md:min-h-[720px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Private tailor-made trips in Vietnam
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Local journeys shaped around your pace.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 md:text-lg md:leading-8">
            Private guides, small groups, car transfers, and flexible proposals across Hội An, Huế, Đà Nẵng, and beyond.
            No payment is required until your trip is confirmed.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/free-proposal"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#047857] px-6 text-sm font-semibold text-white shadow-elevated transition hover:bg-[#065F46]"
            >
              Start your travel project
              <ArrowIcon />
            </Link>
            <Link
              href="/tours"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Explore tours
            </Link>
          </div>
          <TrustStrip />
        </div>
        <div className="absolute inset-x-4 bottom-0 translate-y-1/2 md:left-1/2 md:right-auto md:w-[min(760px,calc(100%-2rem))] md:-translate-x-1/2">
          <QuickProposal destinations={destinations} />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.label} className="rounded-lg border border-white/70 bg-white/75 px-4 py-3 shadow-card backdrop-blur">
          <dt className="text-sm font-semibold text-slate-950">{item.label}</dt>
          <dd className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-600">{item.hint}</dd>
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
