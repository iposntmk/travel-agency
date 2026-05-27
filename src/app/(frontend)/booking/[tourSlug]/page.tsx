import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/cms";
import { bookingSourceSchema } from "@/schemas/booking";
import { BookingForm } from "./booking-form";

export const dynamicParams = true;
export const revalidate = 300;

interface PageProps {
  params: Promise<{ tourSlug: string }>;
  searchParams?: Promise<{ source?: string | string[] }>;
}

export const metadata: Metadata = {
  title: "Book a tour",
  description: "Submit a booking inquiry — no payment required now.",
  robots: { index: false, follow: false }
};

export default async function BookingFormPage({ params, searchParams }: PageProps) {
  const { tourSlug } = await params;
  const tour = await getTourBySlug(tourSlug);
  if (!tour) notFound();

  const sp = (await searchParams) ?? {};
  const sourceParam = Array.isArray(sp.source) ? sp.source[0] : sp.source;
  const parsedSource = bookingSourceSchema.safeParse(sourceParam);
  const source = parsedSource.success ? parsedSource.data : "direct";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-10">
      <nav className="text-sm text-slate-500">
        <Link className="hover:underline" href="/tours">Tours</Link>
        <span className="mx-2">›</span>
        <Link className="hover:underline" href={`/tours/${tour.slug}`}>{tour.title}</Link>
        <span className="mx-2">›</span>
        <span>Book</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-slate-950 md:text-4xl">Request this tour</h1>
      <p className="mt-3 text-slate-600">
        Tell us a few details. Sales will reach you within 24 hours on your preferred channel — no online payment now.
      </p>
      <section className="mt-8 rounded-md border border-slate-200 bg-white p-5 md:p-6">
        <BookingForm tourSlug={tour.slug} tourTitle={tour.title} source={source} />
      </section>
    </main>
  );
}
