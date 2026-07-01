// Sample per-locale content translations for storefront cards (homepage + list
// pages). Keyed by document slug. Only the short display fields that appear on
// cards are translated here — enough to demonstrate the localized storefront
// switching languages end-to-end. Extend freely: any doc/field omitted falls
// back to the English base (Payload localization `fallback: true`).
//
// Applied in scripts/seed.ts AFTER the English base docs are created, via
// payload.update({ ..., locale }).

export type NonDefaultLocale = "fr" | "es" | "de" | "it" | "pt" | "zh-Hans" | "zh-Hant";
export type LocaleText = Partial<Record<NonDefaultLocale, string>>;

// Featured tours shown on the homepage (getToursForList featuredOnly, limit 6).
export const tourTitleTranslations: Record<string, LocaleText> = {
  "hoi-an-private-heritage-walk": {
    fr: "Balade privée du patrimoine de Hội An",
    es: "Paseo privado por el patrimonio de Hội An",
    de: "Private Kulturerbe-Tour durch Hội An",
    it: "Passeggiata privata nel patrimonio di Hội An",
    pt: "Passeio privado pelo patrimônio de Hội An",
    "zh-Hans": "会安私人文化遗产漫步",
    "zh-Hant": "會安私人文化遺產漫步",
  },
  "hoi-an-foodie-adventure": {
    fr: "Aventure gastronomique à Hội An",
    es: "Aventura gastronómica en Hội An",
    de: "Kulinarisches Abenteuer in Hội An",
    it: "Avventura gastronomica a Hội An",
    pt: "Aventura gastronômica em Hội An",
    "zh-Hans": "会安美食探险",
    "zh-Hant": "會安美食探險",
  },
  "free-hoi-an-lantern-walk": {
    fr: "Balade gratuite des lanternes de Hội An",
    es: "Paseo gratuito de los faroles de Hội An",
    de: "Kostenloser Laternen-Spaziergang in Hội An",
    it: "Passeggiata gratuita delle lanterne di Hội An",
    pt: "Passeio gratuito das lanternas de Hội An",
    "zh-Hans": "会安免费灯笼漫步",
    "zh-Hant": "會安免費燈籠漫步",
  },
  "hue-imperial-small-group": {
    fr: "Circuit en petit groupe de la cité impériale de Huế",
    es: "Tour en grupo reducido por la ciudad imperial de Huế",
    de: "Kleingruppentour durch die Kaiserstadt Huế",
    it: "Tour in piccolo gruppo della città imperiale di Huế",
    pt: "Tour em pequeno grupo pela cidade imperial de Huế",
    "zh-Hans": "顺化皇城小团游",
    "zh-Hant": "順化皇城小團遊",
  },
  "hue-street-food-cyclo": {
    fr: "Street food de Huế en cyclo",
    es: "Comida callejera de Huế en ciclo",
    de: "Streetfood in Huế mit der Cyclo-Rikscha",
    it: "Street food di Huế in cyclo",
    pt: "Comida de rua de Huế de cyclo",
    "zh-Hans": "三轮车游顺化街头美食",
    "zh-Hant": "三輪車遊順化街頭美食",
  },
  "hue-perfume-river-sunset": {
    fr: "Croisière au coucher du soleil sur la rivière des Parfums",
    es: "Crucero al atardecer por el río Perfume",
    de: "Sonnenuntergangs-Bootsfahrt auf dem Parfümfluss",
    it: "Crociera al tramonto sul fiume dei Profumi",
    pt: "Cruzeiro ao pôr do sol no rio Perfume",
    "zh-Hans": "香江日落游船",
    "zh-Hant": "香江日落遊船",
  },
};

