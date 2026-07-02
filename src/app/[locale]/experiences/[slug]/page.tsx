import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { DealPrice } from "@/components/deal-price";
import { JsonLd } from "@/components/json-ld";
import { VoucherCheckForm } from "@/components/voucher-check-form";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/cms";
import { getExperienceBySlug, getExperiencesForList } from "@/lib/cms-experiences";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, tourProductJsonLd } from "@/lib/structured-data";
import type { Destination } from "@/payload-types";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  const experiences = await getExperiencesForList(24);
  return routing.locales.flatMap((locale) => experiences.map((experience) => ({ locale, slug: experience.slug })));
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const experience = await getExperienceBySlug(slug, locale);
  if (!experience) return { title: "Experience not found" };

  const siteUrl = getSiteUrl();
  const path = `/experiences/${slug}`;
  const description =
    experience.seo?.metaDescription?.trim() ||
    experience.summary?.trim() ||
    lexicalToPlainText(experience.description) ||
    experience.title;
  const ogImage = resolveOgImage(experience.seo?.ogImage ?? experience.featuredImage, siteUrl);

  return {
    title: experience.seo?.metaTitle ? { absolute: experience.seo.metaTitle } : experience.title,
    description,
    alternates: { canonical: localizedUrl(siteUrl, locale, path), languages: buildAlternates(siteUrl, path) },
    openGraph: {
      title: experience.seo?.metaTitle ?? experience.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      url: localizedUrl(siteUrl, locale, path)
    }
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [experience, siteSettings, t] = await Promise.all([
    getExperienceBySlug(slug, locale),
    getSiteSettings(locale),
    getTranslations("experiences")
  ]);
  if (!experience) notFound();

  const destination =
    experience.destination && typeof experience.destination === "object"
      ? (experience.destination as Destination)
      : null;
  const image = resolveImage(experience.featuredImage, experience.title, { variant: "hero" });
  const html = lexicalToHtml(experience.description);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const url = absoluteUrl(siteUrl, `/experiences/${slug}`);
  const whatsapp = siteSettings?.whatsapp ?? "";
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : null;
  const description =
    experience.seo?.metaDescription?.trim() || experience.summary?.trim() || lexicalToPlainText(experience.description);

  return (
    <main className="bg-mist pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Experiences", url: absoluteUrl(siteUrl, "/experiences") },
            { name: experience.title, url }
          ]),
          tourProductJsonLd({
            title: experience.title,
            url,
            description,
            image: image.isFallback ? undefined : image.url,
            priceFrom: experience.priceFrom,
            currency: experience.currency,
            tourType: experience.experienceType
          })
        ]}
      />

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: t("title"), href: "/experiences" },
            { label: experience.title }
          ]}
        />

        <header className="mt-5 space-y-3">
          {destination ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{destination.title}</p>
          ) : null}
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy-950 md:text-5xl">
            {experience.title}
          </h1>
          {experience.summary ? <p className="max-w-3xl text-lg leading-8 text-slate-700">{experience.summary}</p> : null}
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-navy-50 shadow-card">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
                style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
              />
            </div>
            {html ? (
              <section
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : null}
          </div>

          <aside className="space-y-4 self-start">
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
              {experience.priceFrom ? (
                <DealPrice
                  priceFrom={experience.priceFrom}
                  originalPrice={experience.deal?.originalPrice}
                  dealEndsAt={experience.deal?.dealEndsAt}
                  className="text-lg font-semibold text-navy-950"
                />
              ) : (
                <p className="text-lg font-semibold text-navy-950">{t("quoteOnRequest")}</p>
              )}
              <dl className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                {experience.venue ? (
                  <div>
                    <dt className="font-semibold text-navy-950">{t("venue")}</dt>
                    <dd>{experience.venue}</dd>
                  </div>
                ) : null}
                {experience.sessionDuration ? (
                  <div>
                    <dt className="font-semibold text-navy-950">{t("duration")}</dt>
                    <dd>{experience.sessionDuration}</dd>
                  </div>
                ) : null}
              </dl>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
                >
                  {t("bookViaWhatsApp")}
                </a>
              ) : null}
              <p className="mt-3 text-[11px] leading-4 text-slate-400">{t("payLaterNote")}</p>
            </div>

            <VoucherCheckForm productType="experiences" productId={experience.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
