import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero, SectionBand, SectionHead } from "@/components/section";
import { getSiteSettings, getTeamMembers } from "@/lib/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet TC Travel Vietnam, a local Central Vietnam team designing practical tours, transfers, and pay-later travel plans.",
  alternates: { canonical: "/about-us" }
};

export default async function AboutUsPage() {
  const [team, settings] = await Promise.all([getTeamMembers(8), getSiteSettings()]);
  const trust = settings?.trust;

  return (
    <main>
      <PageHero
        eyebrow="About TC Travel"
        title="Local trip design for Central Vietnam"
        subtitle="We build realistic travel days around local guides, clear confirmation, practical transfer planning, and Book Now - Pay Later operations."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "About Us" }
            ]}
          />
        </div>
      </PageHero>

      <SectionBand>
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">How we work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-950">
              Useful, paced, and easy to confirm
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-slate-700 md:text-base">
            <p>
              TC Travel Vietnam focuses on Hội An, Huế, Đà Nẵng, and Quảng Trị. Our team combines
              guided experiences, private transfers, and custom proposal planning so travellers can
              test an itinerary before committing money upfront.
            </p>
            <p>
              Every public booking starts as an inquiry. A real team member confirms pickup, pace,
              dates, special requests, and payment timing by WhatsApp or email before the trip runs.
            </p>
          </div>
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <SectionHead
          eyebrow="Operations"
          title="What travellers can expect"
          subtitle="The seed data mirrors these operating promises so QA can test the site like a real travel business."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Pay later", "No forced checkout for inquiry bookings. Guests confirm details first."],
            ["Local routing", "Tours, transfers, attractions, posts, reviews, and comments are linked by destination."],
            ["Human follow-up", "Sales and guide teams handle WhatsApp confirmation before each departure."]
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-navy-100 bg-white p-5 shadow-card">
              <h3 className="font-semibold text-navy-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </SectionBand>

      <SectionBand>
        <SectionHead
          eyebrow="Team"
          title="People behind the trips"
          subtitle={trust?.summary?.trim() || undefined}
          actionHref="/contact"
          actionLabel="Contact us"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <article key={member.id} className="rounded-lg border border-navy-100 bg-white p-5 shadow-card">
              <h3 className="font-semibold text-navy-950">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-navy-600">{member.role}</p>
              {member.quote ? <p className="mt-3 text-sm leading-6 text-slate-600">{member.quote}</p> : null}
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/free-proposal"
            className="inline-flex rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            Request a free proposal
          </Link>
        </div>
      </SectionBand>
    </main>
  );
}
