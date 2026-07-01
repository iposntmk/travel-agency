/**
 * Translate Navigation labels (header + footer) into every non-English locale
 * EXCEPT zh-Hans / zh-Hant (intentionally skipped for now).
 *
 * Only the `label` subfield of each nav row is localized; ids/href/target and
 * the rows themselves are preserved. Vietnamese place names (Hội An, Huế, …) are
 * intentionally left untranslated — they are proper nouns. Unknown labels pass
 * through unchanged, so this is safe + idempotent.
 *
 * Run: node --env-file=.env --import=tsx/esm scripts/seed-nav-labels-all.ts
 */
import { getPayload } from "payload";
import config from "../payload.config";

type Locale = "es" | "fr" | "de" | "it" | "pt";

// zh-Hans / zh-Hant deliberately omitted per current scope.
const TARGET_LOCALES: Locale[] = ["es", "fr", "de", "it", "pt"];

// English label → per-locale translation. Every case variant that appears in the
// seeded navigation is listed explicitly so nothing falls through to English.
const DICT: Record<string, Record<Locale, string>> = {
  // Header top-level + generic
  Tours: { es: "Tours", fr: "Circuits", de: "Touren", it: "Tour", pt: "Passeios" },
  Destinations: { es: "Destinos", fr: "Destinations", de: "Reiseziele", it: "Destinazioni", pt: "Destinos" },
  "Car Rental": { es: "Alquiler de coches", fr: "Location de voiture", de: "Autovermietung", it: "Noleggio auto", pt: "Aluguer de carros" },
  "Car Rentals": { es: "Alquiler de coches", fr: "Location de voiture", de: "Autovermietung", it: "Noleggio auto", pt: "Aluguer de carros" },
  "Car rentals": { es: "Alquiler de coches", fr: "Location de voiture", de: "Autovermietung", it: "Noleggio auto", pt: "Aluguer de carros" },
  "Travel Guides": { es: "Guías de viaje", fr: "Guides de voyage", de: "Reiseführer", it: "Guide di viaggio", pt: "Guias de viagem" },
  "Travel blog": { es: "Blog de viajes", fr: "Blog de voyage", de: "Reiseblog", it: "Blog di viaggio", pt: "Blog de viagem" },
  Blog: { es: "Guía de viaje", fr: "Guide de voyage", de: "Reiseführer", it: "Guida di viaggio", pt: "Guia de viagem" },
  Cruises: { es: "Cruceros", fr: "Croisières", de: "Kreuzfahrten", it: "Crociere", pt: "Cruzeiros" },
  About: { es: "Quiénes somos", fr: "À propos", de: "Über uns", it: "Chi siamo", pt: "Sobre nós" },
  "About Us": { es: "Quiénes somos", fr: "À propos", de: "Über uns", it: "Chi siamo", pt: "Sobre nós" },
  "About us": { es: "Quiénes somos", fr: "À propos", de: "Über uns", it: "Chi siamo", pt: "Sobre nós" },
  Contact: { es: "Contacto", fr: "Contact", de: "Kontakt", it: "Contatti", pt: "Contacto" },
  "Contact Us": { es: "Contacto", fr: "Contact", de: "Kontakt", it: "Contatti", pt: "Contacto" },
  "Customize Tour": { es: "Personalizar viaje", fr: "Personnaliser le voyage", de: "Reise anpassen", it: "Personalizza il viaggio", pt: "Personalizar viagem" },
  "Customize tour": { es: "Personalizar viaje", fr: "Personnaliser le voyage", de: "Reise anpassen", it: "Personalizza il viaggio", pt: "Personalizar viagem" },
  "Customize Your Trip": { es: "Personaliza tu viaje", fr: "Personnalisez votre voyage", de: "Gestalte deine Reise", it: "Personalizza il tuo viaggio", pt: "Personalize a sua viagem" },
  "Free Tours": { es: "Tours gratis", fr: "Circuits gratuits", de: "Kostenlose Touren", it: "Tour gratuiti", pt: "Passeios gratuitos" },
  "Free tours": { es: "Tours gratis", fr: "Circuits gratuits", de: "Kostenlose Touren", it: "Tour gratuiti", pt: "Passeios gratuitos" },

  // Header submenu items
  "All Tours": { es: "Todos los tours", fr: "Tous les circuits", de: "Alle Touren", it: "Tutti i tour", pt: "Todos os passeios" },
  "All tours": { es: "Todos los tours", fr: "Tous les circuits", de: "Alle Touren", it: "Tutti i tour", pt: "Todos os passeios" },
  "Private Tours": { es: "Tours privados", fr: "Circuits privés", de: "Private Touren", it: "Tour privati", pt: "Passeios privados" },
  "Small Group": { es: "Grupo reducido", fr: "Petit groupe", de: "Kleingruppe", it: "Piccolo gruppo", pt: "Pequeno grupo" },
  "All Destinations": { es: "Todos los destinos", fr: "Toutes les destinations", de: "Alle Reiseziele", it: "Tutte le destinazioni", pt: "Todos os destinos" },
  "All Vehicles": { es: "Todos los vehículos", fr: "Tous les véhicules", de: "Alle Fahrzeuge", it: "Tutti i veicoli", pt: "Todos os veículos" },
  "All Guides": { es: "Todas las guías", fr: "Tous les guides", de: "Alle Reiseführer", it: "Tutte le guide", pt: "Todos os guias" },

  // Footer column headings
  Explore: { es: "Explorar", fr: "Explorer", de: "Entdecken", it: "Esplora", pt: "Explorar" },
  "Plan your trip": { es: "Planifica tu viaje", fr: "Planifiez votre voyage", de: "Reise planen", it: "Pianifica il viaggio", pt: "Planeie a sua viagem" },
  Company: { es: "Empresa", fr: "Entreprise", de: "Unternehmen", it: "Azienda", pt: "Empresa" },
  "Quick Links": { es: "Enlaces rápidos", fr: "Liens rapides", de: "Schnelllinks", it: "Link rapidi", pt: "Ligações rápidas" },
  "Follow Us": { es: "Síguenos", fr: "Suivez-nous", de: "Folgen Sie uns", it: "Seguici", pt: "Siga-nos" },
  Home: { es: "Inicio", fr: "Accueil", de: "Startseite", it: "Home", pt: "Início" },

  // The only place name carrying an English word ("City") — localise the word,
  // keep the rest of the VN place names untouched.
  "Hồ Chí Minh City": { es: "Ciudad Ho Chi Minh", fr: "Hô Chi Minh-Ville", de: "Ho-Chi-Minh-Stadt", it: "Città di Ho Chi Minh", pt: "Cidade de Ho Chi Minh" }
};

type Row = { label?: string; children?: Row[] | null; [k: string]: unknown };

function translateRows(rows: Row[] | null | undefined, locale: Locale): Row[] {
  return (rows ?? []).map((row) => ({
    ...row,
    label: row.label && DICT[row.label] ? DICT[row.label][locale] : row.label,
    ...(row.children ? { children: translateRows(row.children, locale) } : {})
  }));
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const docs = await payload.find({ collection: "navigation" as never, locale: "en", limit: 50, depth: 0 });

  let updated = 0;
  for (const doc of docs.docs as Array<{ id: number | string; name?: string; items?: Row[] }>) {
    for (const locale of TARGET_LOCALES) {
      const items = translateRows(doc.items, locale);
      try {
        await payload.update({
          collection: "navigation" as never,
          id: doc.id,
          locale: locale as never,
          data: { items } as never
        });
        updated++;
        console.log(`  ~ ${doc.name ?? doc.id} [${locale}] labels written (${items.length} items)`);
      } catch (err) {
        console.warn(`  ! navigation#${doc.id} [${locale}] failed: ${String(err)}`);
      }
    }
  }

  console.log(`\nDone. ${updated} (doc × locale) updates. zh-Hans/zh-Hant skipped by design.`);
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
