export interface DestinationSeed {
  title: string;
  slug: string;
  region: "central" | "north" | "south";
  summary: string;
  bestTimeToVisit: string;
  hubIntro: string;
  description: string;
  sortWeight: number;
  imageFile?: string;
  imageAlt?: string;
}

export const destinationSeeds: DestinationSeed[] = [
  {
    title: "Hội An",
    slug: "hoi-an",
    region: "central",
    summary: "Lantern-lit ancient town, quiet craft villages, riverside food alleys, and countryside cycling routes.",
    bestTimeToVisit: "February to August for dry weather, golden afternoon light, and easy walking conditions.",
    hubIntro: "Hội An is the best base for first-time travellers who want a compact old town, gentle countryside, hands-on food experiences, and relaxed private guiding.",
    description: "Hội An pairs UNESCO heritage streets with river markets, craft villages, cooking classes, and nearby beaches. It works well for couples, families, food travellers, and guests who prefer easy-paced walking tours.",
    sortWeight: 10,
    imageFile: "hoian2.webp",
    imageAlt: "Hội An lantern streets and ancient town",
  },
  {
    title: "Huế",
    slug: "hue",
    region: "central",
    summary: "Imperial citadel, royal tombs, garden houses, Perfume River sunsets, and refined local cuisine.",
    bestTimeToVisit: "January to April for mild weather and September to November for quieter cultural touring.",
    hubIntro: "Huế is the cultural heart of Central Vietnam, best for travellers who care about history, architecture, royal food, and slower river-based itineraries.",
    description: "The former imperial capital gives visitors a layered view of Vietnam through citadels, pagodas, royal tombs, markets, and family-run kitchens.",
    sortWeight: 20,
    imageFile: "hue2.webp",
    imageAlt: "Huế Imperial Citadel and royal architecture",
  },
  {
    title: "Đà Nẵng",
    slug: "da-nang",
    region: "central",
    summary: "Beach city gateway with Sơn Trà nature, Marble Mountains, Bà Nà Hills, airport transfers, and day trips.",
    bestTimeToVisit: "March to August for beach weather, clear Sơn Trà views, and the best road-trip conditions.",
    hubIntro: "Đà Nẵng is the practical gateway for Central Vietnam with easy airport access, reliable private transfers, family-friendly beaches, and fast links to Hội An and Huế.",
    description: "Đà Nẵng works as a beach base, airport hub, and day-trip launch point for families, couples, and groups who want flexible transport and short activity days.",
    sortWeight: 30,
    imageFile: "dest-6.webp",
    imageAlt: "Central Vietnam coastal town scenery near Đà Nẵng",
  },
  {
    title: "Quảng Trị",
    slug: "quang-tri",
    region: "central",
    summary: "DMZ heritage, Vĩnh Mốc tunnels, Hien Luong Bridge, memorial sites, and quiet coastal villages.",
    bestTimeToVisit: "January to August for drier roads and easier full-day heritage touring.",
    hubIntro: "Quảng Trị is for travellers who want a serious, respectful look at the former DMZ, wartime tunnel life, and modern memorial landscapes.",
    description: "Quảng Trị day trips connect Vĩnh Mốc Tunnels, Hien Luong Bridge, the ancient citadel, and rural coastal communities with careful historical context.",
    sortWeight: 40,
    imageFile: "quang-tri2.webp",
    imageAlt: "Historic memorial architecture in Central Vietnam",
  },
  {
    title: "Hà Nội",
    slug: "ha-noi",
    region: "north",
    summary: "Ancient capital with Old Quarter alleys, temple heritage, lakeside walks, street food, and vibrant local markets.",
    bestTimeToVisit: "October to December for cool dry weather; March to April for spring blossoms.",
    hubIntro: "Hà Nội is the cultural soul of Northern Vietnam, best for travellers who want history, street food, and a lively mix of old and new.",
    description: "Hà Nội pairs thousand-year-old temples, French colonial architecture, bustling markets, and some of Vietnam's best street food with easy access to day trips.",
    sortWeight: 50,
    imageFile: "hanoi2.webp",
    imageAlt: "Hà Nội Old Quarter and Hoàn Kiếm Lake",
  },
  {
    title: "Ninh Bình",
    slug: "ninh-binh",
    region: "north",
    summary: "Karst limestone peaks, river boat rides, ancient temples, rice paddies, and quiet cycling routes.",
    bestTimeToVisit: "September to November for green rice fields; March to May for dry sunny days.",
    hubIntro: "Ninh Bình is the perfect escape for travellers who love nature, photography, and slower-paced countryside touring.",
    description: "Ninh Bình offers dramatic karst landscapes, Tràng An boat rides, ancient temples, and peaceful rural cycling away from city crowds.",
    sortWeight: 60,
    imageFile: "ninhbinh2.webp",
    imageAlt: "Ninh Bình karst landscape and rice paddies",
  },
  {
    title: "Sa Pa",
    slug: "sa-pa",
    region: "north",
    summary: "Terraced rice fields, mountain treks, local hill tribe culture, cool highland climate, and Fansipan views.",
    bestTimeToVisit: "March to May for green terraces; September to November for golden harvest season.",
    hubIntro: "Sa Pa is Northern Vietnam's premier trekking destination, ideal for travellers who want mountain scenery, cultural encounters, and cool highland air.",
    description: "Sa Pa connects terraced rice fields, minority village homestays, Fansipan cable car, and multi-day treks through the Hoàng Liên Sơn range.",
    sortWeight: 70,
    imageFile: "sapa2.webp",
    imageAlt: "Sa Pa terraced rice fields and mountains",
  },
  {
    title: "Hà Giang",
    slug: "ha-giang",
    region: "north",
    summary: "Dramatic mountain passes, ethnic minority villages, the Mã Pí Lèng canyon, and remote frontier roads.",
    bestTimeToVisit: "October to December for buckwheat flowers and clear skies; March to April for spring warmth.",
    hubIntro: "Hà Giang is Vietnam's most dramatic road trip destination, best for adventurous travellers who want raw mountain scenery and authentic village encounters.",
    description: "Hà Giang delivers the Đồng Văn Karst Plateau, Mã Pí Lèng Pass, remote market days, and some of the most spectacular motorbike and jeep routes in Southeast Asia.",
    sortWeight: 80,
    imageFile: "hagiang2.webp",
    imageAlt: "Hà Giang Mã Pí Lèng canyon and mountain pass",
  },
  {
    title: "Hồ Chí Minh City",
    slug: "ho-chi-minh-city",
    region: "south",
    summary: "Dynamic southern hub with French colonial landmarks, vibrant markets, rooftop bars, and Mekong Delta day trips.",
    bestTimeToVisit: "December to April for dry season; avoid peak rain in September to November.",
    hubIntro: "Hồ Chí Minh City is Vietnam's economic engine, best for travellers who want energy, nightlife, history, and a gateway to southern Vietnam.",
    description: "Hồ Chí Minh City blends war history museums, colonial architecture, buzzing street markets, world-class food, and easy connections to the Mekong Delta and Củ Chi tunnels.",
    sortWeight: 90,
    imageFile: "ho-chi-minh-city2.webp",
    imageAlt: "Hồ Chí Minh City skyline and street life",
  },
];

export const destinationImageMap: Record<string, { file: string; alt: string }> = {};
for (const dest of destinationSeeds) {
  if (dest.imageFile && dest.imageAlt) {
    destinationImageMap[dest.slug] = { file: dest.imageFile, alt: dest.imageAlt };
  }
}
