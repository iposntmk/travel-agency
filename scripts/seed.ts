import config from "../payload.config";
import { getPayload, type CollectionSlug, type Where } from "payload";

type SeedDoc = Record<string, unknown> & { id: number | string };

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

async function findOne(collection: CollectionSlug, where: Where): Promise<SeedDoc | null> {
  const result = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true });
  return (result.docs[0] as unknown as SeedDoc | undefined) ?? null;
}

async function upsertByField(
  collection: CollectionSlug,
  field: string,
  value: string,
  data: Record<string, unknown>
): Promise<SeedDoc> {
  const existing = await findOne(collection, { [field]: { equals: value } } as Where);
  if (existing) {
    const updated = await payload.update({
      collection,
      id: existing.id,
      data: data as never,
      overrideAccess: true,
      disableTransaction: true,
    });
    console.log(`~ ${collection}:${value}`);
    return updated as unknown as SeedDoc;
  }

  const created = await payload.create({
    collection,
    data: data as never,
    overrideAccess: true,
    disableTransaction: true,
  });
  console.log(`+ ${collection}:${value}`);
  return created as unknown as SeedDoc;
}

async function upsertBySlug(collection: CollectionSlug, data: Record<string, unknown> & { slug: string }) {
  return upsertByField(collection, "slug", data.slug, data);
}

async function upsertSiteSettings(data: Record<string, unknown>): Promise<SeedDoc> {
  const existing = await payload.find({ collection: "site-settings", limit: 1, depth: 0, overrideAccess: true });
  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: "site-settings",
      id: existing.docs[0].id,
      data: data as never,
      overrideAccess: true,
      disableTransaction: true,
    });
    console.log("~ site-settings");
    return updated as unknown as SeedDoc;
  }
  const created = await payload.create({
    collection: "site-settings",
    data: data as never,
    overrideAccess: true,
    disableTransaction: true,
  });
  console.log("+ site-settings");
  return created as unknown as SeedDoc;
}

async function deleteByField(collection: CollectionSlug, field: string, value: string): Promise<void> {
  const existing = await findOne(collection, { [field]: { equals: value } } as Where);
  if (!existing) return;
  await payload.delete({ collection, id: existing.id, overrideAccess: true, disableTransaction: true });
  console.log(`- ${collection}:${value}`);
}

