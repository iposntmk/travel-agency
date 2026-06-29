import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from "../payload.config";
import { getPayload, type CollectionSlug, type Where } from "payload";
import { destinationSeeds, destinationImageMap } from "./seed-data/destinations";
import { blogSeeds } from "./seed-data/blog-posts";
import { provincePostSeeds } from "./seed-data/province-posts";

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

async function getR2Client(): Promise<{ client: S3Client; bucket: string; publicUrl: string }> {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucket = process.env.R2_BUCKET!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const publicUrl = process.env.R2_PUBLIC_URL!;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket, publicUrl };
}

async function seedImage(
  group: string,
  slug: string,
  localImagePath: string,
  alt: string
): Promise<SeedDoc | null> {
  const absPath = path.resolve(localImagePath);
  if (!fs.existsSync(absPath)) {
    console.log(`! image not found: ${absPath}`);
    return null;
  }
  const buffer = fs.readFileSync(absPath);
  const ext = path.extname(absPath).replace(".", "");
  const mimeType = ext === "webp" ? "image/webp" : `image/${ext}`;
  const filename = path.basename(absPath);
  const now = new Date();
  const r2Key = `originals/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${group}/${slug}/${filename}`;

  const { client: s3Client, bucket, publicUrl: r2PublicBase } = await getR2Client();
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: r2Key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000, immutable",
  });
  await s3Client.send(cmd);
  const publicUrl = `${r2PublicBase}/${r2Key}`;
  console.log(`  -> uploaded ${r2Key}`);

  const existing = await findOne("media", { alt: { equals: alt } } as Where);
  let mediaId: number | string;
  if (existing) {
    // filename/mimeType/filesize are Payload upload-managed fields and cannot be
    // set via update without a `file` (ValidationError: field is invalid: filename).
    // The R2 object is (re)uploaded above; only refresh the safe + custom fields.
    const updated = await payload.update({
      collection: "media",
      id: existing.id,
      data: { alt, status: "ready", r2Key, publicUrl } as never,
      overrideAccess: true,
      disableTransaction: true,
    });
    mediaId = updated.id;
    console.log(`~ media:${alt}`);
  } else {
    const created = await payload.create({
      collection: "media",
      data: { alt, filename, mimeType, filesize: buffer.length, status: "ready", r2Key, publicUrl } as never,
      file: { data: buffer, mimetype: mimeType, name: filename, size: buffer.length },
      overrideAccess: true,
      disableTransaction: true,
    });
    mediaId = created.id;
    console.log(`+ media:${alt}`);
  }

  return { id: mediaId } as SeedDoc;
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
  for (const dest of destinationSeeds) {
    const { imageFile: _imageFile, imageAlt: _alt, ...destData } = dest;
    destinations[dest.slug] = await upsertBySlug("destinations", {
      ...destData,
      hubIntro: richText(destData.hubIntro),
      description: richText(destData.description),
    });
  }

  const imagesDir = path.resolve("public/images/destinations");
  const galleryMedia: { id: number | string; caption: string }[] = [];
  for (const [slug, img] of Object.entries(destinationImageMap)) {
    const dest = destinations[slug];
    if (!dest) continue;
    const media = await seedImage("destinations", slug, path.join(imagesDir, img.file), img.alt);
    if (media) {
      await payload.update({
        collection: "destinations",
        id: dest.id,
        data: { heroImage: media.id, featuredImage: media.id } as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`  -> linked ${slug} heroImage + featuredImage`);
      if (galleryMedia.length < 6) galleryMedia.push({ id: media.id, caption: img.alt });
    }
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

  // Per-tour rich content overrides (izitour-style tour detail). Keyed by slug.
  const tourEnrichments: Record<string, Record<string, unknown>> = {
    "hue-perfume-river-sunset": {
      durationText: "2 hours",
      routeSummary: "Toa Kham Pier → Thien Mu Pagoda → Perfume River → city centre",
      startEnd: "Huế city centre / Huế city centre",
      travelStyle: "Relaxed · Family-friendly · Cultural",
      guideLanguages: "English, French",
      highlightIntro:
        "Drift along the legendary Perfume River as the sun sets behind the imperial city. A gentle dragon-boat ride pairs golden-hour views with royal stories, a riverside pagoda stop, and an unhurried pace that suits families and couples alike.",
      highlights: [
        { title: "Sunset on the Perfume River", description: "Golden-hour cruise past the Citadel walls and riverside life" },
        { title: "Thien Mu Pagoda", description: "Step ashore at Huế's iconic seven-storey pagoda" },
        { title: "Royal storytelling", description: "Local guide shares Nguyễn-dynasty history along the way" },
        { title: "Traditional dragon boat", description: "Privately chartered hand-painted Huế dragon boat" },
        { title: "Optional dinner transfer", description: "Seamless drop-off to a riverside restaurant of your choice" },
      ],
      inclusions: [
        { item: "Private hand-painted dragon boat charter (2 hours)" },
        { item: "Licensed English/French-speaking guide" },
        { item: "Thien Mu Pagoda entrance and guided stop" },
        { item: "Bottled water and cool towels on board" },
        { item: "Hotel pickup and drop-off within Huế city" },
      ],
      exclusions: [
        { item: "Dinner and personal expenses" },
        { item: "Gratuities (optional)" },
        { item: "Travel insurance" },
      ],
      itinerary: [
        {
          time: "16:00",
          location: "Hotel pickup · Huế city centre",
          title: "Meet your guide",
          activity: richText("Your guide meets you at your hotel lobby, confirms pace and any mobility notes, then transfers you the short distance to Toa Kham Pier."),
          included: [{ item: "Hotel pickup" }, { item: "Private transfer" }],
        },
        {
          time: "16:20",
          location: "Toa Kham Pier · board the dragon boat",
          distance: "5 min from city centre",
          title: "Set sail on the Perfume River",
          activity: richText("Board your privately chartered dragon boat and begin gliding upstream. Settle in with a cool towel and water as the guide introduces the river's royal history."),
          included: [{ item: "Dragon boat charter" }, { item: "Water & cool towel" }],
        },
        {
          time: "16:50",
          location: "Thien Mu Pagoda",
          distance: "≈ 4 km upstream",
          title: "Riverside pagoda stop",
          activity: richText("Step ashore to explore Thien Mu Pagoda, Huế's seven-storey icon, with time for photos and the stories behind its famous bell and gardens."),
          note: "Modest dress recommended (shoulders and knees covered).",
          included: [{ item: "Entrance & guided visit" }],
        },
        {
          time: "17:40",
          location: "Sunset cruise back to the city",
          title: "Golden hour on the water",
          activity: richText("Reboard and drift back downstream as the sun sets behind the Citadel. Watch riverside life and floating temples glow in the evening light."),
        },
        {
          time: "18:15",
          location: "Disembark · optional dinner transfer",
          title: "End of cruise",
          activity: richText("Return to the pier and transfer back to your hotel, or ask to be dropped at a riverside restaurant for dinner."),
          included: [{ item: "Drop-off in Huế city" }],
        },
      ],
    },
  };

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
      ...(tourEnrichments[slug] ?? {}),
    });
  }

  // Link real images (featuredImage + gallery + route map) to enriched tours.
  const toursImagesDir = path.resolve("public/images/tours");
  const tourImageMap: Record<string, { gallery: { file: string; alt: string }[]; map?: { file: string; alt: string } }> = {
    "hue-perfume-river-sunset": {
      gallery: [
        { file: "hue-thanh-tien-village-2.webp", alt: "Sunset dragon boat on the Perfume River in Huế" },
        { file: "hue-dai-noi-2.webp", alt: "Huế Imperial Citadel seen from the Perfume River" },
        { file: "hue-thanh-tien-village-1.webp", alt: "Traditional craft village along the Perfume River, Huế" },
        { file: "hue-thuy-bieu-village-2.webp", alt: "Riverside village life near Huế at dusk" },
        { file: "hue-khai-dinh-mausoleum-1.webp", alt: "Royal Nguyễn-dynasty architecture in Huế" },
      ],
      map: { file: "hue-dai-noi-2.webp", alt: "Perfume River sunset cruise route map" },
    },
  };

  for (const [slug, imgs] of Object.entries(tourImageMap)) {
    const tour = tours[slug];
    if (!tour) continue;
    const galleryIds: (number | string)[] = [];
    for (const g of imgs.gallery) {
      const media = await seedImage("tours", slug, path.join(toursImagesDir, g.file), g.alt);
      if (media) galleryIds.push(media.id);
    }
    const mapMedia = imgs.map
      ? await seedImage("tours", slug, path.join(toursImagesDir, imgs.map.file), imgs.map.alt)
      : null;
    if (galleryIds.length > 0 || mapMedia) {
      await payload.update({
        collection: "tours",
        id: tour.id,
        data: {
          ...(galleryIds.length > 0 ? { featuredImage: galleryIds[0], gallery: galleryIds } : {}),
          ...(mapMedia ? { mapImage: mapMedia.id } : {}),
        } as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`  -> linked ${slug} featuredImage + gallery(${galleryIds.length})${mapMedia ? " + map" : ""}`);
    }
  }

  const cruiseSeeds = [
    ["lan-ha-bay-overnight-cruise", "Lan Hạ Bay Overnight Cruise", "da-nang", 1, "2 days · 1 night", "Karst islands, kayaking, sunset deck, and an overnight cabin away from the crowds.", 180],
    ["mekong-delta-luxury-cruise", "Mekong Delta Luxury Cruise", "hue", 2, "3 days · 2 nights", "Slow river journey through floating markets, orchards, and riverside villages.", 320],
    ["perfume-river-heritage-cruise", "Perfume River Heritage Cruise", "hue", 1, "2 days · 1 night", "Royal tombs, riverside pagodas, and Huế imperial context from the water.", 150],
  ] as const;

  const cruises: Record<string, SeedDoc> = {};
  for (let index = 0; index < cruiseSeeds.length; index += 1) {
    const [slug, title, destinationSlug, nights, durationText, routeSummary, priceFrom] = cruiseSeeds[index];
    cruises[slug] = await upsertBySlug("cruises", {
      title,
      slug,
      destination: destinations[destinationSlug].id,
      status: "active",
      nights,
      durationText,
      routeSummary,
      priceFrom,
      currency: "USD",
      isFeatured: index < 3,
      sortWeight: 100 - index,
      ratingAverage: 5,
      ratingCount: 8,
      description: richText(`${routeSummary} Cabins, meals, and onboard activities are confirmed with a Book Now - Pay Later inquiry flow.`),
      cabinTypes: [
        { label: "Deluxe cabin", price: priceFrom, maxPax: 2 },
        { label: "Suite cabin", price: priceFrom + 90, maxPax: 2 },
      ],
      itinerary: [
        { time: "Day 1 · 12:00", activity: richText("Board, welcome lunch, and cabin check-in as the cruise departs.") },
        { time: "Day 1 · 16:00", activity: richText(`Afternoon activities and scenery for ${title}, then sunset on the deck.`) },
        { time: "Day 2 · 07:00", activity: richText("Morning excursion, brunch, and return transfer briefing.") },
      ],
      seo: {
        metaTitle: `${title} | TC Travel Vietnam`,
        metaDescription: `${title} with cabins, meals, and pay-later booking.`,
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
    ["guide-to-hoi-an-old-town", "The Ultimate Guide to Hội An's Old Town", "hoi-an", "hoi-an-private-heritage-walk", "do", 8, "Ngoc Tu Dinh", 1243, 2],
    ["hoi-an-food-guide", "What to Eat in Hội An Before Your First Food Tour", "hoi-an", "hoi-an-foodie-adventure", "eat", 7, "Kayla Le", 836, 0],
    ["exploring-hue-imperial-city", "Exploring Huế Imperial City Without Rushing", "hue", "hue-imperial-small-group", "do", 9, "Ngoc Tu Dinh", 2105, 1],
    ["da-nang-family-beach-guide", "A Practical Đà Nẵng Plan for Families", "da-nang", "da-nang-ba-na-hills-golden-bridge", "general", 6, "Tracy Tran", 567, 0],
    ["quang-tri-dmz-travel-guide", "How to Visit the Quảng Trị DMZ Respectfully", "quang-tri", "quang-tri-dmz-heritage-day-trip", "before-trip", 8, "Ngoc Tu Dinh", 934, 3],
    ["book-now-pay-later-guide", "How Book Now - Pay Later Works With TC Travel", "hoi-an", "free-hoi-an-lantern-walk", "service", 4, "Jazmine Tran", 412, 0],
  ] as const;

  for (const [slug, title, destinationSlug, relatedTourSlug, guideCategory, readingTime, author, viewCount, updateCount] of postSeeds) {
    posts[slug] = await upsertBySlug("posts", {
      title,
      slug,
      status: "published",
      destination: destinations[destinationSlug].id,
      relatedTour: tours[relatedTourSlug].id,
      guideCategory,
      readingTime,
      author,
      viewCount,
      updateCount,
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

  // Link real featuredImage to each blog post (previously unseeded → fallback gradient).
  // Reuse existing local assets; r2Key is namespaced by post slug, so identical
  // source files still upload to distinct keys / media docs per post.
  const destImagesDir = path.resolve("public/images/destinations");
  const postImagesDir = { destinations: destImagesDir, tours: toursImagesDir } as const;
  const postImageMap: Record<string, { dir: keyof typeof postImagesDir; file: string; alt: string }> = {
    "guide-to-hoi-an-old-town": { dir: "destinations", file: "hoian2.webp", alt: "Hội An ancient town lantern streets at dusk" },
    "hoi-an-food-guide": { dir: "tours", file: "hue-thuy-bieu-village-2.webp", alt: "Riverside food and village life in Central Vietnam" },
    "exploring-hue-imperial-city": { dir: "tours", file: "hue-dai-noi-2.webp", alt: "Huế Imperial Citadel and Perfume River" },
    "da-nang-family-beach-guide": { dir: "destinations", file: "dest-6.webp", alt: "Central Vietnam coastal town scenery near Đà Nẵng" },
    "quang-tri-dmz-travel-guide": { dir: "tours", file: "hue-khai-dinh-mausoleum-1.webp", alt: "Historic memorial architecture in Central Vietnam" },
    "book-now-pay-later-guide": { dir: "destinations", file: "hoian2.webp", alt: "Planning a Central Vietnam trip in Hội An" },
  };

  for (const [slug, img] of Object.entries(postImageMap)) {
    const post = posts[slug];
    if (!post) continue;
    const media = await seedImage("posts", slug, path.join(postImagesDir[img.dir], img.file), img.alt);
    if (media) {
      await payload.update({
        collection: "posts",
        id: post.id,
        data: { featuredImage: media.id } as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`  -> linked ${slug} featuredImage`);
    }
  }

  // ── VM Travel scraped blog posts (from https://vmtravel.com.vn/blog/) ──
  // These are seeded as published posts with auto-generated content from scraped data.
  const destinationSlugToId: Record<string, number | string> = {};
  for (const [slug, doc] of Object.entries(destinations)) {
    destinationSlugToId[slug] = doc.id;
  }

  // Skip blogSeeds that have enriched versions in provincePostSeeds
  const enrichedSlugs = new Set(provincePostSeeds.map((p) => p.slug));
  const filteredBlogSeeds = blogSeeds.filter((s) => !enrichedSlugs.has(s.slug));

  for (const seed of filteredBlogSeeds) {
    const destId = seed.destinationHint && seed.destinationHint in destinationSlugToId
      ? destinationSlugToId[seed.destinationHint]
      : undefined;
    await upsertBySlug("posts", {
      title: seed.title,
      slug: seed.slug,
      status: "published",
      destination: destId,
      guideCategory: seed.guideCategory,
      readingTime: seed.readingTime,
      author: seed.author,
      viewCount: seed.viewCount,
      updateCount: seed.updateCount,
      featured: seed.readingTime >= 8,
      sortWeight: seed.readingTime * 10,
      tags: [
        { tag: seed.destinationHint || "vietnam" },
        { tag: seed.guideCategory },
        { tag: "travel-guide" },
      ],
      content: richText(`${seed.title}\n\n${seed.excerpt}\n\nThis article is adapted from VM Travel (vmtravel.com.vn) for reference and expanded content.`),
      seo: {
        metaTitle: `${seed.title} | TC Travel Vietnam`,
        metaDescription: seed.excerpt.substring(0, 160),
        keywords: `${seed.destinationHint || "vietnam"}, ${seed.guideCategory}, travel guide`,
      },
    });
  }

  // ── Enriched province posts (full rich content + featuredImage) ──
  const enrichedPostDocIds: (number | string)[] = [];
  const genPostsDir = path.resolve("public/images/destinations");
  const genToursDir = path.resolve("public/images/tours");
  const genPostImageDir: Record<string, string> = {
    destinations: genPostsDir,
    tours: genToursDir,
  };

  for (const seed of provincePostSeeds) {
    const destId = seed.destinationHint in destinationSlugToId
      ? destinationSlugToId[seed.destinationHint]
      : undefined;
    const doc = await upsertBySlug("posts", {
      title: seed.title,
      slug: seed.slug,
      status: "published",
      destination: destId,
      guideCategory: seed.guideCategory,
      readingTime: seed.readingTime,
      author: seed.author,
      viewCount: seed.viewCount,
      updateCount: seed.updateCount,
      featured: true,
      sortWeight: 100,
      tags: seed.tags.map((tag) => ({ tag })),
      content: seed.content,
      seo: {
        metaTitle: `${seed.title} | TC Travel Vietnam`,
        metaDescription: seed.title,
        keywords: `${seed.destinationHint}, ${seed.guideCategory}, travel guide`,
      },
    });
    enrichedPostDocIds.push(doc.id);

    // Upload featuredImage
    const media = await seedImage(
      "posts",
      seed.slug,
      path.join(genPostImageDir[seed.image.dir], seed.image.file),
      seed.image.alt
    );
    if (media) {
      await payload.update({
        collection: "posts",
        id: doc.id,
        data: { featuredImage: media.id } as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`  -> linked ${seed.slug} featuredImage`);
    }
  }

  // Link relatedPosts for enriched posts (cross-reference with postList + each other)
  const allPostDocs = [...postList.map((p) => ({ id: p.id, slug: "" })), ...enrichedPostDocIds.map((id, i) => ({ id, slug: provincePostSeeds[i].slug }))];
  for (let index = 0; index < allPostDocs.length; index += 1) {
    const related = [
      allPostDocs[(index + 1) % allPostDocs.length].id,
      allPostDocs[(index + 2) % allPostDocs.length].id,
    ];
    await payload.update({
      collection: "posts",
      id: allPostDocs[index].id,
      data: { relatedPosts: related } as never,
      overrideAccess: true,
      disableTransaction: true,
    });
  }

  const allPostTitles = [...postList.map((p) => p.title), ...provincePostSeeds.map((p) => p.title)];
  const allPostIds = [...postList.map((p) => p.id), ...enrichedPostDocIds];

  const commentTemplates = [
    ["Emma Thompson", "This helped me choose the right base city before booking. Exactly the practical detail I was missing."],
    ["Marco Rossi", "Useful timing notes. I would add that WhatsApp confirmation is easiest for travellers already in Vietnam."],
    ["Priya Nair", "Clear guide, especially the section on what to do before the tour day. Bookmarked for our March trip."],
    ["Lucas Meyer", "Great read. We followed this almost step by step and it saved us a lot of guesswork on the ground."],
    ["Sofia Garcia", "Honest and well written. The food recommendations alone made this worth reading twice."],
  ] as const;

  for (const [postIndex, postTitle] of allPostTitles.entries()) {
    for (let i = 0; i < 3; i += 1) {
      const [authorName, comment] = commentTemplates[(postIndex + i) % commentTemplates.length];
      await upsertByField("comments", "content", `${comment} Article: ${postTitle}`, {
        author: adminUser.id,
        authorName,
        target: { relationTo: "posts", value: allPostIds[postIndex] },
        content: `${comment} Article: ${postTitle}`,
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
    blogMedia: {
      videoEyebrow: "Video highlight",
      videoSubtitle: "Explore the real captures of Central Vietnam through filming.",
      videoUrl: "",
      galleryEyebrow: "Travel photos gallery",
      gallerySubtitle: "A collection of amazing photos from Central Vietnam.",
      gallery: galleryMedia.map((m) => ({ image: m.id, caption: m.caption })),
    },
    name: "TC Travel Vietnam",
    hotline: "+84-236-555-0100",
    whatsapp: "+84-903-111-222",
    messenger: "tctravelvietnam",
    salesEmail: "hello@tctravel.example",
    social: [
      { platform: "facebook", url: "https://facebook.com/tctravelvietnam", label: "TC Travel on Facebook" },
      { platform: "instagram", url: "https://instagram.com/tctravelvietnam", label: "TC Travel on Instagram" },
      { platform: "youtube", url: "https://youtube.com/@tctravelvietnam", label: "TC Travel on YouTube" }
    ],
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
    homepage: {
      hero: {
        enabled: true,
        trustItems: [
          { label: "4.9★ rating", hint: "From inbound travellers" },
          { label: "Book now · Pay later", hint: "No prepayment required" },
          { label: "Local guides", hint: "Hội An · Huế · Đà Nẵng" },
        ],
      },
      search: {
        enabled: true,
        eyebrow: "Plan your trip",
        title: "Find your tour",
        subtitle: "Search by keyword, destination, and tour type — we'll take you straight to matching departures.",
      },
      seasonalBanner: { enabled: true },
      featuredTours: {
        enabled: true,
        eyebrow: "Hand-picked",
        title: "Featured Tours",
        subtitle: "Curated departures for the current season — private guides, small groups, and free walking tours.",
        actionLabel: "View all tours",
        actionHref: "/tours",
      },
      cruises: {
        enabled: true,
        eyebrow: "On the water",
        title: "Best Cruises",
        subtitle: "Overnight bay and river cruises with cabins, meals, and onboard activities — Book Now · Pay Later.",
        actionLabel: "View all cruises",
        actionHref: "/cruises",
      },
      destinations: {
        enabled: true,
        eyebrow: "Where to go",
        title: "Popular Destinations",
        subtitle: "Central Vietnam and beyond — explore tours, car transfers, guides, and things to do in each city hub.",
        actionLabel: "All destinations",
        actionHref: "/destinations",
      },
      freeTours: {
        sectionEnabled: true,
        pageEnabled: true,
        eyebrow: "Lead with experience",
        title: "Join Our Free Tours",
        subtitle: "Free walking and cycling tours in Central Vietnam. Tips appreciated — registration uses the same Book Now · Pay Later inquiry flow.",
        actionLabel: "See free tours",
        actionHref: "/free-tours",
      },
      featuredExperiences: {
        enabled: true,
        eyebrow: "External partners",
        title: "Featured Experiences",
        subtitle: "Day tours, tickets, and activities curated by trusted travel partners — booked externally, not through TC Travel.",
      },
      testimonials: { enabled: true },
      team: {
        enabled: true,
        eyebrow: "Meet the team",
        title: "People behind your trip",
        subtitle: "A small local team that plans, guides, and follows up before every departure.",
        actionLabel: "About us",
        actionHref: "/about-us",
      },
      whyUs: {
        enabled: true,
        eyebrow: "Why travellers choose us",
        title: "Local, trusted, low-pressure.",
        subtitle: "A small inbound agency built around hospitality, not high-volume sales.",
        items: [
          { icon: "compass", title: "Local Specialists", body: "Every tour is run by guides who live in Hội An, Huế and Đà Nẵng. Real stories, real recommendations." },
          { icon: "shield", title: "Trusted Local Operator", body: "A licensed Central Vietnam agency with real follow-up by phone and WhatsApp before every departure." },
          { icon: "wallet", title: "Book Now, Pay Later", body: "Submit an inquiry, confirm details with our team, then pay when you meet your guide. No prepayment." },
          { icon: "heart", title: "Value for Money", body: "Fair, transparent pricing with no hidden fees — including genuinely free walking and cycling tours." },
          { icon: "sparkle", title: "Authentic Experiences", body: "Small groups and private routes built around local life, realistic pacing, and the places we love." },
        ],
      },
      blog: {
        enabled: true,
        eyebrow: "Travel journal",
        title: "From the Blog",
        subtitle: "Practical planning notes, food guides, and local context before you commit to a tour.",
        actionLabel: "Read the blog",
        actionHref: "/blog",
      },
      newsletter: {
        enabled: true,
        title: "Seasonal trip ideas, no spam",
        subtitle: "Join our newsletter for the best time to visit and practical Central Vietnam planning notes.",
      },
    },
    ota: {
      enabled: true,
      providers: [
        { key: "getyourguide", enabled: true },
        { key: "viator", enabled: true },
        { key: "klook", enabled: true },
        { key: "civitatis", enabled: true },
        { key: "guruwalk", enabled: true },
      ],
      placements: {
        home: { enabled: true, providers: ["getyourguide"] },
        destination: { enabled: true, providers: ["getyourguide", "viator"] },
        tour: { enabled: true, providers: ["getyourguide", "viator"] },
      },
    },
    freeProposal: {
      enabled: true,
      stages: [
        { value: "I have an idea" },
        { value: "I need advice" },
        { value: "Ready to book" },
      ],
      themes: [
        { value: "Culture" },
        { value: "Food" },
        { value: "Nature" },
        { value: "Family" },
        { value: "Beach" },
        { value: "Photography" },
      ],
      hero: {
        eyebrow: "Start your travel project",
        title: "A private Vietnam itinerary, shaped by locals.",
        subtitle: "Share your dates, interests, destinations, and budget. Our team replies with a practical route and next steps. No online payment is required at this stage.",
      },
    },
  });

  await upsertByField("navigation", "name", "Header Navigation", {
    name: "Header Navigation",
    location: "header",
    status: "published",
    items: [
      {
        label: "Tours",
        href: "/tours",
        target: "_self",
        children: [
          { label: "All Tours", href: "/tours", target: "_self" },
          { label: "Private Tours", href: "/tours/paid-private", target: "_self" },
          { label: "Small Group", href: "/tours/paid-group", target: "_self" },
          { label: "Cruises", href: "/cruises", target: "_self" },
          { label: "Free Tours", href: "/free-tours", target: "_self" },
        ],
      },
      {
        label: "Destinations",
        href: "/destinations",
        target: "_self",
        children: [
          { label: "All Destinations", href: "/destinations", target: "_self" },
          { label: "Hội An", href: "/destinations/hoi-an", target: "_self" },
          { label: "Huế", href: "/destinations/hue", target: "_self" },
          { label: "Đà Nẵng", href: "/destinations/da-nang", target: "_self" },
          { label: "Quảng Trị", href: "/destinations/quang-tri", target: "_self" },
          { label: "Hà Nội", href: "/destinations/ha-noi", target: "_self" },
          { label: "Ninh Bình", href: "/destinations/ninh-binh", target: "_self" },
          { label: "Sa Pa", href: "/destinations/sa-pa", target: "_self" },
          { label: "Hà Giang", href: "/destinations/ha-giang", target: "_self" },
          { label: "Hồ Chí Minh City", href: "/destinations/ho-chi-minh-city", target: "_self" },
        ],
      },
      {
        label: "Car Rental",
        href: "/car-rentals",
        target: "_self",
        children: [
          { label: "All Vehicles", href: "/car-rentals", target: "_self" },
          { label: "Đà Nẵng", href: "/destinations/da-nang", target: "_self" },
          { label: "Hội An", href: "/destinations/hoi-an", target: "_self" },
          { label: "Huế", href: "/destinations/hue", target: "_self" },
          { label: "Quảng Trị", href: "/destinations/quang-tri", target: "_self" },
        ],
      },
      {
        label: "Travel Guides",
        href: "/blog",
        target: "_self",
        children: [
          { label: "All Guides", href: "/blog/all", target: "_self" },
          { label: "Hội An", href: "/blog/destination/hoi-an", target: "_self" },
          { label: "Huế", href: "/blog/destination/hue", target: "_self" },
          { label: "Đà Nẵng", href: "/blog/destination/da-nang", target: "_self" },
          { label: "Quảng Trị", href: "/blog/destination/quang-tri", target: "_self" },
        ],
      },
      { label: "About", href: "/about-us", target: "_self" },
      { label: "Customize Tour", href: "/customize-tour", target: "_self" },
    ],
  });

  await upsertByField("navigation", "name", "Footer Navigation", {
    name: "Footer Navigation",
    location: "footer",
    status: "published",
    items: [
      {
        label: "Explore",
        children: [
          { label: "All tours", href: "/tours", target: "_self" },
          { label: "Free tours", href: "/free-tours", target: "_self" },
          { label: "Destinations", href: "/destinations", target: "_self" },
          { label: "Car rentals", href: "/car-rentals", target: "_self" },
          { label: "Travel blog", href: "/blog", target: "_self" },
        ],
      },
      {
        label: "Plan your trip",
        children: [
          { label: "Hội An", href: "/blog/destination/hoi-an", target: "_self" },
          { label: "Huế", href: "/blog/destination/hue", target: "_self" },
          { label: "Đà Nẵng", href: "/blog/destination/da-nang", target: "_self" },
          { label: "Quảng Trị", href: "/blog/destination/quang-tri", target: "_self" },
          { label: "Hà Nội", href: "/blog/destination/ha-noi", target: "_self" },
          { label: "Sa Pa", href: "/blog/destination/sa-pa", target: "_self" },
          { label: "Hồ Chí Minh City", href: "/blog/destination/ho-chi-minh-city", target: "_self" },
          { label: "Car rentals", href: "/car-rentals", target: "_self" },
        ],
      },
      {
        label: "Company",
        children: [
          { label: "About us", href: "/about-us", target: "_self" },
          { label: "Contact", href: "/contact", target: "_self" },
          { label: "Customize tour", href: "/customize-tour", target: "_self" },
        ],
      },
    ],
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
      source: "customize-tour",
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
  console.log(`Tours: ${Object.keys(tours).length}; reviews: ${Object.keys(tours).length * 5}; posts: ${postList.length + filteredBlogSeeds.length + provincePostSeeds.length}; blog comments: ${allPostTitles.length * 3}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
