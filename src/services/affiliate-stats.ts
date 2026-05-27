import "server-only";

import type { Payload } from "payload";
import type { AffiliateClick } from "@/payload-types";
import {
  OTA_PROVIDERS,
  otaProviderLabel,
  type OtaProvider
} from "@/lib/ota-providers";

export const AFFILIATE_RANGE_DAYS = [7, 30, 90] as const;
export type AffiliateRangeDays = (typeof AFFILIATE_RANGE_DAYS)[number];

export type AffiliateTargetType = "addon" | "ota";

export interface DecodedTargetId {
  provider?: OtaProvider;
  citySlug?: string;
  label: string;
}

export interface AffiliateStats {
  rangeDays: number;
  rangeStartIso: string;
  rangeEndIso: string;
  totalClicks: number;
  byTargetType: Array<{ targetType: AffiliateTargetType; clicks: number }>;
  byOtaProvider: Array<{ provider: string; label: string; clicks: number }>;
  topTargets: Array<{
    targetType: AffiliateTargetType;
    targetId: string;
    label: string;
    clicks: number;
  }>;
  topSources: Array<{ source: string; clicks: number }>;
  byDay: Array<{ day: string; clicks: number }>;
  recent: Array<{
    id: string;
    targetType: AffiliateTargetType;
    targetId: string;
    label: string;
    source: string;
    createdAt: string;
  }>;
}

const TOP_N = 20;
const RECENT_N = 20;
const MAX_FETCH = 10_000;

export function isAffiliateRange(value: unknown): value is AffiliateRangeDays {
  return typeof value === "number" && (AFFILIATE_RANGE_DAYS as readonly number[]).includes(value);
}

export function parseAffiliateRange(value: string | undefined | null): AffiliateRangeDays {
  if (!value) return 30;
  const trimmed = value.trim().toLowerCase().replace(/d$/, "");
  const n = Number.parseInt(trimmed, 10);
  return isAffiliateRange(n) ? n : 30;
}

export function decodeAffiliateTargetId(
  targetType: AffiliateTargetType,
  targetId: string
): DecodedTargetId {
  if (targetType !== "ota") {
    return { label: targetId };
  }

  const sep = targetId.indexOf(":");
  if (sep < 1) {
    return { label: targetId };
  }

  const providerRaw = targetId.slice(0, sep).toLowerCase();
  const citySlug = targetId.slice(sep + 1);
  const provider = (OTA_PROVIDERS as readonly string[]).includes(providerRaw)
    ? (providerRaw as OtaProvider)
    : undefined;

  if (!provider) {
    return { citySlug, label: targetId };
  }

  return {
    provider,
    citySlug,
    label: `${otaProviderLabel(provider)} — ${prettyCity(citySlug)}`
  };
}

function prettyCity(citySlug: string): string {
  if (!citySlug) return "";
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export interface AggregateInput {
  rows: Pick<AffiliateClick, "targetType" | "targetId" | "source" | "createdAt" | "id">[];
  rangeDays: AffiliateRangeDays;
  now?: Date;
}

export function aggregateAffiliateClicks({ rows, rangeDays, now }: AggregateInput): AffiliateStats {
  const end = now ?? new Date();
  const start = new Date(end.getTime() - rangeDays * 24 * 60 * 60 * 1000);

  const inRange = rows.filter((row) => {
    const ts = Date.parse(row.createdAt);
    return Number.isFinite(ts) && ts >= start.getTime() && ts <= end.getTime();
  });

  const byTargetTypeMap = new Map<AffiliateTargetType, number>();
  const byOtaProviderMap = new Map<string, number>();
  const targetCounts = new Map<string, { targetType: AffiliateTargetType; targetId: string; clicks: number }>();
  const sourceCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();

  for (const row of inRange) {
    byTargetTypeMap.set(row.targetType, (byTargetTypeMap.get(row.targetType) ?? 0) + 1);
    sourceCounts.set(row.source, (sourceCounts.get(row.source) ?? 0) + 1);

    const targetKey = `${row.targetType}|${row.targetId}`;
    const existing = targetCounts.get(targetKey);
    if (existing) {
      existing.clicks += 1;
    } else {
      targetCounts.set(targetKey, { targetType: row.targetType, targetId: row.targetId, clicks: 1 });
    }

    if (row.targetType === "ota") {
      const decoded = decodeAffiliateTargetId(row.targetType, row.targetId);
      const providerKey = decoded.provider ?? "unknown";
      byOtaProviderMap.set(providerKey, (byOtaProviderMap.get(providerKey) ?? 0) + 1);
    }

    const day = utcDayKey(row.createdAt);
    if (day) {
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
  }

  const topTargets = Array.from(targetCounts.values())
    .sort((a, b) => b.clicks - a.clicks || a.targetId.localeCompare(b.targetId))
    .slice(0, TOP_N)
    .map((entry) => ({
      targetType: entry.targetType,
      targetId: entry.targetId,
      clicks: entry.clicks,
      label: decodeAffiliateTargetId(entry.targetType, entry.targetId).label
    }));

  const topSources = Array.from(sourceCounts.entries())
    .map(([source, clicks]) => ({ source, clicks }))
    .sort((a, b) => b.clicks - a.clicks || a.source.localeCompare(b.source))
    .slice(0, TOP_N);

  const byDay = buildDaySeries(start, end, dayCounts);

  const byTargetType = (["addon", "ota"] as AffiliateTargetType[])
    .map((targetType) => ({ targetType, clicks: byTargetTypeMap.get(targetType) ?? 0 }))
    .filter((entry, _, arr) => entry.clicks > 0 || arr.length <= 2);

  const byOtaProvider = Array.from(byOtaProviderMap.entries())
    .map(([provider, clicks]) => ({
      provider,
      label: isOtaProvider(provider) ? otaProviderLabel(provider) : provider,
      clicks
    }))
    .sort((a, b) => b.clicks - a.clicks || a.provider.localeCompare(b.provider));

  const recent = [...inRange]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, RECENT_N)
    .map((row) => ({
      id: String(row.id),
      targetType: row.targetType,
      targetId: row.targetId,
      label: decodeAffiliateTargetId(row.targetType, row.targetId).label,
      source: row.source,
      createdAt: row.createdAt
    }));

  return {
    rangeDays,
    rangeStartIso: start.toISOString(),
    rangeEndIso: end.toISOString(),
    totalClicks: inRange.length,
    byTargetType,
    byOtaProvider,
    topTargets,
    topSources,
    byDay,
    recent
  };
}

function isOtaProvider(value: string): value is OtaProvider {
  return (OTA_PROVIDERS as readonly string[]).includes(value);
}

function utcDayKey(iso: string): string | null {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return null;
  return new Date(ts).toISOString().slice(0, 10);
}

function buildDaySeries(start: Date, end: Date, counts: Map<string, number>): Array<{ day: string; clicks: number }> {
  const days: Array<{ day: string; clicks: number }> = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (cursor.getTime() <= endDay.getTime()) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ day: key, clicks: counts.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export async function loadAffiliateStats(
  payload: Payload,
  rangeDays: AffiliateRangeDays,
  now: Date = new Date()
): Promise<AffiliateStats> {
  const start = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

  const result = await payload.find({
    collection: "affiliate-clicks",
    depth: 0,
    limit: MAX_FETCH,
    pagination: false,
    overrideAccess: true,
    sort: "-createdAt",
    where: { createdAt: { greater_than_equal: start.toISOString() } }
  });

  return aggregateAffiliateClicks({
    rows: result.docs,
    rangeDays,
    now
  });
}
