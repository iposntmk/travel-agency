import { lexicalToHtml } from "@/lib/lexical";
import type { Tour } from "@/payload-types";

interface Props {
  items: NonNullable<Tour["itinerary"]>;
}

export function TourItinerary({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Itinerary</h2>
      <ol className="mt-5 space-y-3">
        {items.map((item, index) => {
          const html = lexicalToHtml(item.activity);
          return (
            <li
              key={item.id ?? index}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-xs font-bold text-navy-900">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {item.time ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
                      {item.time}
                    </p>
                  ) : null}
                  {html ? (
                    <div
                      className="prose prose-sm mt-1 max-w-none prose-p:my-1 prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
