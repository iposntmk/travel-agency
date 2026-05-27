import Link from "next/link";
import {
  AFFILIATE_RANGE_DAYS,
  type AffiliateRangeDays,
  type AffiliateStats
} from "@/services/affiliate-stats";

export function AffiliateDashboard({ stats, range }: { stats: AffiliateStats; range: AffiliateRangeDays }) {
  const otaTotal = stats.byTargetType.find((t) => t.targetType === "ota")?.clicks ?? 0;
  const addonTotal = stats.byTargetType.find((t) => t.targetType === "addon")?.clicks ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Affiliate clicks</h1>
          <p className="mt-1 text-sm text-slate-600">
            Last {range} days · {fmt(stats.totalClicks)} clicks
            <span className="ml-2 text-slate-400">
              {stats.rangeStartIso.slice(0, 10)} → {stats.rangeEndIso.slice(0, 10)}
            </span>
          </p>
        </div>
        <RangeSelector current={range} />
      </header>

      <dl className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Total clicks" value={fmt(stats.totalClicks)} />
        <Kpi label="OTA clicks" value={fmt(otaTotal)} />
        <Kpi label="Add-on clicks" value={fmt(addonTotal)} />
        <Kpi
          label="Distinct targets"
          value={stats.topTargets.length >= 20 ? "20+" : String(stats.topTargets.length)}
        />
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Top targets">
          <TargetsTable rows={stats.topTargets} />
        </Panel>
        <Panel title="Top source pages">
          <SourcesTable rows={stats.topSources} />
        </Panel>
        <Panel title="OTA providers">
          <ProvidersTable rows={stats.byOtaProvider} />
        </Panel>
        <Panel title="Clicks per day">
          <DayBarChart days={stats.byDay} />
        </Panel>
      </div>

      <Panel title="Recent clicks">
        <RecentTable rows={stats.recent} />
      </Panel>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ hint }: { hint?: string }) {
  return <p className="text-sm text-slate-500">{hint ?? "No data in this range yet."}</p>;
}

function TargetsTable({ rows }: { rows: AffiliateStats["topTargets"] }) {
  if (rows.length === 0) return <Empty />;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-2">Target</th>
          <th className="pb-2">Type</th>
          <th className="pb-2 text-right">Clicks</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((entry) => (
          <tr key={`${entry.targetType}-${entry.targetId}`} className="border-t border-slate-100">
            <td className="py-2 pr-2">
              <div className="font-medium text-slate-900">{entry.label}</div>
              <div className="text-xs text-slate-500">{entry.targetId}</div>
            </td>
            <td className="py-2 pr-2 text-xs uppercase tracking-wide text-slate-500">{entry.targetType}</td>
            <td className="py-2 text-right font-semibold tabular-nums">{fmt(entry.clicks)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SourcesTable({ rows }: { rows: AffiliateStats["topSources"] }) {
  if (rows.length === 0) return <Empty />;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-2">Page</th>
          <th className="pb-2 text-right">Clicks</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((entry) => (
          <tr key={entry.source} className="border-t border-slate-100">
            <td className="py-2 pr-2 font-mono text-xs text-slate-700">{entry.source || "(empty)"}</td>
            <td className="py-2 text-right font-semibold tabular-nums">{fmt(entry.clicks)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProvidersTable({ rows }: { rows: AffiliateStats["byOtaProvider"] }) {
  if (rows.length === 0) return <Empty hint="No OTA clicks in this range." />;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-2">Provider</th>
          <th className="pb-2 text-right">Clicks</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((entry) => (
          <tr key={entry.provider} className="border-t border-slate-100">
            <td className="py-2 pr-2 font-medium text-slate-900">{entry.label}</td>
            <td className="py-2 text-right font-semibold tabular-nums">{fmt(entry.clicks)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RecentTable({ rows }: { rows: AffiliateStats["recent"] }) {
  if (rows.length === 0) return <Empty />;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="pb-2">When</th>
          <th className="pb-2">Target</th>
          <th className="pb-2">Type</th>
          <th className="pb-2">Source page</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((entry) => (
          <tr key={entry.id} className="border-t border-slate-100">
            <td className="py-2 pr-2 text-xs text-slate-500 tabular-nums">{formatDateTime(entry.createdAt)}</td>
            <td className="py-2 pr-2">
              <div className="font-medium text-slate-900">{entry.label}</div>
              <div className="text-xs text-slate-500">{entry.targetId}</div>
            </td>
            <td className="py-2 pr-2 text-xs uppercase tracking-wide text-slate-500">{entry.targetType}</td>
            <td className="py-2 font-mono text-xs text-slate-700">{entry.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DayBarChart({ days }: { days: AffiliateStats["byDay"] }) {
  if (days.length === 0) return <Empty />;
  const max = Math.max(1, ...days.map((d) => d.clicks));
  return (
    <ul className="space-y-1">
      {days.map((day) => (
        <li key={day.day} className="flex items-center gap-2 text-xs">
          <span className="w-20 shrink-0 font-mono text-slate-500">{day.day}</span>
          <span className="relative h-3 flex-1 overflow-hidden rounded bg-slate-100">
            <span
              className="absolute inset-y-0 left-0 rounded bg-brand-blue/80"
              style={{ width: `${Math.round((day.clicks / max) * 100)}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-right tabular-nums text-slate-700">{day.clicks}</span>
        </li>
      ))}
    </ul>
  );
}

function RangeSelector({ current }: { current: AffiliateRangeDays }) {
  return (
    <nav className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 text-xs">
      {AFFILIATE_RANGE_DAYS.map((range) => {
        const active = range === current;
        return (
          <Link
            key={range}
            href={`/internal/affiliate-clicks?range=${range}`}
            className={
              active
                ? "rounded bg-brand-blue px-3 py-1 font-semibold text-white"
                : "rounded px-3 py-1 font-medium text-slate-600 hover:bg-slate-100"
            }
          >
            {range}d
          </Link>
        );
      })}
    </nav>
  );
}

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}Z`;
}
