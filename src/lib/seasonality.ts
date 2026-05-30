export type SeasonalCampaign = {
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

const EUROPE_WINTER: SeasonalCampaign = {
  key: "europe-winter",
  eyebrow: "In season now",
  title: "Europe Winter Escape",
  subtitle:
    "Swap the cold for warm coastlines and living culture across Central & Southern Vietnam — the October–April peak for European travellers.",
  ctaLabel: "See winter-season tours",
  ctaHref: "/tours?season=winter"
};

const VIETNAM_SUMMER: SeasonalCampaign = {
  key: "vietnam-summer",
  eyebrow: "In season now",
  title: "Vietnam Summer Family Tours",
  subtitle:
    "Adventure and family trips for the May–August school holidays — Phong Nha, Bạch Mã, Sapa, and beyond.",
  ctaLabel: "See summer-season tours",
  ctaHref: "/tours?season=summer"
};

const ITALY_LONG_HOLIDAY: SeasonalCampaign = {
  key: "italy-long-holiday",
  eyebrow: "In season now",
  title: "Italy Long Holiday Special",
  subtitle:
    "Private tailor-made journeys for the September Ferragosto break — crafted for a relaxed late-summer pace.",
  ctaLabel: "Explore private tours",
  ctaHref: "/tours?type=paid-private"
};

/**
 * Pick the homepage seasonal campaign for a given date, following the peak
 * windows in docs/MARKET_SEASONALITY.md. Deterministic per calendar month so
 * it is testable and stable across the page's ISR revalidate window.
 */
export function getSeasonalCampaign(date: Date = new Date()): SeasonalCampaign {
  const month = date.getUTCMonth() + 1;
  if (month >= 5 && month <= 8) return VIETNAM_SUMMER; // VN domestic + family summer
  if (month === 9) return ITALY_LONG_HOLIDAY; // Italy Ferragosto tail
  return EUROPE_WINTER; // Oct–Apr European winter peak
}
