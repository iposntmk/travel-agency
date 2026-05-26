export const TOUR_TYPES = [
  { value: "paid-private", label: "Private" },
  { value: "paid-group", label: "Small group" },
  { value: "free-walking", label: "Free walking" },
  { value: "free-cycling", label: "Free cycling" },
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "cultural", label: "Cultural" }
] as const;

export const SEASONS = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "year-round", label: "Year-round" }
] as const;

export type SearchParamValue = string | string[] | undefined;

export interface ToursPageQuery {
  destination?: string;
  type?: string;
  season?: string;
  operation?: string;
  priceMax?: number;
}

export function readParam(value: SearchParamValue): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function readPriceMax(value: SearchParamValue): number | undefined {
  const raw = readParam(value);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

export function hasSearchParams(params: Record<string, SearchParamValue>): boolean {
  return Object.values(params).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });
}

export function queryString(query: ToursPageQuery, overrides: Record<string, string | undefined>): string {
  const merged: Record<string, string | undefined> = {
    destination: query.destination,
    type: query.type,
    season: query.season,
    operation: query.operation,
    priceMax: query.priceMax ? String(query.priceMax) : undefined,
    ...overrides
  };
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, value);
  }

  const str = search.toString();
  return str ? `?${str}` : "";
}

export function resultsKey(query: ToursPageQuery): string {
  return JSON.stringify(query);
}