async function main() {
  payload = await getPayload({ config });

  for (const comment of [
    "Friendly lantern walk and useful food recommendations after the tour.",
    "Thoughtful guide, calm pace, and excellent local context in Hoi An.",
    "Well organized Hue day trip with strong historical storytelling.",
  ]) {
    await deleteByField("reviews", "comment", comment);
  }

  const adminUser = await upsertByField("users", "email", "admin@tctravel.example", {
    email: "admin@tctravel.example",
    password: "ChangeMe-Seed-2026!",
    role: "admin",
  });

  const destinations: Record<string, SeedDoc> = {};
  for (const destination of [
    {
      title: "Hội An",
      slug: "hoi-an",
      region: "central",
      summary: "Lantern-lit ancient town, quiet craft villages, riverside food alleys, and countryside cycling routes.",
      bestTimeToVisit: "February to August for dry weather, golden afternoon light, and easy walking conditions.",
      hubIntro: richText("Hội An is the best base for first-time travellers who want a compact old town, gentle countryside, hands-on food experiences, and relaxed private guiding."),
      description: richText("Hội An pairs UNESCO heritage streets with river markets, craft villages, cooking classes, and nearby beaches. It works well for couples, families, food travellers, and guests who prefer easy-paced walking tours."),
      sortWeight: 10,
    },
    {
      title: "Huế",
      slug: "hue",
      region: "central",
      summary: "Imperial citadel, royal tombs, garden houses, Perfume River sunsets, and refined local cuisine.",
      bestTimeToVisit: "January to April for mild weather and September to November for quieter cultural touring.",
      hubIntro: richText("Huế is the cultural heart of Central Vietnam, best for travellers who care about history, architecture, royal food, and slower river-based itineraries."),
      description: richText("The former imperial capital gives visitors a layered view of Vietnam through citadels, pagodas, royal tombs, markets, and family-run kitchens."),
      sortWeight: 20,
    },
    {
      title: "Đà Nẵng",
      slug: "da-nang",
      region: "central",
      summary: "Beach city gateway with Sơn Trà nature, Marble Mountains, Bà Nà Hills, airport transfers, and day trips.",
      bestTimeToVisit: "March to August for beach weather, clear Sơn Trà views, and the best road-trip conditions.",
      hubIntro: richText("Đà Nẵng is the practical gateway for Central Vietnam with easy airport access, reliable private transfers, family-friendly beaches, and fast links to Hội An and Huế."),
      description: richText("Đà Nẵng works as a beach base, airport hub, and day-trip launch point for families, couples, and groups who want flexible transport and short activity days."),
      sortWeight: 30,
    },
    {
      title: "Quảng Trị",
      slug: "quang-tri",
      region: "central",
      summary: "DMZ heritage, Vĩnh Mốc tunnels, Hien Luong Bridge, memorial sites, and quiet coastal villages.",
      bestTimeToVisit: "January to August for drier roads and easier full-day heritage touring.",
      hubIntro: richText("Quảng Trị is for travellers who want a serious, respectful look at the former DMZ, wartime tunnel life, and modern memorial landscapes."),
      description: richText("Quảng Trị day trips connect Vĩnh Mốc Tunnels, Hien Luong Bridge, the ancient citadel, and rural coastal communities with careful historical context."),
      sortWeight: 40,
    },
  ]) {
    destinations[destination.slug] = await upsertBySlug("destinations", destination);
  }

  const categories: Record<string, SeedDoc> = {};
  for (const category of [
    ["culture", "Culture", "tour", 10],
    ["food", "Food", "tour", 20],
    ["family", "Family", "tour", 30],
    ["adventure", "Adventure", "tour", 40],
    ["free", "Free tours", "tour", 50],
    ["history", "History", "tour", 60],
    ["nature", "Nature", "tour", 70],
    ["transfer", "Private transfer", "car-rental", 10],
    ["popular", "Popular", "shared", 5],
    ["new", "New", "shared", 15],
  ] as const) {
    const [slug, title, type, sortWeight] = category;
    categories[slug] = await upsertBySlug("product-categories", { title, slug, type, sortWeight });
  }

  const attractions: Record<string, SeedDoc> = {};
  for (const attraction of [
    ["pho-co-hoi-an", "Hội An Ancient Town", "hoi-an", "UNESCO-listed merchant streets, lantern lanes, assembly halls, and riverside cafes.", ["culture"]],
    ["chua-cau-hoi-an", "Japanese Covered Bridge", "hoi-an", "The symbolic covered bridge at the heart of Hội An's old trading quarter.", ["culture", "history"]],
    ["tra-que-vegetable-village", "Tra Que Vegetable Village", "hoi-an", "A quiet farming village for cycling, herbs, cooking, and family-friendly countryside stops.", ["food", "family"]],
    ["dai-noi-hue", "Huế Imperial City", "hue", "Royal citadel complex with gates, palaces, temples, and Nguyễn dynasty stories.", ["culture", "history"]],
    ["chua-thien-mu", "Thiên Mụ Pagoda", "hue", "Riverside pagoda and one of Huế's most recognisable spiritual landmarks.", ["culture"]],
    ["lang-khai-dinh", "Khai Dinh Tomb", "hue", "Royal tomb blending Vietnamese, French, and mosaic design influences.", ["history"]],
    ["ba-na-hills", "Bà Nà Hills", "da-nang", "Mountain resort with cable car, Golden Bridge, gardens, and family attractions.", ["family", "popular"]],
    ["ngu-hanh-son", "Marble Mountains", "da-nang", "Limestone peaks, caves, pagodas, viewpoints, and stone-carving villages.", ["culture", "adventure"]],
    ["ban-dao-son-tra", "Sơn Trà Peninsula", "da-nang", "Coastal forest, ocean viewpoints, Linh Ung Pagoda, and wildlife habitat.", ["nature", "adventure"]],
    ["vinh-moc-tunnels", "Vĩnh Mốc Tunnels", "quang-tri", "Underground village where local families lived during wartime bombardment.", ["history"]],
    ["hien-luong-bridge", "Hien Luong Bridge", "quang-tri", "Historic bridge and river crossing at the former division line.", ["history"]],
    ["quang-tri-ancient-citadel", "Quảng Trị Ancient Citadel", "quang-tri", "Memorial citadel site in Quảng Trị town with strong historical significance.", ["history", "culture"]],
  ] as const) {
    const [slug, title, destinationSlug, summary, categorySlugs] = attraction;
    attractions[slug] = await upsertBySlug("attractions", {
      title,
      slug,
      destination: destinations[destinationSlug].id,
      summary,
      categories: categorySlugs.map((key) => categories[key].id),
      sortWeight: 50,
    });
  }

  const partners: Record<string, SeedDoc> = {};
  for (const partner of [
    {
      name: "Central Vietnam Guides Co.",
      partnerType: "tour-outsource",
      location: destinations["da-nang"].id,
      isFeatured: true,
      description: "Licensed local guide network for nature, DMZ, and overflow private guiding across Central Vietnam.",
      contactPerson: "Minh Tran",
      phone: "+84-236-555-0190",
      email: "guides@tctravel.example",
      rating: 4.7,
    },
    {
      name: "Hội An Wellness Spa",
      partnerType: "spa",
      location: destinations["hoi-an"].id,
      isFeatured: true,
      description: "Trusted add-on partner for post-tour massage, herbal foot baths, and wellness packages in Hội An.",
      contactPerson: "Huong Le",
      phone: "+84-235-555-0135",
      email: "spa@tctravel.example",
      inquiryFormUrl: "https://example.com/hoian-spa",
      rating: 4.8,
    },
    {
      name: "Da Nang Smile Dental",
      partnerType: "dental",
      location: destinations["da-nang"].id,
      isFeatured: false,
      description: "Dental check-up and cosmetic dentistry partner for longer-stay travellers.",
      contactPerson: "Thanh Nguyen",
      phone: "+84-236-555-0144",
      email: "dental@tctravel.example",
      inquiryFormUrl: "https://example.com/danang-dental",
      rating: 4.6,
    },
  ]) {
    partners[partner.name] = await upsertByField("partners", "name", partner.name, partner);
  }

  const tourSeeds = [
    ["hoi-an-private-heritage-walk", "Hội An Private Heritage Walk", "paid-private", "hoi-an", 45, ["culture", "popular"], ["pho-co-hoi-an", "chua-cau-hoi-an"], "Half day", "Private guide through merchant houses, assembly halls, lantern streets, and riverside coffee stops."],
    ["hoi-an-foodie-adventure", "Hội An Foodie Adventure", "paid-group", "hoi-an", 39, ["food", "popular"], ["pho-co-hoi-an", "tra-que-vegetable-village"], "Evening", "Small-group tasting route covering cao lầu, bánh mì, market snacks, and family-run dessert stalls."],
    ["free-hoi-an-lantern-walk", "Free Hội An Lantern Walk", "free-walking", "hoi-an", 0, ["free", "culture"], ["pho-co-hoi-an", "chua-cau-hoi-an"], "90 minutes", "Tip-based orientation walk through the lantern streets, night market, and riverside photo spots."],
    ["hue-imperial-small-group", "Huế Imperial Small Group Tour", "paid-group", "hue", 55, ["culture", "history"], ["dai-noi-hue", "chua-thien-mu", "lang-khai-dinh"], "Full day", "Citadel, royal tomb, pagoda, lunch, and Perfume River context with a small guided group."],
    ["hue-street-food-cyclo", "Huế Street Food by Cyclo", "paid-group", "hue", 42, ["food", "culture"], ["dai-noi-hue", "chua-thien-mu"], "3 hours", "Evening cyclo route for bánh bèo, bún bò Huế, chè, and market-side snacks."],
    ["hue-perfume-river-sunset", "Perfume River Sunset Cruise", "family", "hue", 35, ["family", "culture"], ["chua-thien-mu"], "2 hours", "Gentle sunset boat ride with pagoda stop, royal stories, and optional dinner transfer."],
    ["da-nang-ba-na-hills-golden-bridge", "Bà Nà Hills & Golden Bridge Day Trip", "family", "da-nang", 79, ["family", "popular"], ["ba-na-hills"], "Full day", "Private or small-group day trip with cable car logistics, Golden Bridge, gardens, and flexible return."],
    ["son-tra-nature-adventure", "Sơn Trà Nature Adventure", "adventure", "da-nang", 55, ["nature", "adventure"], ["ban-dao-son-tra"], "Half day", "Forest viewpoints, coastal roads, Linh Ung Pagoda, and wildlife-aware nature guiding."],
    ["da-nang-street-food-by-night", "Đà Nẵng Street Food by Night", "paid-group", "da-nang", 38, ["food", "popular"], ["ngu-hanh-son"], "3 hours", "Night market and local neighbourhood tasting route for seafood, mì Quảng, bánh xèo, and dessert."],
    ["quang-tri-dmz-heritage-day-trip", "Quảng Trị DMZ Heritage Day Trip", "cultural", "quang-tri", 59, ["history", "culture"], ["vinh-moc-tunnels", "hien-luong-bridge"], "Full day", "Respectful DMZ day trip linking tunnels, bridge, museum stops, and rural context."],
    ["vinh-moc-tunnels-coast-tour", "Vĩnh Mốc Tunnels & Coast Tour", "cultural", "quang-tri", 49, ["history", "family"], ["vinh-moc-tunnels", "hien-luong-bridge"], "Half day", "Focused tunnel visit with coastal village context and flexible pacing for families."],
    ["quang-tri-battlefield-memorials", "Quảng Trị Battlefield Memorials", "cultural", "quang-tri", 65, ["history", "culture"], ["quang-tri-ancient-citadel", "hien-luong-bridge"], "Full day", "Memorial-led itinerary for travellers who want deeper historical interpretation and quiet reflection."],
  ] as const;

  const tours: Record<string, SeedDoc> = {};
  for (let index = 0; index < tourSeeds.length; index += 1) {
    const [slug, title, tourType, destinationSlug, priceFrom, categorySlugs, attractionSlugs, durationText, routeSummary] = tourSeeds[index];
    tours[slug] = await upsertBySlug("tours", {
      title,
      slug,
      tourType,
      operationType: slug === "son-tra-nature-adventure" ? "partner" : "self-operated",
      partner: slug === "son-tra-nature-adventure" ? partners["Central Vietnam Guides Co."].id : undefined,
      destination: destinations[destinationSlug].id,
      status: "active",
      priceFrom,
      currency: "USD",
      minPax: priceFrom === 0 ? 1 : 2,
      currentPax: index % 3,
      durationDays: 1,
      durationText,
      groupSizeMax: tourType === "paid-private" ? 6 : 12,
      season: "year-round",
      isFeatured: index < 6,
      sortWeight: 100 - index,
      categories: categorySlugs.map((key) => categories[key].id),
      attractions: attractionSlugs.map((key) => attractions[key].id),
      addOns: destinationSlug === "hoi-an" ? [partners["Hội An Wellness Spa"].id] : [],
      routeSummary,
      ratingAverage: 3,
      ratingCount: 5,
      description: richText(`${routeSummary} This product is designed with clear pickup details, realistic pacing, local context, and a Book Now - Pay Later confirmation flow.`),
      itinerary: [
        { time: "08:00", activity: richText("Guide confirms pickup, guest names, pace, and any dietary or mobility notes.") },
        { time: "09:00", activity: richText(`Begin the main experience for ${title} with context before the busiest visitor window.`) },
        { time: "11:30", activity: richText("Short rest stop with water, local recommendations, and photo time.") },
        { time: "13:00", activity: richText("Wrap up with onward transport advice and optional add-on recommendations.") },
      ],
      pricingTiers: [
        { label: "Solo traveller", price: priceFrom === 0 ? 0 : priceFrom + 15, minPax: 1, maxPax: 1 },
        { label: "2 guests", price: priceFrom, minPax: 2, maxPax: 2 },
        { label: "Small group", price: Math.max(0, priceFrom - 8), minPax: 3, maxPax: 8 },
      ],
      availableDates: [
        { date: "2026-06-05T00:00:00Z" },
        { date: "2026-06-12T00:00:00Z" },
        { date: "2026-06-19T00:00:00Z" },
      ],
      seo: {
        metaTitle: `${title} | TC Travel Vietnam`,
        metaDescription: `${title} with local guides, realistic pacing, and pay-later booking.`,
      },
    });
  }

  const customers: SeedDoc[] = [];
  for (const customer of [
    ["Olivia Carter", "olivia.carter@example.com", "+1-415-555-0101", "US", "email"],
    ["Marcus Weber", "marcus.weber@example.com", "+49-30-555-0122", "DE", "whatsapp"],
    ["Sophie Martin", "sophie.martin@example.com", "+33-6-55-01-23-44", "FR", "whatsapp"],
    ["Nguyễn Văn An", "an.nguyen@example.com", "+84-903-111-222", "VN", "zalo"],
    ["Priya Nair", "priya.nair@example.com", "+91-98765-43210", "IN", "email"],
  ] as const) {
    const [name, email, phone, nationality, preferredContactChannel] = customer;
    customers.push(await upsertByField("customers", "email", email, { name, email, phone, nationality, preferredContactChannel }));
  }

  const reviewTemplates = [
    [1, "The guide was polite, but the pacing and pickup point did not match what our group expected."],
    [2, "Interesting stops, although the timing felt rushed and we would have liked clearer pre-trip notes."],
    [3, "A fair experience with useful local context and a few parts that could be smoother."],
    [4, "Well organised, easy to confirm by WhatsApp, and the guide added helpful local details."],
    [5, "Excellent day with warm guiding, practical pacing, and clear recommendations for the rest of our trip."],
  ] as const;

  for (const tour of Object.values(tours)) {
    for (const [index, review] of reviewTemplates.entries()) {
      const [rating, text] = review;
      const title = String(tour.title);
      await upsertByField("reviews", "comment", `${text} Tour: ${title}`, {
        customer: customers[index].id,
        tour: tour.id,
        rating,
        comment: `${text} Tour: ${title}`,
        status: "approved",
      });
    }
  }

  const posts: Record<string, SeedDoc> = {};
  const postSeeds = [
    ["guide-to-hoi-an-old-town", "The Ultimate Guide to Hội An's Old Town", "hoi-an", "hoi-an-private-heritage-walk", "do", 8],
    ["hoi-an-food-guide", "What to Eat in Hội An Before Your First Food Tour", "hoi-an", "hoi-an-foodie-adventure", "eat", 7],
    ["exploring-hue-imperial-city", "Exploring Huế Imperial City Without Rushing", "hue", "hue-imperial-small-group", "do", 9],
    ["da-nang-family-beach-guide", "A Practical Đà Nẵng Plan for Families", "da-nang", "da-nang-ba-na-hills-golden-bridge", "general", 6],
    ["quang-tri-dmz-travel-guide", "How to Visit the Quảng Trị DMZ Respectfully", "quang-tri", "quang-tri-dmz-heritage-day-trip", "before-trip", 8],
    ["book-now-pay-later-guide", "How Book Now - Pay Later Works With TC Travel", "hoi-an", "free-hoi-an-lantern-walk", "service", 4],
  ] as const;

  for (const [slug, title, destinationSlug, relatedTourSlug, guideCategory, readingTime] of postSeeds) {
    posts[slug] = await upsertBySlug("posts", {
      title,
      slug,
      status: "published",
      destination: destinations[destinationSlug].id,
      relatedTour: tours[relatedTourSlug].id,
      guideCategory,
      readingTime,
      featured: readingTime >= 7,
      sortWeight: readingTime * 10,
      tags: [{ tag: destinationSlug }, { tag: guideCategory }, { tag: "planning" }],
      content: richText(`${title} gives travellers practical context, realistic timing, booking advice, and local details before they commit to a tour or transfer.`),
      seo: {
        metaTitle: `${title} | TC Travel Vietnam`,
        metaDescription: `Planning notes for ${title.toLowerCase()} with TC Travel Vietnam.`,
        keywords: `${destinationSlug}, ${guideCategory}, travel guide`,
      },
    });
  }

  const postList = Object.values(posts);
  for (let index = 0; index < postList.length; index += 1) {
    const relatedPosts = [postList[(index + 1) % postList.length].id, postList[(index + 2) % postList.length].id];
    await payload.update({
      collection: "posts",
      id: postList[index].id,
      data: { relatedPosts } as never,
      overrideAccess: true,
      disableTransaction: true,
    });
  }

  for (const post of postList) {
    for (const comment of [
      "This helped me choose the right base city before booking.",
      "Useful timing notes. I would add that WhatsApp confirmation is easiest for travellers already in Vietnam.",
      "Clear guide, especially the section on what to do before the tour day.",
    ]) {
      await upsertByField("comments", "content", `${comment} Article: ${post.title}`, {
        author: adminUser.id,
        target: { relationTo: "posts", value: post.id },
        content: `${comment} Article: ${post.title}`,
        status: "approved",
      });
    }
  }

  for (const rental of [
    ["da-nang-hoi-an-sedan", "Đà Nẵng to Hội An Sedan Transfer", "da-nang", "Đà Nẵng", "Hội An", "sedan", 25, "45 minutes"],
    ["da-nang-hue-suv", "Đà Nẵng to Huế SUV Transfer", "da-nang", "Đà Nẵng", "Huế", "suv", 65, "2.5 hours via Hải Vân Pass"],
    ["da-nang-airport-minibus", "Đà Nẵng Airport Minibus Transfer", "da-nang", "Đà Nẵng Airport", "City hotel", "minibus", 15, "30 minutes"],
    ["hue-quang-tri-dmz-private-car", "Huế to Quảng Trị DMZ Private Car", "quang-tri", "Huế", "Quảng Trị DMZ", "sedan", 55, "2 hours one way"],
    ["hoi-an-ba-na-hills-day-car", "Hội An to Bà Nà Hills Day Car", "hoi-an", "Hội An", "Bà Nà Hills", "van", 70, "Full day standby"],
  ] as const) {
    const [slug, title, destinationSlug, routeFrom, routeTo, vehicleType, priceFrom, durationText] = rental;
    await upsertBySlug("car-rentals", {
      title,
      slug,
      destination: destinations[destinationSlug].id,
      routeFrom,
      routeTo,
      vehicleType,
      durationText,
      priceFrom,
      currency: "USD",
      status: "active",
      partner: partners["Central Vietnam Guides Co."].id,
      seo: { metaTitle: `${title} | TC Travel Vietnam`, metaDescription: `Private ${routeFrom} to ${routeTo} transfer.` },
    });
  }

  for (const member of [
    ["An Nguyen", "Founder & Trip Designer", "Builds practical Central Vietnam itineraries around realistic travel days, not brochure timing.", 10],
    ["Minh Tran", "Head Guide", "Trains guides to balance storytelling, guest pace, and respectful local context.", 20],
    ["Huong Le", "Guest Care Lead", "Handles WhatsApp confirmation, special requests, and pay-later booking details.", 30],
    ["Linh Pham", "Operations Coordinator", "Keeps drivers, guides, and partner services aligned before each departure.", 40],
  ] as const) {
    const [name, role, quote, sortWeight] = member;
    await upsertByField("team-members", "name", name, { name, role, quote, sortWeight, status: "published", isPublished: true });
  }

  await upsertSiteSettings({
    name: "TC Travel Vietnam",
    hotline: "+84-236-555-0100",
    whatsapp: "+84-903-111-222",
    salesEmail: "hello@tctravel.example",
    footer: {
      companyName: "TC Travel Vietnam Co., Ltd.",
      legalText: "Licensed local travel operator for private tours, free walking tours, transfers, and tailor-made Central Vietnam trips.",
      address: "Da Nang, Vietnam",
    },
    trust: {
      reviewAverage: 4.8,
      reviewCount: 1250,
      summary: "Local team, clear pay-later booking, and verified traveller feedback across tours and transfers.",
    },
  });

  const now = new Date().toISOString();
  for (const booking of [
    ["seed-booking-pending-001", "hoi-an-foodie-adventure", customers[0].id, "Pending", "2026-06-15", 2],
    ["seed-booking-confirmed-002", "hue-imperial-small-group", customers[1].id, "Confirmed - Pay Later", "2026-07-01", 3],
    ["seed-booking-paid-003", "da-nang-ba-na-hills-golden-bridge", customers[2].id, "Confirmed - Paid", "2026-07-12", 4],
    ["seed-booking-completed-004", "hoi-an-private-heritage-walk", customers[3].id, "Completed", "2026-05-10", 1],
    ["seed-booking-cancelled-005", "quang-tri-dmz-heritage-day-trip", customers[4].id, "Cancelled", "2026-08-05", 2],
  ] as const) {
    const [idempotencyKey, tourSlug, customer, status, preferredDate, numPax] = booking;
    await upsertByField("bookings", "idempotencyKey", idempotencyKey, {
      tour: tours[tourSlug].id,
      customer,
      numPax,
      preferredDate,
      status,
      idempotencyKey,
      source: "direct",
      contactChannel: "whatsapp",
      specialRequest: "Seeded booking used for operations QA and public booking flow checks.",
      statusHistory: [{ from: "New", to: "Pending", actor: "seed-script", source: "server-action", createdAt: now }],
    });
  }

  for (const inquiry of [
    ["seed-inquiry-family-001", "David Johnson", "david.johnson@example.com", ["hoi-an", "da-nang"], "family"],
    ["seed-inquiry-couple-002", "Sophie Laurent", "sophie.laurent@example.com", ["hue", "quang-tri"], "couple"],
    ["seed-inquiry-friends-003", "Kenji Sato", "kenji.sato@example.com", ["da-nang", "hoi-an"], "friends"],
  ] as const) {
    const [idempotencyKey, customerName, email, destinationSlugs, accompanimentType] = inquiry;
    await upsertByField("custom-inquiries", "idempotencyKey", idempotencyKey, {
      customerName,
      email,
      phone: "+84-903-555-0100",
      adults: accompanimentType === "family" ? 2 : 4,
      children: accompanimentType === "family" ? 2 : 0,
      exactDatesKnown: false,
      departureMonth: "September 2026",
      estimatedDays: 6,
      accommodationLevels: [{ value: "4-star" }],
      themes: [{ value: "cultural" }, { value: "food" }],
      accompanimentType,
      budgetPerPerson: 180,
      selectedDestinations: destinationSlugs.map((slug) => destinations[slug].id),
      message: "Please suggest a realistic private itinerary with guides, transfers, and one flexible rest day.",
      source: "free-proposal",
      status: accompanimentType === "couple" ? "quoted" : "new",
      idempotencyKey,
    });
  }

  await upsertByField("promotions", "code", "SUMMER2026", {
    name: "Summer 2026 Group Offer",
    code: "SUMMER2026",
    description: "15% off selected group tours for travel between June and August 2026.",
    discountType: "percentage",
    discountValue: 15,
    applicableTours: [tours["hoi-an-foodie-adventure"].id, tours["da-nang-street-food-by-night"].id],
    applicableMarkets: ["EU", "US", "AU"],
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-08-31T00:00:00Z",
    season: "summer",
  });
  await upsertByField("promotions", "code", "EARLYBIRD10", {
    name: "Early Bird Pay Later",
    code: "EARLYBIRD10",
    description: "10% off selected private tours booked at least 30 days before travel.",
    discountType: "percentage",
    discountValue: 10,
    applicableTours: [tours["hoi-an-private-heritage-walk"].id, tours["hue-imperial-small-group"].id],
    applicableMarkets: ["EU", "US", "AU", "Asia"],
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-12-31T00:00:00Z",
    season: "year-round",
  });

  const completedBooking = await findOne("bookings", { idempotencyKey: { equals: "seed-booking-completed-004" } } as Where);
  const paidBooking = await findOne("bookings", { idempotencyKey: { equals: "seed-booking-paid-003" } } as Where);
  if (completedBooking) {
    await upsertByField("payments", "providerPaymentId", "VIRTUAL-BT-SEED-001", {
      booking: completedBooking.id,
      amount: 45,
      currency: "USD",
      paymentMethod: "bank-transfer",
      status: "completed",
      providerPaymentId: "VIRTUAL-BT-SEED-001",
      metadata: { seeded: true, note: "Completed seed booking payment" },
    });
  }
  if (paidBooking) {
    await upsertByField("payments", "providerPaymentId", "VIRTUAL-CASH-SEED-002", {
      booking: paidBooking.id,
      amount: 316,
      currency: "USD",
      paymentMethod: "cash",
      status: "completed",
      providerPaymentId: "VIRTUAL-CASH-SEED-002",
      metadata: { seeded: true, note: "Paid seed booking" },
    });
  }

  console.log("\nSeed/backfill complete.");
  console.log(`Tours: ${Object.keys(tours).length}; reviews: ${Object.keys(tours).length * 5}; posts: ${postList.length}; blog comments: ${postList.length * 3}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
