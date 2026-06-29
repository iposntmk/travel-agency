import config from "../payload.config";
import { getPayload } from "payload";

// Seed sample tour-specific FAQs for the first few active tours that don't
// already have them. FAQs feed the "Good to know" accordion and FAQPage
// JSON-LD (GEO/AI search). Idempotent: skips tours that already have FAQs.
const TOUR_LIMIT = 5;

interface Faq {
  question: string;
  answer: string;
}

function faqsFor(title: string, isFree: boolean): Faq[] {
  const base: Faq[] = [
    {
      question: `What is included in the ${title}?`,
      answer:
        "The listed inclusions cover your local English-speaking guide, entrance fees noted in the itinerary, and any meals or transport explicitly stated. International flights, travel insurance, and personal expenses are not included."
    },
    {
      question: "How do I get picked up?",
      answer:
        "Your guide or driver meets you at your hotel lobby in Hoi An, Hue, or Da Nang at the agreed start time. Share your hotel name and room number after booking and we confirm the exact pick-up the day before."
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Free cancellation up to 24 hours before the start time for a full refund. Cancellations inside 24 hours or no-shows are non-refundable. Weather-affected tours are rescheduled or refunded."
    },
    {
      question: "Is this tour suitable for children and families?",
      answer:
        "Yes. Pacing and stops can be adjusted for families, and child pricing is available on most departures. Tell us the ages when booking so the guide can tailor the day."
    }
  ];

  const paidExtra: Faq = {
    question: "When and how do I pay?",
    answer:
      "Reserve now and pay later — confirm your spot online with no upfront charge, then pay the guide in cash (USD or VND) or by card on the tour day. Prices are per person in USD unless stated otherwise."
  };
  const freeExtra: Faq = {
    question: "Is this tour really free?",
    answer:
      "Yes, it is free to join — no upfront cost. Tips for your local guide are appreciated but never required. Any optional food, drinks, or entrance fees during the walk are paid directly by you."
  };

  return [...base, isFree ? freeExtra : paidExtra];
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "tours",
    where: { status: { equals: "active" } },
    limit: TOUR_LIMIT,
    depth: 0,
    overrideAccess: true
  });

  let updated = 0;
  let skipped = 0;

  for (const tour of result.docs) {
    const existing = (tour as { faqs?: unknown[] }).faqs;
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`skip (has faqs): ${tour.title}`);
      skipped += 1;
      continue;
    }

    const isFree = !tour.priceFrom || tour.priceFrom === 0;
    await payload.update({
      collection: "tours",
      id: tour.id,
      data: { faqs: faqsFor(tour.title, isFree) },
      overrideAccess: true
    });
    console.log(`seeded faqs: ${tour.title}`);
    updated += 1;
  }

  console.log(`\nDone. updated=${updated} skipped=${skipped}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error("seed-faqs failed", error);
  process.exit(1);
});
