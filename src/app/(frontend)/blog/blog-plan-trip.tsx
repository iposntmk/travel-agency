import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PlanCard {
  title: string;
  blurb: string;
  href: string;
  className: string;
}

const PLAN_CARDS: PlanCard[] = [
  {
    title: "Before the Trip",
    blurb: "Visas, best seasons, money, and what to pack for Central Vietnam.",
    href: "/blog?cat=before-trip",
    className: "bg-emerald-700 hover:bg-emerald-600"
  },
  {
    title: "Eat & Drink",
    blurb: "Where to find the best bánh mì, cao lầu, and street coffee.",
    href: "/blog?cat=eat",
    className: "bg-amber-500 hover:bg-amber-400"
  },
  {
    title: "Things to Do",
    blurb: "Heritage walks, beaches, lanterns, and day trips worth the drive.",
    href: "/blog?cat=do",
    className: "bg-orange-800 hover:bg-orange-700"
  }
];

export function BlogPlanTrip() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 text-white md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 400px at 50% -20%, rgba(74,144,217,0.30), transparent 60%)"
        }}
      />
      <div className="relative mx-auto max-w-page px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Plan your trip</h2>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-navy-100">
            Read up before you go
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLAN_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group flex min-h-[180px] flex-col justify-between rounded-2xl p-6 text-white shadow-card transition ${card.className}`}
            >
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">{card.title}</h3>
                <span className="mt-3 block h-1 w-12 rounded-full bg-white/70" />
                <p className="mt-4 text-sm leading-6 text-white/90">{card.blurb}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                Read guides
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
