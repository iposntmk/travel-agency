import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBandProps {
  tone?: "default" | "soft";
  className?: string;
  children: React.ReactNode;
}

export function SectionBand({ tone = "default", className, children }: SectionBandProps) {
  return (
    <section className={cn(tone === "soft" ? "bg-mist" : "bg-white", "py-16 md:py-24", className)}>
      <div className="mx-auto max-w-page px-4">{children}</div>
    </section>
  );
}

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  align?: "left" | "center";
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  actionHref,
  actionLabel,
  align = "left"
}: SectionHeadProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-wrap gap-4",
        align === "center" ? "flex-col items-center text-center" : "items-end justify-between"
      )}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950 md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 transition hover:text-navy-900"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-navy-100 bg-mist p-8 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 380px at 85% -10%, rgba(74,144,217,0.30), transparent 60%), radial-gradient(720px 420px at 5% 120%, rgba(15,103,177,0.40), transparent 55%)"
        }}
      />
      <div className="relative mx-auto max-w-page px-4 py-16 md:py-24">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-navy-100 md:text-lg md:leading-8">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
