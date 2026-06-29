"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt: string;
  objectPosition?: string;
}

interface Props {
  images: GalleryImage[];
  title: string;
}

export function TourGallery({ images, title }: Props) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-navy-50">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={images[current].url}
            alt={images[current].alt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
            style={images[current].objectPosition ? { objectPosition: images[current].objectPosition } : undefined}
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                "relative size-[90px] shrink-0 overflow-hidden rounded-lg transition-all cursor-pointer sm:w-[135px]",
                i === current
                  ? "ring-2 ring-brand-blue ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} ${i + 1}`}
                fill
                sizes="135px"
                className="object-cover"
                style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
