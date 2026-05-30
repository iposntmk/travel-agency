import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getCarRentalsForList } from "@/lib/cms";
import { resolveImage } from "@/lib/media";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rental = (await getCarRentalsForList({ limit: 100 })).find((item) => item.slug === slug);
  return rental ? { title: rental.title, alternates: { canonical: `/car-rentals/${slug}` } } : { title: "Car rental not found" };
}

export default async function CarRentalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const rental = (await getCarRentalsForList({ limit: 100 })).find((item) => item.slug === slug);
  if (!rental) notFound();

  const image = resolveImage(rental.featuredImage as Parameters<typeof resolveImage>[0], rental.title, { variant: "hero" });
  const route = [rental.routeFrom, rental.routeTo].filter(Boolean).join(" to ");

  return (
    <main className="bg-white pb-20">
      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Car Rentals", href: "/car-rentals" },
            { label: rental.title }
          ]}
        />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-100">
              <Image src={image.url} alt={image.alt} fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
            </div>
            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {rental.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {route || "Flexible private transfer"} with a trusted local operator. Request this route and pay later after confirmation.
            </p>
          </div>
          <aside className="self-start rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Private car</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {rental.priceFrom ? `From ${rental.currency ?? "USD"} ${rental.priceFrom}` : "Quote on request"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{rental.durationText ?? "Timing confirmed before departure."}</p>
            <Link href="/free-proposal" className="mt-6 inline-flex w-full justify-center rounded-full bg-[#047857] px-5 py-3 text-sm font-semibold text-white">
              Request this route
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
