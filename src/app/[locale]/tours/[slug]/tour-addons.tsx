import { TrackedLink } from "@/components/tracked-link";
import type { Partner } from "@/payload-types";

interface Props {
  addOns: Partner[];
  tourSlug: string;
}

export function TourAddOns({ addOns, tourSlug }: Props) {
  if (addOns.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Add-on services</h2>
      <p className="mt-2 text-xs text-slate-500">
        External partners — clicking opens the partner&rsquo;s site in a new tab.
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {addOns.map((addOn) => {
          const url = addOn.inquiryFormUrl?.trim();
          const body = (
            <>
              <p className="font-semibold text-navy-950">{addOn.name}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
                {addOn.partnerType}
              </p>
              {addOn.description ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">{addOn.description}</p>
              ) : null}
            </>
          );
          return (
            <li
              key={addOn.id}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              {url ? (
                <TrackedLink
                  href={url}
                  targetType="addon"
                  targetId={String(addOn.id)}
                  source={`/tours/${tourSlug}`}
                  className="block"
                >
                  {body}
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-700">
                    View on partner site →
                  </p>
                </TrackedLink>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
