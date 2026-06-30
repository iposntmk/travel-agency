// One-off: seed the newly added homepage copy fields (Who we are block,
// Featured Tours tab label, Testimonials header) into the existing site-settings
// doc. Deep-merges into homepage so other section copy is preserved.
// Run: node --env-file=.env --import=tsx/esm scripts/seed-homepage-copy.ts
import { getPayload } from "payload";
import config from "../payload.config";

const WHO_WE_ARE = {
  enabled: true,
  heading: "Who we are",
  title: "A Vietnam travel agency built around local knowledge.",
  body: "TC Travel Vietnam designs private tours, small-group experiences, car transfers, cruises, and custom proposals with direct support from local specialists.",
  actionLabel: "Meet Our Team",
  actionHref: "/about-us",
};

const TESTIMONIALS = {
  eyebrow: "Reviews",
  title: "What Clients Say About Us",
  subtitle: "Local team, clear pay-later booking, and verified traveller feedback across tours and transfers.",
};

const FEATURED_TOURS_TAB_LABEL = "PRIVATE TOURS";

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const existing = await payload.find({ collection: "site-settings", limit: 1, depth: 0, overrideAccess: true });
  const doc = existing.docs[0];
  if (!doc) {
    throw new Error("No site-settings doc found. Run `pnpm seed` first.");
  }

  const homepage = (doc as unknown as { homepage?: Record<string, Record<string, unknown>> }).homepage ?? {};
  const merged = {
    ...homepage,
    whoWeAre: { ...(homepage.whoWeAre ?? {}), ...WHO_WE_ARE },
    featuredTours: { ...(homepage.featuredTours ?? {}), tabLabel: FEATURED_TOURS_TAB_LABEL },
    testimonials: { enabled: true, ...(homepage.testimonials ?? {}), ...TESTIMONIALS },
  };

  await payload.update({
    collection: "site-settings",
    id: doc.id,
    data: { homepage: merged } as never,
    overrideAccess: true,
    disableTransaction: true,
  });
  console.log("~ homepage copy seeded (whoWeAre, featuredTours.tabLabel, testimonials)");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
