import type { Destination, Tour } from "@/payload-types";

export function destinationOf(tour: Tour): Destination | null {
  return tour.destination && typeof tour.destination === "object"
    ? (tour.destination as Destination)
    : null;
}

export function badgesFor(tour: Tour): string[] {
  const badges: string[] = [];
  if (tour.minPax && tour.currentPax && tour.currentPax >= tour.minPax) badges.push("Guaranteed Departure");
  if (tour.operationType === "partner") badges.push("Partner operated");
  if (tour.operationType === "hybrid") badges.push("Hybrid operation");
  if (tour.isFeaturedInSeason) badges.push("Seasonal pick");
  return badges;
}
