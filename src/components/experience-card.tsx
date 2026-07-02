import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Destination, Experience } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import { DealPrice } from "@/components/deal-price";
import { ProductBadges } from "@/components/product-badges";
import { WishlistButton } from "@/components/wishlist-button";

interface ExperienceCardProps {
  experience: Experience;
}

export async function ExperienceCard({ experience }: ExperienceCardProps) {
  const t = await getTranslations();
  const image = resolveImage(experience.featuredImage, experience.title, { variant: "card" });
  const destination =
    experience.destination && typeof experience.destination === "object"
      ? (experience.destination as Destination).title
      : null;
  const href = `/experiences/${experience.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {destination ? (
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
              {destination}
            </span>
          ) : null}
          <ProductBadges
            isFeatured={experience.isFeatured}
            isBestSeller={experience.isBestSeller}
            createdAt={experience.createdAt}
            priceFrom={experience.priceFrom}
            originalPrice={experience.deal?.originalPrice}
            dealEndsAt={experience.deal?.dealEndsAt}
          />
        </div>
      </Link>
      <WishlistButton
        type="experience"
        slug={experience.slug}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-card backdrop-blur transition hover:scale-105"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
          {experience.experienceType.replace(/-/g, " ")}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-navy-950">
          <Link href={href} className="transition-colors hover:text-navy-700">
            {experience.title}
          </Link>
        </h3>
        <div className="space-y-1 text-sm leading-6 text-slate-600">
          {experience.venue ? <p>{experience.venue}</p> : null}
          {experience.sessionDuration ? <p>{experience.sessionDuration}</p> : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-sm font-medium text-slate-600">
            {experience.priceFrom ? (
              <DealPrice
                priceFrom={experience.priceFrom}
                originalPrice={experience.deal?.originalPrice}
                dealEndsAt={experience.deal?.dealEndsAt}
              />
            ) : (
              t("card.quoteOnRequest")
            )}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            {t("card.viewDetails")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
