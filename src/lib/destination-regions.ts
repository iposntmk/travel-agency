export const DESTINATION_REGION_LABEL: Record<string, string> = {
  central: "Central Vietnam",
  north: "Northern Vietnam",
  south: "Southern Vietnam"
};

export const DESTINATION_REGION_BEST_SEASON: Record<string, string> = {
  central:
    "February to August — dry season is best for beaches and old town walks. Heaviest rain falls from October to early December.",
  north: "October to April — cooler, drier months ideal for trekking and city exploration.",
  south: "December to April — dry season; rest of the year sees afternoon showers."
};

export function destinationRegionLabel(region?: string | null): string | null {
  return region ? DESTINATION_REGION_LABEL[region] ?? null : null;
}

export function destinationRegionBestSeason(region?: string | null): string | undefined {
  return region ? DESTINATION_REGION_BEST_SEASON[region] : undefined;
}
