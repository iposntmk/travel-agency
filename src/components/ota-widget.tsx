import { TrackedLink } from "@/components/tracked-link";
import type { ResolvedOtaWidget } from "@/lib/ota-providers";

interface Props {
  widget: ResolvedOtaWidget;
  city: string;
  source: string;
}

export function OtaWidget({ widget, city, source }: Props) {
  const { label, url, targetId, heading, blurb } = widget;

  return (
    <article className="flex flex-col rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{label}</p>
      <h3 className="mt-2 text-base font-semibold text-slate-950">{heading ?? `More things to do in ${city}`}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {blurb ??
          `Browse day tours, tickets, and unique experiences from ${label} — booked externally, not through TC Travel.`}
      </p>
      <TrackedLink
        href={url}
        targetType="ota"
        targetId={targetId}
        source={source}
        className="mt-auto inline-flex items-center pt-3 text-sm font-semibold text-brand-blue hover:underline"
      >
        Browse on {label} →
      </TrackedLink>
    </article>
  );
}
