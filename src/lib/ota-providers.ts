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

export function isOtaProvider(value: unknown): value is OtaProvider {
  return typeof value === "string" && (OTA_PROVIDERS as readonly string[]).includes(value);
}

// CMS-driven config (a subset of the SiteSettings `ota` group). Kept loose so it
// can be fed directly from payload-types without a hard import cycle.
export interface OtaProviderConfig {
  key?: string | null;
  label?: string | null;
  urlTemplate?: string | null;
  enabled?: boolean | null;
}

export interface OtaPlacementConfig {
  enabled?: boolean | null;
  providers?: (string | null)[] | null;
  heading?: string | null;
  blurb?: string | null;
}

export interface OtaConfig {
  enabled?: boolean | null;
  providers?: OtaProviderConfig[] | null;
  placements?: {
    home?: OtaPlacementConfig | null;
    destination?: OtaPlacementConfig | null;
    tour?: OtaPlacementConfig | null;
  } | null;
}

export type OtaPlacementName = "home" | "destination" | "tour";

export interface ResolvedOtaWidget {
  key: OtaProvider;
  label: string;
  url: string;
  targetId: string;
  heading?: string;
  blurb?: string;
}

const DEFAULT_PLACEMENT_PROVIDERS: Record<OtaPlacementName, OtaProvider[]> = {
  home: ["getyourguide"],
  destination: ["getyourguide", "viator"],
  tour: ["getyourguide", "viator"]
};

// Resolve a single provider for a city, layering CMS overrides over code defaults.
export function resolveOtaProvider(
  key: OtaProvider,
  city: string,
  cmsProvider?: OtaProviderConfig
): ResolvedOtaWidget {
  const url = cmsProvider?.urlTemplate
    ? cmsProvider.urlTemplate.replaceAll("{city}", encodeURIComponent(city))
    : buildOtaUrl(key, city);
  return {
    key,
    label: cmsProvider?.label || otaProviderLabel(key),
    url,
    targetId: otaTargetId(key, city)
  };
}

export function resolveOtaWidgets(
  ota: OtaConfig | null | undefined,
  placement: OtaPlacementName,
  city: string
): ResolvedOtaWidget[] {
  if (ota?.enabled !== true) return [];

  const placementConfig = ota.placements?.[placement] ?? undefined;
  if (placementConfig?.enabled !== true) return [];

  const catalog = new Map<OtaProvider, OtaProviderConfig>();
  for (const provider of ota.providers ?? []) {
    if (isOtaProvider(provider?.key)) catalog.set(provider.key, provider ?? {});
  }

  const selected = (placementConfig?.providers ?? []).filter(isOtaProvider);
  const keys = selected.length > 0 ? selected : DEFAULT_PLACEMENT_PROVIDERS[placement];

  const widgets: ResolvedOtaWidget[] = [];
  for (const key of keys) {
    const cmsProvider = catalog.get(key);
    if (cmsProvider?.enabled === false) continue;
    const widget = resolveOtaProvider(key, city, cmsProvider);
    if (placementConfig?.heading) widget.heading = placementConfig.heading.replaceAll("{city}", city);
    if (placementConfig?.blurb) widget.blurb = placementConfig.blurb;
    widgets.push(widget);
  }
  return widgets;
}
