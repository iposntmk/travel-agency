// One-off: seed default homepage search form config into the existing
// site-settings doc. Partial update — only `searchForm` is written, every other
// field is left untouched. Run: node --env-file=.env --import=tsx/esm scripts/seed-search-form.ts
import { getPayload } from "payload";
import config from "../payload.config";

const searchForm = {
  tabs: [
    { label: "Tours", target: "tours" },
    { label: "Halong Bay Cruises", target: "cruises" },
    { label: "Mekong River Cruises", target: "cruises" },
  ],
  tourTypes: [
    { label: "Private Tour", value: "paid-private" },
    { label: "Group Tour", value: "paid-group" },
    { label: "Family Tour", value: "family" },
    { label: "Adventure Tour", value: "adventure" },
    { label: "Cultural Tour", value: "cultural" },
  ],
  tourDurations: [
    { label: "1-5 Days", value: "1-5" },
    { label: "6-10 Days", value: "6-10" },
    { label: "11-15 Days", value: "11-15" },
    { label: "16+ Days", value: "16-" },
  ],
  cruiseNights: [
    { label: "1 Night", value: "1" },
    { label: "2 Nights", value: "2" },
    { label: "3 Nights", value: "3" },
  ],
  styles: [
    { label: "Culture", value: "culture" },
    { label: "Food", value: "food" },
    { label: "Family", value: "family" },
    { label: "Adventure", value: "adventure" },
    { label: "Nature", value: "nature" },
    { label: "History", value: "history" },
  ],
};

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const existing = await payload.find({ collection: "site-settings", limit: 1, depth: 0, overrideAccess: true });
  const doc = existing.docs[0];
  if (!doc) {
    throw new Error("No site-settings doc found. Run `pnpm seed` first.");
  }
  await payload.update({
    collection: "site-settings",
    id: doc.id,
    data: { searchForm } as never,
    overrideAccess: true,
    disableTransaction: true,
  });
  console.log("~ site-settings.searchForm seeded");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
