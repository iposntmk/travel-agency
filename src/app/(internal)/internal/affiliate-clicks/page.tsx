import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { loadAffiliateStats, parseAffiliateRange } from "@/services/affiliate-stats";
import { AffiliateDashboard } from "./affiliate-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AffiliateClicksDashboardPage({ searchParams }: PageProps) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    redirect("/admin/login?redirect=/internal/affiliate-clicks");
  }

  if (!isAdminUser(user)) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-900">Not authorised</h1>
        <p className="mt-2 text-sm text-slate-600">
          This dashboard is restricted to admin users. Ask an admin to update your role in the Payload
          users collection.
        </p>
      </section>
    );
  }

  const params = await searchParams;
  const range = parseAffiliateRange(params.range);
  const stats = await loadAffiliateStats(payload, range);

  return <AffiliateDashboard stats={stats} range={range} />;
}

function isAdminUser(user: unknown): boolean {
  if (!user || typeof user !== "object" || !("role" in user)) return false;
  return (user as { role: unknown }).role === "admin";
}
