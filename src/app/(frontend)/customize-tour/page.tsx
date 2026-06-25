import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getDestinations, getSiteSettings } from "@/lib/cms";
import { FreeProposalForm } from "./proposal-form";

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export const metadata: Metadata = {
  title: "Free Proposal",
  description: "Start a private tailor-made Vietnam travel project. No payment required now.",
  alternates: { canonical: "/customize-tour" }
};

export default async function FreeProposalPage() {
  const [destinations, siteSettings] = await Promise.all([getDestinations(12), getSiteSettings()]);
  const config = siteSettings?.freeProposal;
  if (config?.enabled === false) notFound();

  const themes = (config?.themes ?? [])
    .map((item) => item?.value)
    .filter((value): value is string => Boolean(value));
  const stages = (config?.stages ?? [])
    .map((item) => item?.value)
    .filter((value): value is string => Boolean(value));

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-page px-4 py-10 md:py-16">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Free Proposal" }
          ]}
        />
        <div className="mt-8 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green">
              {text(config?.hero?.eyebrow, "Start your travel project")}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
              {text(config?.hero?.title, "A private Vietnam itinerary, shaped by locals.")}
            </h1>
            <p className="text-base leading-7 text-slate-700">
              {text(
                config?.hero?.subtitle,
                "Share your dates, interests, destinations, and budget. Our team replies with a practical route and next steps. No online payment is required at this stage."
              )}
            </p>
          </div>
          <FreeProposalForm destinations={destinations} themes={themes} stages={stages} />
        </div>
      </section>
    </main>
  );
}
