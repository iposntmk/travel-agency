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

export interface HomeTourCardItem {
  id: string;
  title: string;
  href: string;
  image: HomeImage;
  duration: string;
  rating: string;
  reviewsCount: string;
  price: string;
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
