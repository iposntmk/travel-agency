import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { PublicCarRental } from "@/lib/cms";
import { resolveImage } from "@/lib/media";

interface Props {
  rental: PublicCarRental;
}

export async function CarRentalCard({ rental }: Props) {
  const t = await getTranslations("card");
  const image = resolveImage(rental.featuredImage as Parameters<typeof resolveImage>[0], rental.title, { variant: "card" });
  const route = [rental.routeFrom, rental.routeTo].filter(Boolean).join(` ${t("routeJoin")} `);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <Link href={`/car-rentals/${rental.slug}`} className="relative block aspect-[4/3] bg-slate-100">
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </Link>
      <div className="space-y-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">
          {rental.vehicleType?.replace(/-/g, " ") ?? t("privateCar")}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          <Link href={`/car-rentals/${rental.slug}`}>{rental.title}</Link>
        </h3>
        <p className="text-sm leading-6 text-slate-600">{route || t("flexiblePrivateTransfer")}</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-semibold text-slate-900">
            {rental.priceFrom ? `${t("from")} ${rental.currency ?? "USD"} ${rental.priceFrom}` : t("quoteOnRequest")}
          </span>
          <Link
            href={`/car-rentals/${rental.slug}`}
            className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white"
          >
            {t("details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
