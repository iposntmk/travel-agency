import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DestinationMobileCarousel } from "./destination-carousel";
import { ImageCard } from "./image-card";
import type { CruiseFeatureItem, HomeDestinationItem, HomeReviewItem, HomeSectionCopy, WhyChooseItem } from "./types";

const WHY_ICONS: Record<string, string> = {
  compass: "/images/icons/icon-1.svg",
  shield: "/images/icons/icon-2.svg",
  wallet: "/images/icons/icon-3.svg",
  heart: "/images/icons/icon-4.svg"
};

export function WhoWeAre({
  heading = "Who we are",
  title,
  body,
  actionLabel = "Meet Our Team",
  actionHref = "/about-us"
}: {
  heading?: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="border-b border-[var(--tctravel-border)] bg-white py-12 md:py-16">
      <div className="container-center">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-[40px] font-bold leading-[48px] text-[var(--tctravel-text)] max-sm:text-[28px] max-sm:leading-[36px]">
            <Link href={actionHref} className="transition-colors hover:text-[var(--tctravel-primary)]">{heading}</Link>
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--tctravel-text-light)] md:text-base max-sm:text-[15px]">
            <p>{title}</p>
            <p>{body}</p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link href={actionHref} className="inline-flex items-center gap-2 rounded-lg bg-[var(--tctravel-orange)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow transition-all hover:-translate-y-0.5 hover:bg-[var(--tctravel-orange-dark)] max-sm:min-h-[44px] max-sm:text-[15px]">
              {actionLabel} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs({ items, copy }: { items: WhyChooseItem[]; copy?: HomeSectionCopy }) {
  return (
    <section className="border-b border-[var(--tctravel-border)] bg-[#f8f9fa] py-12 md:py-16">
      <div className="container-center">
        <h2 className="mb-10 text-center text-2xl font-bold text-[var(--tctravel-text)] md:text-3xl max-sm:text-[28px]">
          {copy?.title ?? "Why Travel With Us?"}
        </h2>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4 max-sm:gap-5">
          {items.map((item) => {
            const iconSrc = WHY_ICONS[item.icon ?? ""] ?? "/images/icons/icon-1.svg";
            return (
              <article key={item.title} className="flex flex-row items-center gap-4 rounded-2xl border border-[var(--tctravel-border)] bg-white p-4 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:flex-col md:p-6 md:text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center md:mb-2 md:h-16 md:w-16">
                  <Image src={iconSrc} alt={item.title} width={60} height={60} className="h-11 md:h-14 w-auto object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[var(--tctravel-text)] md:text-base max-sm:text-[15px]">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--tctravel-text-light)] md:hidden">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ reviews, summary, title = "What Clients Say About Us" }: { reviews: HomeReviewItem[]; summary: string; title?: string }) {
  return (
    <section className="border-b border-[var(--tctravel-border)] bg-white py-10 sm:py-12 md:py-14">
      <div className="container-center">
        <div className="mb-4 text-center sm:mb-6">
          <h2 className="mb-1 text-[18px] font-bold text-[var(--tctravel-text)] sm:text-[20px] md:text-[24px]">{title}</h2>
          <p className="text-[12px] text-[var(--tctravel-text-light)] sm:text-[13px]">{summary}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="flex h-full flex-col rounded-xl border border-[var(--tctravel-border)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex gap-1 text-[var(--tctravel-orange)]">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}</div>
              <p className="mb-3 mt-3 flex-1 text-[13px] leading-[20px] text-[var(--tctravel-text-light)]">&ldquo;{review.quote}&rdquo;</p>
              <div className="border-t border-gray-100 pt-2.5">
                <p className="text-[12px] font-bold leading-tight text-[var(--tctravel-text)]">{review.author}</p>
                <p className="text-[12px] text-[var(--tctravel-text-light)]">{review.context}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function BestCruises({ items, copy }: { items: CruiseFeatureItem[]; copy?: HomeSectionCopy }) {
  const t = await getTranslations("home");
  return (
    <section className="border-b border-[var(--tctravel-border)] bg-[#f8f9fa] py-12 md:py-16">
      <div className="container-center">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-[40px] font-bold leading-[48px] text-[var(--tctravel-text)] max-sm:text-[28px] max-sm:leading-[36px]">{copy?.title ?? "Best Cruises"}</h2>
          <p className="mx-auto max-w-4xl text-sm leading-relaxed text-[var(--tctravel-text-light)] md:text-base max-sm:text-[15px]">
            {copy?.subtitle ?? "Choose from featured cruise itineraries and river journeys, then ask our local team to shape details around your budget and travel style."}
          </p>
        </div>
        <div className="space-y-12">
          {items.slice(0, 2).map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div className={index === 0 ? "order-2 space-y-4 md:order-1" : "space-y-4 md:order-2"}>
                <h3 className="text-xl font-bold text-[var(--tctravel-text)] md:text-2xl max-sm:text-[24px]">
                  <Link href={item.href} className="transition-colors hover:text-[var(--tctravel-primary)]">{item.title}</Link>
                </h3>
                <p className="text-sm leading-relaxed text-[var(--tctravel-text-light)] md:text-base max-sm:text-[15px]">{item.summary}</p>
                <Link href={item.href} className="hidden items-center gap-2 rounded-lg bg-[var(--tctravel-orange)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition-all hover:bg-[var(--tctravel-orange-dark)] md:inline-flex">
                  {t("viewCruises")} <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className={index === 0 ? "order-1 md:order-2" : "md:order-1"}><ImageCard item={item} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Destinations({ items, copy }: { items: HomeDestinationItem[]; copy?: HomeSectionCopy }) {
  return (
    <section className="border-b border-[var(--tctravel-border)] bg-[#f8f9fa] py-12 md:py-16">
      <div className="container-center">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="mb-4 text-2xl font-bold text-[var(--tctravel-text)] md:text-3xl lg:text-4xl max-sm:text-[28px]">{copy?.title ?? "Top Destinations"}</h2>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[var(--tctravel-text-light)] md:text-base max-sm:text-[15px]">
            {copy?.subtitle ?? "Discover popular destinations in Vietnam with local tours, food, culture, beaches, and daily-life experiences."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {items.map((item) => <ImageCard key={item.id} item={item} tall />)}
        </div>
      </div>
    </section>
  );
}
