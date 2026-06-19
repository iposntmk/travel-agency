import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getSiteSettings } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";
import { absoluteUrl, bookingConfirmationJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Contact details and next steps after submitting a travel inquiry.",
  alternates: { canonical: "/booking/confirmation" },
  robots: { index: false, follow: true }
};

const DEFAULTS = {
  hotline: "+84-236-555-0100",
  whatsapp: "+84-903-111-222",
  salesEmail: "hello@tctravel.example"
};

export default async function ConfirmationPage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const pageUrl = absoluteUrl(siteUrl, "/booking/confirmation");
  const [upsellTours, siteSettings] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 3 }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 3 })
    ),
    getSiteSettings()
  ]);

  const hotline = siteSettings?.hotline ?? DEFAULTS.hotline;
  const whatsapp = siteSettings?.whatsapp ?? DEFAULTS.whatsapp;
  const email = siteSettings?.salesEmail ?? DEFAULTS.salesEmail;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Booking Confirmation", url: pageUrl }
          ]),
          bookingConfirmationJsonLd(pageUrl)
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-950">Thanks. Our team will contact you within 24h.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          We will reach out via your preferred contact channel to confirm the details and next steps.
          No payment is required until your trip is confirmed.
        </p>
        <div className="mt-8 grid gap-3 rounded-md border border-slate-200 p-5 text-sm text-slate-700">
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} className="text-navy-700 hover:underline">
              {whatsapp}
            </a>
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${email}`} className="text-navy-700 hover:underline">
              {email}
            </a>
          </p>
          <p>
            <strong>Phone / Zalo:</strong>{" "}
            <a href={`tel:${hotline.replace(/\s/g, "")}`} className="text-navy-700 hover:underline">
              {hotline}
            </a>
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-md bg-brand-blue px-4 py-2 font-semibold text-white" href="/tours">
            Explore More Tours
          </Link>
          <Link className="rounded-md border border-brand-blue px-4 py-2 font-semibold text-brand-blue" href="/free-tours">
            Join Free Tours
          </Link>
        </div>
      </div>

      {upsellTours.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-950">While you wait — tours you might like</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {upsellTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
