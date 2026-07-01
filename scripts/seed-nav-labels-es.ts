/**
 * Translate Navigation labels into Spanish (es locale). Only the `label`
 * subfield is localized (the `items`/`children` arrays are not), so we keep
 * every row id/href/target and rewrite labels by matching the English text.
 *
 * Idempotent: unknown labels are left as-is. Run:
 *   node --env-file=.env --import=tsx/esm scripts/seed-nav-labels-es.ts
 */
import { getPayload } from "payload";
import config from "../payload.config";

const ES: Record<string, string> = {
  "Tours": "Tours",
  "Destinations": "Destinos",
  "Car Rental": "Alquiler de coches",
  "Car Rentals": "Alquiler de coches",
  "Cruises": "Cruceros",
  "Travel Guides": "Guía de viaje",
  "Blog": "Guía de viaje",
  "About": "Quiénes somos",
  "About Us": "Quiénes somos",
  "Contact": "Contacto",
  "Contact Us": "Contacto",
  "Customize Tour": "Personalizar viaje",
  "Customize Your Trip": "Personaliza tu viaje",
  "Free Tours": "Tours gratis",
  "Home": "Inicio",
  "Quick Links": "Enlaces rápidos",
  "Follow Us": "Síguenos"
};

type Row = { label?: string; children?: Row[] | null; [k: string]: unknown };

function translateRows(rows: Row[] | null | undefined): Row[] {
  return (rows ?? []).map((row) => ({
    ...row,
    label: row.label && ES[row.label] ? ES[row.label] : row.label,
    ...(row.children ? { children: translateRows(row.children) } : {})
  }));
}

async function main() {
  const payload = await getPayload({ config });
  const docs = await payload.find({ collection: "navigation" as never, locale: "en", limit: 50, depth: 0 });

  let updated = 0;
  for (const doc of docs.docs as Array<{ id: number | string; name?: string; items?: Row[] }>) {
    const items = translateRows(doc.items);
    try {
      await payload.update({
        collection: "navigation" as never,
        id: doc.id,
        locale: "es" as never,
        data: { items } as never
      });
      updated++;
      console.log(`[nav] ${doc.name ?? doc.id} → es labels written (${items.length} items)`);
    } catch (err) {
      console.warn(`  ! navigation#${doc.id} [es] failed: ${String(err)}`);
    }
  }

  console.log(`\nDone. Updated ${updated} navigation docs.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
