export const bookingStatuses = [
  "Pending",
  "Confirmed - Pay Later",
  "Confirmed - Paid",
  "Completed",
  "Cancelled"
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];
export type BookingSource = "direct" | "free-tour-upsell" | "blog-cta" | "social" | "ota";
export type ContactChannel = "whatsapp" | "email" | "zalo" | "phone";
export type UserRole = "public" | "authenticated" | "sales" | "editor" | "admin";

export type AccessContext = {
  role: UserRole;
  userId?: string;
};

export type StatusHistoryEntry = {
  from: BookingStatus | "New";
  to: BookingStatus;
  actor: string;
  reason?: string;
  source: "server-action" | "admin" | "sales" | "webhook" | "seed";
  createdAt: string;
};

export type BookingRecord = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  tourSlug: string;
  numPax: number;
  preferredDate: string;
  contactChannel: ContactChannel;
  specialRequest?: string;
  source: BookingSource;
  status: BookingStatus;
  idempotencyKey: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};
