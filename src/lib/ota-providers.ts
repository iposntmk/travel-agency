export const OTA_PROVIDERS = [
  "getyourguide",
  "viator",
  "klook",
  "civitatis",
  "guruwalk"
] as const;

export type OtaProvider = (typeof OTA_PROVIDERS)[number];

interface ProviderDef {
  label: string;
  // Build a generic search URL for `city`. Affiliate IDs are not injected yet —
  // when the agency signs up for partner programs, append the partner param here
  // (see docs/OTA_INTEGRATIONS.md → "Adding affiliate IDs"). Revenue starts the
  // moment the param lands; no UI changes needed.
  buildUrl(city: string): string;
}

const PROVIDERS: Record<OtaProvider, ProviderDef> = {
  getyourguide: {
    label: "GetYourGuide",
    buildUrl: (city) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(city)}`
  },
  viator: {
    label: "Viator",
    buildUrl: (city) => `https://www.viator.com/searchResults/all?text=${encodeURIComponent(city)}`
  },
  klook: {
    label: "Klook",
    buildUrl: (city) => `https://www.klook.com/search/result/?keyword=${encodeURIComponent(city)}`
  },
  civitatis: {
    label: "Civitatis",
    buildUrl: (city) => `https://www.civitatis.com/en/search/?q=${encodeURIComponent(city)}`
  },
  guruwalk: {
    label: "GuruWalk",
    buildUrl: (city) => `https://www.guruwalk.com/walks?city=${encodeURIComponent(citySlug(city))}`
  }
};

function citySlug(city: string): string {
  return city
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildOtaUrl(provider: OtaProvider, city: string): string {
  return PROVIDERS[provider].buildUrl(city);
}

export function otaProviderLabel(provider: OtaProvider): string {
  return PROVIDERS[provider].label;
}

export function otaTargetId(provider: OtaProvider, city: string): string {
  return `${provider}:${citySlug(city)}`;
}
