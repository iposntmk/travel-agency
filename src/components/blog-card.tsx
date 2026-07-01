import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveImage } from "@/lib/media";
import type { Destination, Post } from "@/payload-types";

interface Props {
  post: Post;
}

export async function BlogCard({ post }: Props) {
  const t = await getTranslations("card");
  const image = resolveImage(post.featuredImage, post.title, { variant: "card" });
  const destination =
    post.destination && typeof post.destination === "object"
      ? (post.destination as Destination).title
      : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/30 via-navy-950/0 to-navy-950/0" />
        {destination ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
            {destination}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.readingTime ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
            {t("readingTime", { count: post.readingTime })}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-navy-950">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-navy-700">
            {post.title}
          </Link>
        </h2>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-navy-700">
          {t("readArticle")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
