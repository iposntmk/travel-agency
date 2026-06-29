"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { resolveImage } from "@/lib/media";
import type { SiteSetting } from "@/payload-types";

interface BlogGalleryProps {
  media: NonNullable<SiteSetting["blogMedia"]> | null;
}

export function BlogGallery({ media }: BlogGalleryProps) {
  const items = media?.gallery ?? [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  if (items.length === 0) return null;

  const scrollToTile = (index: number) => {
    setActive(index);
    const rail = railRef.current;
    const tile = rail?.children[index] as HTMLElement | undefined;
    tile?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section className="bg-mist py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <div className="text-center">
          {media?.galleryEyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
              {media.galleryEyebrow}
            </p>
          ) : null}
          {media?.gallerySubtitle ? (
            <p className="mx-auto mt-2 max-w-2xl text-sm text-navy-600">{media.gallerySubtitle}</p>
          ) : null}
        </div>

        <div
          ref={railRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const image = resolveImage(item.image, item.caption ?? "Travel photo", { variant: "card" });
            return (
              <button
                key={item.id ?? index}
                type="button"
                onClick={() => setLightbox(index)}
                className="group relative aspect-[4/3] w-[80%] flex-none snap-start overflow-hidden rounded-2xl bg-navy-50 shadow-card sm:w-[45%] lg:w-[23.5%]"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 80vw"
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.05]"
                />
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent p-3 text-left text-sm font-semibold text-white">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {items.length > 1 ? (
          <div className="mt-5 flex justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.id ?? index}
                type="button"
                aria-label={`Go to photo ${index + 1}`}
                onClick={() => scrollToTile(index)}
                className={`h-2.5 rounded-full transition-all ${
                  active === index ? "w-6 bg-navy-700" : "w-2.5 bg-navy-300 hover:bg-navy-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {lightbox !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {(() => {
            const item = items[lightbox];
            const image = resolveImage(item.image, item.caption ?? "Travel photo", { variant: "hero" });
            return (
              <figure className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  className="mx-auto max-h-[85vh] w-auto rounded-2xl object-contain"
                />
                {item.caption ? (
                  <figcaption className="mt-3 text-center text-sm text-white/90">{item.caption}</figcaption>
                ) : null}
              </figure>
            );
          })()}
        </div>
      ) : null}
    </section>
  );
}
