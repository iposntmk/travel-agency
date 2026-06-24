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
  q?: string;
  destination?: string;
  category?: string;
  attraction?: string;
  type?: string;
  season?: string;
  operation?: string;
  priceMax?: number;
  duration?: number;
  groupSize?: number;
  rating?: number;
  sort?: string;
}

export function readParam(value: SearchParamValue): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function readPriceMax(value: SearchParamValue): number | undefined {
  return readPositiveNumber(value);
}

export function readPositiveNumber(value: SearchParamValue): number | undefined {
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
    q: query.q,
    destination: query.destination,
    category: query.category,
    attraction: query.attraction,
    type: query.type,
    season: query.season,
    operation: query.operation,
    priceMax: query.priceMax ? String(query.priceMax) : undefined,
    duration: query.duration ? String(query.duration) : undefined,
    groupSize: query.groupSize ? String(query.groupSize) : undefined,
    rating: query.rating ? String(query.rating) : undefined,
    sort: query.sort,
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
