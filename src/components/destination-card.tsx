import Image from "next/image";
import Link from "next/link";
import { lexicalToPlainText } from "@/lib/lexical";
import { resolveImage } from "@/lib/media";
import type { Destination } from "@/payload-types";

interface Props {
  destination: Destination;
}

const REGION_LABEL: Record<string, string> = {
  central: "Central Vietnam",
  north: "Northern Vietnam",
  south: "Southern Vietnam"
};

export function DestinationCard({ destination }: Props) {
  const image = resolveImage(destination.featuredImage, destination.title, { variant: "card" });
  const summary = lexicalToPlainText(destination.description, 140);
  const region = destination.region ? REGION_LABEL[destination.region] : null;

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/35 via-navy-950/0 to-navy-950/0" />
        {region ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
            {region}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-navy-950 transition-colors group-hover:text-navy-700">
          {destination.title}
        </h2>
        {summary ? <p className="text-sm leading-7 text-slate-600">{summary}</p> : null}
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-navy-700">
          Explore
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
