import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { getDestinations } from "@/lib/cms";
import { FreeProposalForm } from "./proposal-form";

export const metadata: Metadata = {
  title: "Free Proposal",
  description: "Start a private tailor-made Vietnam travel project. No payment required now.",
  alternates: { canonical: "/free-proposal" }
};

export default async function FreeProposalPage() {
  const destinations = await getDestinations(12);

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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Start your travel project
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
              A private Vietnam itinerary, shaped by locals.
            </h1>
            <p className="text-base leading-7 text-slate-700">
              Share your dates, interests, destinations, and budget. Our team replies with a practical route and next steps.
              No online payment is required at this stage.
            </p>
          </div>
          <FreeProposalForm destinations={destinations} />
        </div>
      </section>
    </main>
  );
}
