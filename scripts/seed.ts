import config from "../payload.config";
import { getPayload } from "payload";

// Minimal valid Lexical richText structure — typed as `any` to avoid verbose Lexical type gymnastics in seed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const richText = (text: string): any => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        version: 1,
        children: [{ type: "text", version: 1, text }],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  },
});

let payload: Awaited<ReturnType<typeof getPayload>>;

async function main() {
  payload = await getPayload({ config });

  const { totalDocs } = await payload.find({ collection: "destinations", limit: 1 });
  if (totalDocs > 0) {
    console.log("Already seeded. Drop the database and re-run to reseed.");
    process.exit(0);
  }

  // 1. Destinations
  const [hoiAn, hue, danang] = await Promise.all([
    payload.create({ collection: "destinations", data: { title: "Hội An", slug: "hoi-an", region: "central" } }),
    payload.create({ collection: "destinations", data: { title: "Huế", slug: "hue", region: "central" } }),
    payload.create({ collection: "destinations", data: { title: "Đà Nẵng", slug: "da-nang", region: "central" } }),
  ]);
  console.log("✓ Destinations");

  // 2. Partners
  const [partnerGuides, partnerSpa] = await Promise.all([
    payload.create({
      collection: "partners",
      data: {
        name: "Central Vietnam Guides Co.",
        partnerType: "tour-outsource",
        location: danang.id,
        isFeatured: true,
        description: "Local specialist for adventure and nature tours around Đà Nẵng and Sơn Trà.",
      },
    }),
    payload.create({
      collection: "partners",
      data: {
        name: "Hội An Wellness Spa",
        partnerType: "spa",
        location: hoiAn.id,
        isFeatured: true,
        description: "Premium wellness and traditional Vietnamese massage in the heart of the old town.",
        inquiryFormUrl: "https://example.com/hoian-spa-inquiry",
      },
    }),
  ]);
  console.log("✓ Partners");

  // 3. Tours
  const [tour1, tour2, tour3] = await Promise.all([
    payload.create({
      collection: "tours",
      data: {
        title: "Hội An Private Heritage Walk",
        slug: "hoi-an-private-heritage-walk",
        tourType: "paid-private",
        operationType: "self-operated",
        destination: hoiAn.id,
        status: "active",
        priceFrom: 45,
        currency: "USD",
        minPax: 1,
        currentPax: 0,
        season: "year-round",
        description: richText("A private guided walk through Hội An's UNESCO-listed ancient town, covering the Japanese Covered Bridge, merchant houses, and local silk workshops."),
      },
    }),
    payload.create({
      collection: "tours",
      data: {
        title: "Huế Imperial Small Group Tour",
        slug: "hue-imperial-small-group",
        tourType: "paid-group",
        operationType: "self-operated",
        destination: hue.id,
        status: "active",
        priceFrom: 35,
        currency: "USD",
        minPax: 4,
        currentPax: 2,
        season: "winter",
        description: richText("Explore Huế's imperial citadel, royal tombs, and Thiên Mụ Pagoda with a small group of up to 8 guests."),
        pricingTiers: [
          { label: "Group (4–8 pax)", price: 35 },
          { label: "Semi-Private (2–3 pax)", price: 50 },
        ],
      },
    }),
    payload.create({
      collection: "tours",
      data: {
        title: "Free Hội An Lantern Walk",
        slug: "free-hoi-an-lantern-walk",
        tourType: "free-walking",
        operationType: "self-operated",
        destination: hoiAn.id,
        status: "active",
        priceFrom: 0,
        currency: "USD",
        minPax: 1,
        currentPax: 0,
        season: "year-round",
        isFeaturedInSeason: true,
        description: richText("A free evening walk through the lantern-lit old town, ending at the riverfront for the monthly full-moon festival. Tips welcome."),
      },
    }),
    payload.create({
      collection: "tours",
      data: {
        title: "Sơn Trà Nature Adventure",
        slug: "son-tra-nature-adventure",
        tourType: "adventure",
        operationType: "partner",
        partner: partnerGuides.id,
        destination: danang.id,
        status: "active",
        priceFrom: 55,
        currency: "USD",
        minPax: 2,
        currentPax: 0,
        season: "summer",
        description: richText("Half-day trek through the jungle of Sơn Trà Peninsula. Spot red-shanked douc langurs and enjoy panoramic views of Đà Nẵng Bay."),
        addOns: [partnerSpa.id],
      },
    }),
  ]);
  console.log("✓ Tours");

  // 4. Customer
  const customer = await payload.create({
    collection: "customers",
    data: {
      name: "Alex Nguyen",
      email: "alex.test@example.com",
      phone: "+1-555-0100",
      nationality: "US",
      preferredContactChannel: "email",
    },
  });
  console.log("✓ Customer");

  const now = new Date().toISOString();

  // 5. Bookings — Pending / Confirmed-Pay-Later / Completed
  await Promise.all([
    payload.create({
      collection: "bookings",
      data: {
        tour: tour1.id,
        customer: customer.id,
        numPax: 2,
        preferredDate: "2026-11-15",
        status: "Pending",
        idempotencyKey: "seed-booking-001",
        source: "direct",
        contactChannel: "email",
        statusHistory: [{ from: "New", to: "Pending", actor: "seed-script", source: "server-action", createdAt: now }],
      },
    }),
    payload.create({
      collection: "bookings",
      data: {
        tour: tour2.id,
        customer: customer.id,
        numPax: 4,
        preferredDate: "2026-12-01",
        status: "Confirmed - Pay Later",
        idempotencyKey: "seed-booking-002",
        source: "direct",
        contactChannel: "whatsapp",
        statusHistory: [
          { from: "New", to: "Pending", actor: "seed-script", source: "server-action", createdAt: now },
          { from: "Pending", to: "Confirmed - Pay Later", actor: "staff@example.com", source: "admin", createdAt: now },
        ],
      },
    }),
    payload.create({
      collection: "bookings",
      data: {
        tour: tour3.id,
        customer: customer.id,
        numPax: 1,
        preferredDate: "2026-10-20",
        status: "Completed",
        idempotencyKey: "seed-booking-003",
        source: "direct",
        contactChannel: "email",
        statusHistory: [
          { from: "New", to: "Pending", actor: "seed-script", source: "server-action", createdAt: now },
          { from: "Pending", to: "Confirmed - Pay Later", actor: "staff@example.com", source: "admin", createdAt: now },
          { from: "Confirmed - Pay Later", to: "Confirmed - Paid", actor: "staff@example.com", source: "admin", createdAt: now },
          { from: "Confirmed - Paid", to: "Completed", actor: "staff@example.com", source: "admin", createdAt: now },
        ],
      },
    }),
  ]);
  console.log("✓ Bookings");

  // 6. Posts
  await Promise.all([
    payload.create({
      collection: "posts",
      data: {
        title: "The Ultimate Guide to Hội An's Old Town",
        slug: "guide-to-hoi-an-old-town",
        status: "published",
        destination: hoiAn.id,
        relatedTour: tour1.id,
        featured: true,
        readingTime: 8,
        content: richText("Hội An's ancient town is a UNESCO World Heritage Site brimming with history, culture, and lantern-lit charm. Walk the narrow streets lined with merchant houses, tailor shops, and lantern workshops."),
        seo: {
          metaTitle: "Ultimate Guide to Hội An Old Town | VietNam Travel",
          metaDescription: "Discover the magic of Hội An's UNESCO-listed ancient town with tips on what to see, where to eat, and how to avoid the crowds.",
        },
      },
    }),
    payload.create({
      collection: "posts",
      data: {
        title: "Exploring Huế Imperial City",
        slug: "exploring-hue-imperial-city",
        status: "published",
        destination: hue.id,
        relatedTour: tour2.id,
        featured: false,
        readingTime: 6,
        content: richText("Step back in time at Huế's majestic imperial citadel, once the seat of the Nguyễn dynasty. Explore royal tombs, pavilions, and the serene Perfume River."),
        seo: {
          metaTitle: "Exploring Huế Imperial City | VietNam Travel",
          metaDescription: "Plan your visit to Huế's Imperial City with our guide to the best royal tombs, temples, and local cuisine.",
        },
      },
    }),
  ]);
  console.log("✓ Posts");

  console.log("\n✅ Seed complete — 3 destinations, 2 partners, 4 tours, 1 customer, 3 bookings, 2 posts.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
