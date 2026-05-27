import { TrackedLink } from "@/components/tracked-link";
import { buildOtaUrl, otaProviderLabel, otaTargetId, type OtaProvider } from "@/lib/ota-providers";

interface Props {
  provider: OtaProvider;
  city: string;
  source: string;
}

export function OtaWidget({ provider, city, source }: Props) {
  const url = buildOtaUrl(provider, city);
  const label = otaProviderLabel(provider);

  return (
    <article className="flex flex-col rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{label}</p>
      <h3 className="mt-2 text-base font-semibold text-slate-950">
        More things to do in {city}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Browse day tours, tickets, and unique experiences from {label} — booked externally, not
        through TC Travel.
      </p>
      <TrackedLink
        href={url}
        targetType="ota"
        targetId={otaTargetId(provider, city)}
        source={source}
        className="mt-auto inline-flex items-center pt-3 text-sm font-semibold text-brand-blue hover:underline"
      >
        Browse on {label} →
      </TrackedLink>
    </article>
  );
}
