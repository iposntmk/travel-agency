type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdData =
  | JsonLdPrimitive
  | JsonLdData[]
  | {
      [key: string]: JsonLdData | undefined;
    };

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface TourSchemaInput {
  title: string;
  url: string;
  description: string;
  image?: string;
  priceFrom?: number | null;
  currency?: string | null;
  tourType?: string | null;
}

interface DestinationSchemaInput {
  title: string;
  url: string;
  description: string;
  image?: string;
}

interface BlogPostingSchemaInput {
  title: string;
  url: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

interface ItemListEntry {
  name: string;
  url: string;
}

export function absoluteUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLdScriptContent(data: JsonLdData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(baseUrl: string): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "TC Travel Vietnam",
    url: baseUrl,
    areaServed: ["Hoi An", "Hue", "Da Nang", "Central Vietnam"]
  };
}

export function webSiteJsonLd(baseUrl: string): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TC Travel Vietnam",
    url: baseUrl
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function tourProductJsonLd(input: TourSchemaInput): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    additionalType: "https://schema.org/TouristTrip",
    name: input.title,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    ...(input.tourType ? { category: input.tourType.replace(/-/g, " ") } : {}),
    brand: {
      "@type": "TravelAgency",
      name: "TC Travel Vietnam"
    },
    ...(input.priceFrom === undefined || input.priceFrom === null
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: input.priceFrom,
            priceCurrency: input.currency ?? "USD",
            availability: "https://schema.org/InStock",
            url: input.url
          }
        })
  };
}

export function touristDestinationJsonLd(input: DestinationSchemaInput): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: input.title,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {})
  };
}

export function blogPostingJsonLd(input: BlogPostingSchemaInput): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntityOfPage: input.url,
    publisher: {
      "@type": "TravelAgency",
      name: "TC Travel Vietnam"
    }
  };
}

export function itemListJsonLd(entries: ItemListEntry[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.url
    }))
  };
}

export function bookingConfirmationJsonLd(url: string): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "EventReservation",
    reservationStatus: "https://schema.org/ReservationPending",
    url,
    provider: {
      "@type": "TravelAgency",
      name: "TC Travel Vietnam"
    }
  };
}
