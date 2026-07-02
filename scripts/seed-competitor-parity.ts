// One-off: seed demo/starter data for the competitor-parity features so the
// storefront shows them immediately (deals, giveaway, cross-sell voucher
// promotion, experiences, destination-hub FAQs/chips/nearby, nav links).
// Idempotent — every step upserts or skips when the data already exists.
// English (default locale) only; other locales fall back. Attraction editorial
// content is intentionally NOT seeded — that stays with the content team.
// Run: node --env-file=.env --import=tsx/esm scripts/seed-competitor-parity.ts
import { getPayload, type Payload } from "payload";
import config from "../payload.config";

const DAY_MS = 24 * 60 * 60 * 1000;

function lexicalParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [{ type: "text", text, version: 1, format: 0, style: "", mode: "normal", detail: 0 }]
      }))
    }
  };
}

async function findBySlug(payload: Payload, collection: string, slug: string): Promise<{ id: number } | null> {
  const result = await (payload as unknown as {
    find(args: Record<string, unknown>): Promise<{ docs: { id: number }[] }>;
  }).find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true });
  return result.docs[0] ?? null;
}

async function seedExperiences(payload: Payload): Promise<number[]> {
  const hoiAn = await findBySlug(payload, "destinations", "hoi-an");
  if (!hoiAn) {
    console.log("! destination hoi-an not found — skipping experiences");
    return [];
  }

  const experiences = [
    {
      slug: "ky-uc-hoi-an-memories-show",
      title: "Ky Uc Hoi An — Memories Show Ticket",
      experienceType: "show-ticket",
      summary:
        "Vietnam's biggest outdoor visual performance — 500 performers retell 400 years of Hoi An on a riverside island stage.",
      venue: "Hoi An Memories Land, Cam Nam island",
      sessionDuration: "60 minutes, nightly from 8:00 PM",
      priceFrom: 27,
      deal: { originalPrice: 34, dealEndsAt: new Date(Date.now() + 30 * DAY_MS).toISOString() },
      isFeatured: true
    },
    {
      slug: "cam-thanh-basket-boat-ride",
      title: "Cam Thanh Coconut Forest Basket Boat Ride",
      experienceType: "boat-ride",
      summary: "Spin, paddle, and crab-fish through the water-coconut channels of Cam Thanh with local rowers.",
      venue: "Cam Thanh coconut village, 10 minutes from the Old Town",
      sessionDuration: "45–60 minutes",
      priceFrom: 8,
      isBestSeller: true
    },
    {
      slug: "hoi-an-herbal-spa-massage",
      title: "Hoi An Herbal Spa — 90-Minute Massage",
      experienceType: "massage-spa",
      summary: "Traditional Vietnamese herbal massage with hot compress — hotel pickup available in the Old Town area.",
      venue: "Old Town spa district",
      sessionDuration: "90 minutes",
      priceFrom: 22
    }
  ];

  const ids: number[] = [];
  for (const experience of experiences) {
    const existing = await findBySlug(payload, "experiences", experience.slug);
    if (existing) {
      ids.push(existing.id);
      console.log(`~ experience ${experience.slug} exists`);
      continue;
    }
    const created = await payload.create({
      collection: "experiences",
      overrideAccess: true,
      disableTransaction: true,
      data: { ...experience, destination: hoiAn.id, status: "active" } as never
    });
    ids.push(created.id as number);
    console.log(`+ experience ${experience.slug} created`);
  }
  return ids;
}

