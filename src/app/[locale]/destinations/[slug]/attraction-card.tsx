import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { resolveImage } from "@/lib/media";

interface AttractionCardProps {
  destinationSlug: string;
  slug: string;
  title: string;
  summary?: string;
  featuredImage?: unknown;
  /** Number of tours that visit this attraction ("147 activities" à la GYG). */
  activityCount?: number;
}

export async function AttractionCard({
  destinationSlug,
  slug,
  title,
  summary,
  featuredImage,
  activityCount
}: AttractionCardProps) {
  const t = await getTranslations("hub");
  const image = resolveImage(featuredImage as Parameters<typeof resolveImage>[0], title, { variant: "card" });
  const href = `/destinations/${destinationSlug}/attractions/${slug}`;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-snug text-navy-950 group-hover:text-navy-700">{title}</h3>
        {typeof activityCount === "number" && activityCount > 0 ? (
          <p className="mt-1 text-xs font-medium text-slate-500">{t("nActivities", { count: activityCount })}</p>
        ) : summary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{summary}</p>
        ) : null}
      </div>
    </Link>
  );
}
