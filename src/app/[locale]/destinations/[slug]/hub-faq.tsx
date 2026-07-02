import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { faqPageJsonLd } from "@/lib/structured-data";

interface HubFaqProps {
  destinationTitle: string;
  faqs: { id?: string | null; question: string; answer: string }[];
}

/**
 * "How to decide what to do in X" SEO accordion — Destinations.faqs entries
 * emitted as FAQPage structured data (must-see / with kids / rainy days…).
 */
export async function HubFaq({ destinationTitle, faqs }: HubFaqProps) {
  if (faqs.length === 0) return null;
  const t = await getTranslations("hub");

  return (
    <section id="faq" className="mt-16 scroll-mt-24">
      <JsonLd data={faqPageJsonLd(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))} />
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
        {t("faqTitle", { destination: destinationTitle })}
      </h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
        {faqs.map((faq) => (
          <details key={faq.id ?? faq.question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-base font-semibold text-navy-950">
              {faq.question}
              <span className="text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