async function seedDeals(payload: Payload): Promise<void> {
  const plans: { collection: "tours" | "cruises" | "car-rentals"; take: number }[] = [
    { collection: "tours", take: 3 },
    { collection: "cruises", take: 2 },
    { collection: "car-rentals", take: 2 }
  ];

  for (const plan of plans) {
    const result = await payload.find({
      collection: plan.collection,
      where: { and: [{ status: { equals: "active" } }, { priceFrom: { greater_than: 0 } }] },
      limit: plan.take,
      depth: 0,
      sort: "-isFeatured",
      overrideAccess: true
    });

    for (const doc of result.docs as { id: number; priceFrom?: number | null; deal?: { originalPrice?: number | null } }[]) {
      if (doc.deal?.originalPrice) {
        console.log(`~ ${plan.collection}/${doc.id} already has a deal`);
        continue;
      }
      if (!doc.priceFrom) continue;
      const originalPrice = Math.ceil(doc.priceFrom * 1.25);
      await payload.update({
        collection: plan.collection,
        id: doc.id,
        overrideAccess: true,
        disableTransaction: true,
        data: {
          deal: { originalPrice, dealEndsAt: new Date(Date.now() + 30 * DAY_MS).toISOString() }
        } as never
      });
      console.log(`+ ${plan.collection}/${doc.id} deal ${doc.priceFrom} (was ${originalPrice})`);
    }
  }

  // Mark the two most-reviewed tours as best sellers.
  const topTours = await payload.find({
    collection: "tours",
    where: { status: { equals: "active" } },
    limit: 2,
    depth: 0,
    sort: "-ratingCount",
    overrideAccess: true
  });
  for (const tour of topTours.docs as { id: number; isBestSeller?: boolean | null }[]) {
    if (tour.isBestSeller) continue;
    await payload.update({
      collection: "tours",
      id: tour.id,
      overrideAccess: true,
      disableTransaction: true,
      data: { isBestSeller: true } as never
    });
    console.log(`+ tours/${tour.id} marked best seller`);
  }
}

