import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero, SectionBand, SectionHead } from "@/components/section";
import { getSiteSettings } from "@/lib/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact TC Travel Vietnam for tours, transfers, free proposals, and Book Now - Pay Later trip confirmation.",
  alternates: { canonical: "/contact" }
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const email = settings?.salesEmail ?? "hello@tctravel.example";
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const hotline = settings?.hotline ?? "+84-236-555-0100";

  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="Plan the details before you pay"
        subtitle="Send a tour question, transfer request, custom itinerary brief, or booking confirmation note. The team replies by WhatsApp or email."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Contact" }
            ]}
          />
        </div>
      </PageHero>

      <SectionBand>
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHead
              eyebrow="Reach us"
              title="Sales and operations"
              subtitle="For same-week departures, WhatsApp is usually fastest. For custom routes, use the free proposal form."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["WhatsApp", whatsapp, `https://wa.me/${whatsapp.replace(/\D/g, "")}`],
              ["Email", email, `mailto:${email}`],
              ["Hotline", hotline, `tel:${hotline.replace(/\s/g, "")}`],
              ["Office", settings?.footer?.address ?? "Da Nang, Vietnam", "/destinations/da-nang"]
            ].map(([label, value, href]) => (
              <Link key={label} href={href} className="rounded-lg border border-navy-100 bg-white p-5 shadow-card transition hover:border-navy-200">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-navy-950">{value}</p>
              </Link>
            ))}
          </div>
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <SectionHead
          eyebrow="Common requests"
          title="What to send"
          subtitle="A short message is enough. Include dates, hotel area, group size, and whether you prefer private, small group, or free-tour options."
          actionHref="/customize-tour"
          actionLabel="Start free proposal"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Tour booking", "Tour slug, date, number of guests, pickup area, and any dietary or mobility notes."],
            ["Private transfer", "Route, flight or hotel details, luggage count, vehicle preference, and departure time."],
            ["Custom itinerary", "Destinations, travel month, budget range, hotel level, themes, and pace preference."]
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-navy-100 bg-white p-5 shadow-card">
              <h2 className="font-semibold text-navy-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </SectionBand>
    </main>
  );
}
