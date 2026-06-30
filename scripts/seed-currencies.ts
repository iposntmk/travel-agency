// One-off: seed the default storefront currencies. Idempotent — upserts by
// `code`, so re-running refreshes rates without creating duplicates. Rates are
// indicative starting values; edit them in the admin afterwards.
// Run: node --env-file=.env --import=tsx/esm scripts/seed-currencies.ts
import { getPayload } from "payload";
import config from "../payload.config";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", rateToBase: 1, decimals: 2, symbolPosition: "before", active: true, isDefault: true, sort: 1 },
  { code: "GBP", name: "British Pound", symbol: "£", rateToBase: 0.79, decimals: 2, symbolPosition: "before", active: true, isDefault: false, sort: 2 },
  { code: "EUR", name: "Euro", symbol: "€", rateToBase: 0.92, decimals: 2, symbolPosition: "before", active: true, isDefault: false, sort: 3 },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", rateToBase: 1.37, decimals: 2, symbolPosition: "before", active: true, isDefault: false, sort: 4 },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  for (const currency of CURRENCIES) {
    const existing = await payload.find({
      collection: "currencies",
      where: { code: { equals: currency.code } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "currencies",
        id: existing.docs[0].id,
        data: currency as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`~ currency ${currency.code} updated`);
    } else {
      await payload.create({
        collection: "currencies",
        data: currency as never,
        overrideAccess: true,
        disableTransaction: true,
      });
      console.log(`+ currency ${currency.code} created`);
    }
  }
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