async function seedPromotions(payload: Payload, experienceIds: number[]): Promise<void> {
  // 1. Public sale banner with countdown.
  const bannerExisting = await payload.find({
    collection: "promotions",
    where: { code: { equals: "SUMMER15" } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  if (!bannerExisting.docs[0]) {
    await payload.create({
      collection: "promotions",
      overrideAccess: true,
      disableTransaction: true,
      data: {
        name: "Summer Sale 15%",
        code: "SUMMER15",
        description: "Site-wide summer sale banner",
        discountType: "percentage",
        discountValue: 15,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * DAY_MS).toISOString(),
        season: "summer",
        isPublic: true,
        showCountdown: true,
        bannerText: "Summer Sale — up to 15% off Central Vietnam tours"
      } as never
    });
    console.log("+ promotion SUMMER15 (public banner) created");
  } else {
    console.log("~ promotion SUMMER15 exists");
  }

  // 2. Cross-sell voucher: book the Hue → Hoi An car, unlock 10% off experiences.
  const crossExisting = await payload.find({
    collection: "promotions",
    where: { code: { equals: "CAR2SHOW10" } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  if (crossExisting.docs[0]) {
    console.log("~ promotion CAR2SHOW10 exists");
    return;
  }

  // Prefer Huế→Hội An routes (diacritic-aware); fall back to every active car
  // rental — anyone transferring into the region is a cross-sell candidate.
  let hueCars = await payload.find({
    collection: "car-rentals",
    where: {
      and: [{ status: { equals: "active" } }, { routeFrom: { like: "Huế" } }, { routeTo: { like: "Hội An" } }]
    },
    limit: 5,
    depth: 0,
    overrideAccess: true
  });
  if (hueCars.docs.length === 0) {
    hueCars = await payload.find({
      collection: "car-rentals",
      where: { status: { equals: "active" } },
      limit: 10,
      depth: 0,
      overrideAccess: true
    });
  }
  if (hueCars.docs.length === 0 || experienceIds.length === 0) {
    console.log("! no active car rentals or no experiences — skipping CAR2SHOW10");
    return;
  }

  await payload.create({
    collection: "promotions",
    overrideAccess: true,
    disableTransaction: true,
    data: {
      name: "Hue transfer → 10% off Hoi An experiences",
      code: "CAR2SHOW10",
      description:
        "Auto-issued voucher: confirming a Hue → Hoi An private car booking unlocks 10% off show tickets, basket boats, and spa.",
      discountType: "percentage",
      discountValue: 10,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * DAY_MS).toISOString(),
      isPublic: false,
      autoIssueVoucher: true,
      voucherValidityDays: 60,
      triggerProducts: hueCars.docs.map((car) => ({ relationTo: "car-rentals", value: (car as { id: number }).id })),
      rewardApplicableTo: experienceIds.map((id) => ({ relationTo: "experiences", value: id }))
    } as never
  });
  console.log(`+ promotion CAR2SHOW10 created (${hueCars.docs.length} trigger cars, ${experienceIds.length} rewards)`);
}

async function seedSiteSettings(payload: Payload): Promise<void> {
  const settings = await payload.find({
    collection: "site-settings",
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const doc = settings.docs[0] as
    | { id: number; giveaway?: { enabled?: boolean | null } | null; generalFaqs?: unknown[] | null; cancellationPolicy?: unknown }
    | undefined;
  if (!doc) {
    console.log("! no site-settings doc — skipping giveaway/faqs/policy");
    return;
  }

  const data: Record<string, unknown> = {};
  if (!doc.giveaway?.enabled) {
    data.giveaway = {
      enabled: true,
      title: "Be the first to hear about new travel deals!",
      description: "Join our newsletter for member-only offers on tours, cruises, and transfers across Central Vietnam.",
      prizeText: "Sign up now for your chance to win a $500 Travel Voucher",
      ctaLabel: "Sign up",
      delaySeconds: 15,
      frequencyDays: 14
    };
  }
  if (!doc.generalFaqs || doc.generalFaqs.length === 0) {
    data.generalFaqs = [
      {
        question: "Do I need to pay when I book?",
        answer:
          "No. Every booking starts as a free inquiry — a team member confirms availability, pickup, and final price by WhatsApp or email before any payment."
      },
      {
        question: "Can I cancel or change my booking?",
        answer:
          "Yes. Most tours and transfers can be rescheduled or cancelled free of charge up to 24 hours before the start time. Partner tickets (shows, cruises) may have their own terms — we state them before you confirm."
      },
      {
        question: "Is hotel pickup included?",
        answer:
          "Most private tours and transfers include pickup in the Hoi An, Da Nang, and Hue areas. Look for the 'Pickup available' tag on the tour card, or ask us directly."
      },
      {
        question: "What payment methods do you accept?",
        answer: "Cash on the day, bank transfer, and major cards. Our team confirms the options with you when they confirm the booking."
      },
      {
        question: "What happens if it rains?",
        answer:
          "Central Vietnam showers are usually short. If weather makes an activity unsafe or pointless, we reschedule or refund — your guide decides together with you on the day."
      }
    ];
  }
  if (!doc.cancellationPolicy) {
    data.cancellationPolicy = lexicalParagraphs([
      "Every booking with TC Travel Vietnam starts as a free inquiry — no payment is taken until a team member confirms your plan, price, and pickup details.",
      "For confirmed tours and private transfers, you can reschedule or cancel free of charge up to 24 hours before the start time. Tell us as early as you can and we will rearrange everything on our side.",
      "Cruises, show tickets, and other partner-operated services may carry the partner's own cancellation terms. We always state these clearly before you confirm, so there are never surprises.",
      "If weather or safety conditions force us to cancel an activity, you choose between a full refund or a free rebooking.",
      "Questions about a specific booking? Message us on WhatsApp or email — a real person answers within 24 hours."
    ]);
  }

  if (Object.keys(data).length === 0) {
    console.log("~ site-settings giveaway/faqs/policy already set");
    return;
  }
  await payload.update({
    collection: "site-settings",
    id: doc.id,
    overrideAccess: true,
    disableTransaction: true,
    data: data as never
  });
  console.log(`+ site-settings updated: ${Object.keys(data).join(", ")}`);
}

async function seedDestinationHubData(payload: Payload): Promise<void> {
  const destinations = await payload.find({
    collection: "destinations",
    limit: 20,
    depth: 0,
    overrideAccess: true
  });
  const docs = destinations.docs as {
    id: number;
    title: string;
    slug: string;
    faqs?: unknown[] | null;
    nearbyDestinations?: unknown[] | null;
    themeChips?: unknown[] | null;
  }[];

  const chipCategories = await payload.find({
    collection: "product-categories",
    where: { type: { in: ["tour", "shared"] } },
    limit: 6,
    depth: 0,
    sort: "sortWeight",
    overrideAccess: true
  });
  const chipIds = (chipCategories.docs as { id: number }[]).map((category) => category.id);

  for (const destination of docs) {
    const data: Record<string, unknown> = {};

    if (!destination.faqs || destination.faqs.length === 0) {
      data.faqs = [
        {
          question: `What are the best tours in ${destination.title}?`,
          answer: `Our most-booked ${destination.title} experiences are the private day tours and small-group cultural walks listed above — every one is run or vetted by our local team, with hotel pickup on most options.`
        },
        {
          question: `What can I do in ${destination.title} with kids?`,
          answer: `Families usually pick the gentler options: countryside cycling, boat rides, cooking classes, and beach time. Message us on WhatsApp and we'll match the pace to your children's ages.`
        },
        {
          question: `What should I do in ${destination.title} on a rainy day?`,
          answer: `Rain in Central Vietnam is usually short. Cooking classes, museums, spa sessions, and covered-market food tours all work well — and guides reshuffle outdoor stops around the showers.`
        }
      ];
    }
    if ((!destination.nearbyDestinations || destination.nearbyDestinations.length === 0) && docs.length > 1) {
      data.nearbyDestinations = docs.filter((other) => other.id !== destination.id).slice(0, 3).map((other) => other.id);
    }
    if ((!destination.themeChips || destination.themeChips.length === 0) && chipIds.length > 0) {
      data.themeChips = chipIds;
    }

    if (Object.keys(data).length === 0) {
      console.log(`~ destination ${destination.slug} hub data already set`);
      continue;
    }
    await payload.update({
      collection: "destinations",
      id: destination.id,
      overrideAccess: true,
      disableTransaction: true,
      data: data as never
    });
    console.log(`+ destination ${destination.slug} hub data: ${Object.keys(data).join(", ")}`);
  }
}

async function seedNavigationLinks(payload: Payload): Promise<void> {
  const wanted = [
    { label: "Experiences", href: "/experiences" },
    { label: "FAQ", href: "/faq" },
    { label: "Cancellation Policy", href: "/cancellation-policy" }
  ];

  const navs = await payload.find({
    collection: "navigation",
    where: { location: { equals: "footer" } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const nav = navs.docs[0] as
    | { id: number; items?: { label: string; href?: string | null; children?: { label: string; href: string }[] | null }[] | null }
    | undefined;
  if (!nav) {
    console.log("! no footer navigation doc — add /experiences, /faq, /cancellation-policy links manually");
    return;
  }

  const items = [...(nav.items ?? [])];
  const allHrefs = new Set(
    items.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]).filter(Boolean)
  );
  const missing = wanted.filter((link) => !allHrefs.has(link.href));
  if (missing.length === 0) {
    console.log("~ footer navigation already has all links");
    return;
  }

  // Append missing links to the last column (or as top-level items when flat).
  const lastWithChildren = [...items].reverse().find((item) => (item.children ?? []).length > 0);
  if (lastWithChildren) {
    lastWithChildren.children = [...(lastWithChildren.children ?? []), ...missing.map((link) => ({ ...link, target: "_self" }))];
  } else {
    items.push(...missing.map((link) => ({ ...link, target: "_self" })));
  }

  await payload.update({
    collection: "navigation",
    id: nav.id,
    overrideAccess: true,
    disableTransaction: true,
    data: { items } as never
  });
  console.log(`+ footer navigation: added ${missing.map((link) => link.href).join(", ")}`);
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const experienceIds = await seedExperiences(payload);
  await seedDeals(payload);
  await seedPromotions(payload, experienceIds);
  await seedSiteSettings(payload);
  await seedDestinationHubData(payload);
  await seedNavigationLinks(payload);

  console.log("Done.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
