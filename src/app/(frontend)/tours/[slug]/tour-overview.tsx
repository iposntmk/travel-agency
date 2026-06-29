import Image from "next/image";
import { MapPin, Calendar, Check } from "lucide-react";
import type { Destination, Tour } from "@/payload-types";
import { lexicalToPlainText } from "@/lib/lexical";
import { resolveImage } from "@/lib/media";

interface Props {
  tour: Tour;
  destination: Destination | null;
}

interface HighlightItem {
  title: string;
  description?: string | null;
}

export function TourOverview({ tour, destination }: Props) {
  const highlights: HighlightItem[] = Array.isArray(tour.highlights) && tour.highlights.length > 0
    ? tour.highlights
    : deriveHighlights(tour);

  const intro = tour.highlightIntro?.trim() || (tour.description ? lexicalToPlainText(tour.description) : null);

  const map = resolveImage(tour.mapImage, `${tour.title} route map`, { variant: "hero" });
  const startEnd = tour.startEnd || (destination ? `${destination.title} / ${destination.title}` : null);
  const languages = tour.guideLanguages || "English";

  return (
    <section id="overview" className="scroll-mt-20">
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Overview</h2>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {/* Route map / location image */}
        {!map.isFallback ? (
          <div className="overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
            <Image
              src={map.url}
              alt={map.alt}
              width={600}
              height={420}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover"
              style={map.objectPosition ? { objectPosition: map.objectPosition } : undefined}
            />
          </div>
        ) : destination ? (
          <div className="overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              <MapPin className="mr-2 size-4" /> {destination.title}, Vietnam
            </div>
          </div>
        ) : null}

        {/* Tour info grid */}
        <div className="space-y-3">
          {startEnd && (
            <InfoRow icon={<MapPin className="size-4 shrink-0 text-brand-green" />} label="Start/End:" value={startEnd} />
          )}
          {tour.routeSummary && (
            <InfoRow icon={<MapPin className="size-4 shrink-0 text-brand-green" />} label="Route:" value={tour.routeSummary} />
          )}
          {tour.durationText && (
            <InfoRow icon={<Calendar className="size-4 shrink-0 text-brand-green" />} label="Duration:" value={tour.durationText} />
          )}
          <InfoRow icon={<span className="text-brand-green">🎒</span>} label="Travel style:" value={tour.travelStyle || tour.tourType.replace(/-/g, " ")} />
          <InfoRow icon={<span className="text-brand-green">🏷️</span>} label="Tour type:" value={tour.operationType.replace(/-/g, " ")} />
          <InfoRow icon={<span className="text-brand-green">🗣️</span>} label="Tour guide in:" value={languages} />
        </div>
      </div>

      {/* Highlights */}
      {(intro || highlights.length > 0) && (
        <div className="mt-6 rounded-xl bg-navy-50 p-5 border border-navy-100">
          <h3 className="mb-3 text-base font-bold text-brand-green">Highlight</h3>
          {intro && <p className="mb-4 text-sm leading-relaxed text-slate-600">{intro}</p>}
          {highlights.length > 0 && (
            <ul className="space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-900">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-green" />
                  <span>
                    <strong className="text-navy-950">{h.title}</strong>
                    {h.description ? <> – {h.description}</> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function deriveHighlights(tour: Tour): HighlightItem[] {
  const description = tour.description ? lexicalToPlainText(tour.description) : null;
  if (!description) return [];
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 5)
    .map((line) => ({ title: line }));
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon}
      <span className="font-bold text-navy-950">{label}</span>
      <span className="text-slate-600">{value}</span>
    </div>
  );
}
