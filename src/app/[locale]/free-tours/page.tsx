import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { EmptyState, PageHero } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { getSiteSettings } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Free Tours",
    description:
      "Join our free walking and cycling tours in Hội An, Huế, and Đà Nẵng. Registration uses the same Book Now - Pay Later inquiry flow.",
    alternates: {
      canonical: localizedUrl(getSiteUrl(), locale, "/free-tours"),
      languages: buildAlternates(getSiteUrl(), "/free-tours")
    }
  };
}

export default async function FreeToursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [freeTours, siteSettings] = await Promise.all([
    getToursForList({ freeOnly: true, limit: 24, locale }),
    getSiteSettings(locale)
  ]);
  const config = siteSettings?.homepage?.freeTours;
  if (config?.pageEnabled === false) notFound();

  return (
    <main>
      <PageHero
        eyebrow={text(config?.eyebrow, "Tips appreciated")}
        title={text(config?.title, "Free Tours")}
        subtitle={text(
          config?.subtitle,
          "Free walking and cycling tours led by locals. Registration uses the same Book Now · Pay Later inquiry — tagged separately for sales follow-up."
        )}
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Free Tours" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          {freeTours.length === 0 ? (
            <EmptyState>No free tours scheduled right now. Check back soon.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  ctaLabel="Register"
                  ctaHref={`/booking/${tour.slug}?source=free-tour-upsell`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
