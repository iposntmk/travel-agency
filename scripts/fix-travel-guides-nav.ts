import config from "../payload.config";
import { getPayload } from "payload";

type NavTarget = "_self" | "_blank";

type NavItem = {
  label?: string;
  href?: string;
  target?: NavTarget;
  children?: NavItem[] | null;
};

const TRAVEL_GUIDES_CHILDREN: NavItem[] = [
  { label: "All Guides", href: "/blog/all", target: "_self" },
  { label: "Hội An", href: "/blog/destination/hoi-an", target: "_self" },
  { label: "Huế", href: "/blog/destination/hue", target: "_self" },
  { label: "Đà Nẵng", href: "/blog/destination/da-nang", target: "_self" },
  { label: "Quảng Trị", href: "/blog/destination/quang-tri", target: "_self" }
];

const PLAN_YOUR_TRIP_CHILDREN: NavItem[] = [
  { label: "Hội An", href: "/blog/destination/hoi-an", target: "_self" },
  { label: "Huế", href: "/blog/destination/hue", target: "_self" },
  { label: "Đà Nẵng", href: "/blog/destination/da-nang", target: "_self" },
  { label: "Quảng Trị", href: "/blog/destination/quang-tri", target: "_self" },
  { label: "Hà Nội", href: "/blog/destination/ha-noi", target: "_self" },
  { label: "Sa Pa", href: "/blog/destination/sa-pa", target: "_self" },
  { label: "Hồ Chí Minh City", href: "/blog/destination/ho-chi-minh-city", target: "_self" },
  { label: "Car rentals", href: "/car-rentals", target: "_self" }
];

function patchHeaderItems(items: NavItem[]): NavItem[] {
  return items.map((item) =>
    item.label === "Travel Guides"
      ? { ...item, href: "/blog", children: TRAVEL_GUIDES_CHILDREN }
      : item
  );
}

function patchFooterItems(items: NavItem[]): NavItem[] {
  return items.map((item) =>
    item.label === "Plan your trip" ? { ...item, children: PLAN_YOUR_TRIP_CHILDREN } : item
  );
}

async function patchLocation(
  payload: Awaited<ReturnType<typeof getPayload>>,
  location: "header" | "footer",
  patch: (items: NavItem[]) => NavItem[],
  label: string
): Promise<void> {
  const result = await payload.find({
    collection: "navigation",
    where: { location: { equals: location } },
    limit: 1,
    depth: 0
  });

  const doc = result.docs[0] as { id: number | string; items?: NavItem[] | null } | undefined;
  if (!doc) {
    console.error(`No ${location} navigation document found.`);
    return;
  }

  await payload.update({
    collection: "navigation",
    id: doc.id,
    data: { items: patch(doc.items ?? []) }
  });
  console.log(`Updated ${label}.`);
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await patchLocation(payload, "header", patchHeaderItems, "header Travel Guides nav children");
  await patchLocation(payload, "footer", patchFooterItems, "footer Plan your trip nav children");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
