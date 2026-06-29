export interface GoodToKnowItem {
  title: string;
  content: string;
}

// Generic pre-trip info shared by every tour. Surfaced in the "Good to know"
// accordion and emitted as FAQPage structured data so AI/search engines can
// extract direct answers.
export const GOOD_TO_KNOW_DATA: readonly GoodToKnowItem[] = [
  { title: "Passport & Visa", content: "Your passport must be valid for at least six months beyond your date of arrival in Vietnam and contain a minimum of two blank pages." },
  { title: "International flights", content: "International flights are not included in the price of our tours. You are free to choose and book the flights that best suit your needs." },
  { title: "Travel insurance", content: "Valid travel insurance is mandatory to participate in the tour. It must cover emergency medical expenses, trip cancellations, and activities included in your itinerary." },
  { title: "Weather & best time", content: "Spring (Feb–Apr) and autumn (Sep–Dec) are the most pleasant seasons to visit Vietnam, with mild weather and limited rainfall." },
  { title: "Time zone", content: "Vietnam operates on GMT+7 year-round. There is no seasonal time change." },
  { title: "Currency & payments", content: "The local currency is the Vietnamese Dong (VND). Credit cards (Visa, MasterCard) are accepted in most mid-range to high-end hotels and restaurants." },
  { title: "Airport pick-up", content: "Our driver will be waiting at the arrival hall exit, holding a sign with 'TC Travel — [Your Name]'. For any assistance, call our 24/7 hotline." }
] as const;