// All 3 cruises shown on the homepage (title + routeSummary appear on the card).
export const cruiseTranslations: Record<string, { title: LocaleText; routeSummary: LocaleText }> = {
  "lan-ha-bay-overnight-cruise": {
    title: {
      fr: "Croisière d'une nuit dans la baie de Lan Hạ",
      es: "Crucero de una noche por la bahía de Lan Hạ",
      de: "Übernachtungs-Kreuzfahrt in der Lan-Hạ-Bucht",
      it: "Crociera con pernottamento nella baia di Lan Hạ",
      pt: "Cruzeiro com pernoite na baía de Lan Hạ",
      "zh-Hans": "兰下湾过夜游轮",
      "zh-Hant": "蘭下灣過夜遊輪",
    },
    routeSummary: {
      fr: "Îlots karstiques, kayak, pont au coucher du soleil et une cabine pour la nuit, loin de la foule.",
      es: "Islotes kársticos, kayak, cubierta al atardecer y un camarote para pasar la noche, lejos de las multitudes.",
      de: "Karstinseln, Kajakfahren, Sonnenuntergangsdeck und eine Übernachtungskabine abseits der Menge.",
      it: "Isolotti carsici, kayak, ponte al tramonto e una cabina per la notte, lontano dalla folla.",
      pt: "Ilhotas cársticas, caiaque, convés ao pôr do sol e uma cabine para passar a noite, longe das multidões.",
      "zh-Hans": "喀斯特岛屿、皮划艇、日落甲板，以及远离人群的过夜船舱。",
      "zh-Hant": "喀斯特島嶼、獨木舟、日落甲板，以及遠離人群的過夜船艙。",
    },
  },
  "mekong-delta-luxury-cruise": {
    title: {
      fr: "Croisière de luxe dans le delta du Mékong",
      es: "Crucero de lujo por el delta del Mekong",
      de: "Luxus-Kreuzfahrt im Mekong-Delta",
      it: "Crociera di lusso nel delta del Mekong",
      pt: "Cruzeiro de luxo no delta do Mekong",
      "zh-Hans": "湄公河三角洲豪华游轮",
      "zh-Hant": "湄公河三角洲豪華遊輪",
    },
    routeSummary: {
      fr: "Voyage tranquille sur le fleuve à travers marchés flottants, vergers et villages riverains.",
      es: "Viaje tranquilo por el río a través de mercados flotantes, huertos y pueblos ribereños.",
      de: "Gemächliche Flussreise durch schwimmende Märkte, Obstgärten und Dörfer am Ufer.",
      it: "Lento viaggio sul fiume tra mercati galleggianti, frutteti e villaggi rivieraschi.",
      pt: "Viagem tranquila pelo rio através de mercados flutuantes, pomares e vilarejos ribeirinhos.",
      "zh-Hans": "沿河慢游，穿越水上市场、果园和河畔村庄。",
      "zh-Hant": "沿河慢遊，穿越水上市場、果園和河畔村莊。",
    },
  },
  "perfume-river-heritage-cruise": {
    title: {
      fr: "Croisière patrimoniale sur la rivière des Parfums",
      es: "Crucero patrimonial por el río Perfume",
      de: "Kulturerbe-Kreuzfahrt auf dem Parfümfluss",
      it: "Crociera del patrimonio sul fiume dei Profumi",
      pt: "Cruzeiro patrimonial no rio Perfume",
      "zh-Hans": "香江文化遗产游轮",
      "zh-Hant": "香江文化遺產遊輪",
    },
    routeSummary: {
      fr: "Tombeaux royaux, pagodes au bord de l'eau et contexte impérial de Huế depuis la rivière.",
      es: "Tumbas reales, pagodas junto al río y el contexto imperial de Huế desde el agua.",
      de: "Königsgräber, Pagoden am Ufer und der kaiserliche Kontext von Huế vom Wasser aus.",
      it: "Tombe reali, pagode lungo il fiume e il contesto imperiale di Huế dall'acqua.",
      pt: "Túmulos reais, pagodes à beira-rio e o contexto imperial de Huế a partir da água.",
      "zh-Hans": "从水上探访皇陵、河畔宝塔与顺化皇城风貌。",
      "zh-Hant": "從水上探訪皇陵、河畔寶塔與順化皇城風貌。",
    },
  },
};

// Primary blog posts (homepage BlogSection + list). Title shown on the card.
export const postTitleTranslations: Record<string, LocaleText> = {
  "guide-to-hoi-an-old-town": {
    fr: "Le guide ultime de la vieille ville de Hội An",
    es: "La guía definitiva del casco antiguo de Hội An",
    de: "Der ultimative Leitfaden für die Altstadt von Hội An",
    it: "La guida definitiva al centro storico di Hội An",
    pt: "O guia definitivo da cidade antiga de Hội An",
    "zh-Hans": "会安古城终极指南",
    "zh-Hant": "會安古城終極指南",
  },
  "hoi-an-food-guide": {
    fr: "Que manger à Hội An avant votre premier tour gastronomique",
    es: "Qué comer en Hội An antes de tu primer tour gastronómico",
    de: "Was man in Hội An vor der ersten Food-Tour essen sollte",
    it: "Cosa mangiare a Hội An prima del tuo primo tour gastronomico",
    pt: "O que comer em Hội An antes do seu primeiro tour gastronômico",
    "zh-Hans": "首次美食之旅前，会安必吃美食",
    "zh-Hant": "首次美食之旅前，會安必吃美食",
  },
  "exploring-hue-imperial-city": {
    fr: "Explorer la cité impériale de Huế sans se presser",
    es: "Explorar la ciudad imperial de Huế sin prisas",
    de: "Die Kaiserstadt Huế ohne Hetze erkunden",
    it: "Esplorare la città imperiale di Huế senza fretta",
    pt: "Explorar a cidade imperial de Huế sem pressa",
    "zh-Hans": "从容探索顺化皇城",
    "zh-Hant": "從容探索順化皇城",
  },
  "da-nang-family-beach-guide": {
    fr: "Un programme pratique de Đà Nẵng pour les familles",
    es: "Un plan práctico de Đà Nẵng para familias",
    de: "Ein praktischer Đà-Nẵng-Plan für Familien",
    it: "Un programma pratico di Đà Nẵng per le famiglie",
    pt: "Um plano prático de Đà Nẵng para famílias",
    "zh-Hans": "岘港家庭实用行程",
    "zh-Hant": "峴港家庭實用行程",
  },
  "quang-tri-dmz-travel-guide": {
    fr: "Comment visiter la zone démilitarisée de Quảng Trị avec respect",
    es: "Cómo visitar la zona desmilitarizada de Quảng Trị con respeto",
    de: "Wie man die entmilitarisierte Zone von Quảng Trị respektvoll besucht",
    it: "Come visitare la zona demilitarizzata di Quảng Trị con rispetto",
    pt: "Como visitar a zona desmilitarizada de Quảng Trị com respeito",
    "zh-Hans": "如何怀敬意地游览广治非军事区",
    "zh-Hant": "如何懷敬意地遊覽廣治非軍事區",
  },
  "book-now-pay-later-guide": {
    fr: "Comment fonctionne « Réservez maintenant, payez plus tard » avec TC Travel",
    es: "Cómo funciona «Reserva ahora, paga después» con TC Travel",
    de: "So funktioniert „Jetzt buchen, später zahlen“ bei TC Travel",
    it: "Come funziona «Prenota ora, paga dopo» con TC Travel",
    pt: "Como funciona «Reserve agora, pague depois» com a TC Travel",
    "zh-Hans": "TC Travel 的「先预订、后付款」如何运作",
    "zh-Hant": "TC Travel 的「先預訂、後付款」如何運作",
  },
};
