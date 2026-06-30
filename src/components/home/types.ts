export interface HomeImage {
  url: string;
  alt: string;
  objectPosition?: string;
}

export interface HeroSlide {
  id: string;
  image: HomeImage;
}

export interface SearchOption {
  label: string;
  value: string;
}

export interface SearchTab {
  label: string;
  target: "tours" | "cruises";
}

export interface SearchConfig {
  tabs: SearchTab[];
  tourTypes: SearchOption[];
  tourDurations: SearchOption[];
  cruiseNights: SearchOption[];
  styles: SearchOption[];
}

export interface HomeTourCardItem {
  id: string;
  title: string;
  href: string;
  image: HomeImage;
  duration: string;
  rating: string;
  reviewsCount: string;
  /** Base-currency amount for live conversion; null when no price set. */
  priceFrom: number | null;
  /** Fallback label shown only when priceFrom is null (e.g. "Ask for price"). */
  price: string;
}

/** CMS-driven copy for a homepage section header (from SiteSettings.homepage). */
export interface HomeSectionCopy {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface HomeDestinationItem {
  id: string;
  title: string;
  href: string;
  image: HomeImage;
}

export interface HomeBlogItem {
  id: string;
  title: string;
  href: string;
  image: HomeImage;
  category: string;
  date: string;
  excerpt: string;
}

export interface HomeReviewItem {
  id: string;
  quote: string;
  rating: number;
  author: string;
  context: string;
}

export interface WhyChooseItem {
  title: string;
  body: string;
  icon?: string;
}

export interface CruiseFeatureItem {
  id: string;
  title: string;
  href: string;
  image: HomeImage;
  summary: string;
}
