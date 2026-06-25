import Image from "next/image";
import Link from "next/link";
import type { CruiseFeatureItem, HomeDestinationItem } from "./types";

export function ImageCard({ item, wide = false, tall = false }: { item: HomeDestinationItem | CruiseFeatureItem; wide?: boolean; tall?: boolean }) {
  const hasSummary = "summary" in item;
  return (
    <Link href={item.href} className={wide ? "group col-span-2 block overflow-hidden rounded-2xl" : "group block overflow-hidden rounded-2xl"}>
      <div className={tall ? "relative aspect-[3/4]" : wide ? "relative aspect-[16/9]" : "relative h-64"}>
        <Image
          src={item.image.url}
          alt={item.image.alt}
          fill
          sizes="(min-width:768px) 25vw, 82vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          style={{ objectPosition: item.image.objectPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/5" />
        <div className={hasSummary ? "absolute inset-x-0 bottom-0 z-10 p-5 text-left text-white" : "absolute inset-x-0 bottom-5 z-10 flex items-center justify-center px-5 text-center text-white"}>
          <h3 className="text-xl font-extrabold tracking-wider drop-shadow-md max-sm:text-2xl">{item.title}</h3>
          {hasSummary ? <p className="mt-2 line-clamp-2 text-sm text-white/90">{item.summary}</p> : null}
        </div>
      </div>
    </Link>
  );
}
