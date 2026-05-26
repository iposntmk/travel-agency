import "server-only";

import type { Payload } from "payload";
import { getPayloadClient } from "@/lib/payload";
import type { Booking, Customer, Tour } from "@/payload-types";
import { bookingStatuses, type BookingRecord, type BookingStatus, type StatusHistoryEntry } from "@/types/domain";

type CreateBookingResult = {
  booking: BookingRecord;
  duplicate: boolean;
};

type Relationship<T extends { id: number | string }> = number | string | T | null | undefined;

const statusSet = new Set<string>(bookingStatuses);
const historySources: StatusHistoryEntry["source"][] = ["server-action", "admin", "sales", "webhook", "seed"];

export async function createBookingOnce(booking: BookingRecord): Promise<CreateBookingResult> {
  const payload = await getPayloadClient();
  const existing = await findBookingByIdempotencyKey(payload, booking.idempotencyKey);

  if (existing) {
    return { booking: toBookingRecord(existing, booking), duplicate: true };
  }

  const [tour, customer] = await Promise.all([
    findActiveTourBySlug(payload, booking.tourSlug),
    findOrCreateCustomer(payload, booking)
  ]);

  try {
    const created = await payload.create({
      collection: "bookings",
      depth: 1,
      overrideAccess: true,
      data: {
        customer: customer.id,
        tour: tour.id,
        numPax: booking.numPax,
        preferredDate: booking.preferredDate,
        specialRequest: booking.specialRequest,
        contactChannel: booking.contactChannel,
        status: "Pending",
        idempotencyKey: booking.idempotencyKey,
        source: booking.source,
        statusHistory: booking.statusHistory
      }
    });

    // TODO: Phase 5 Payment Gateway Hook
    return { booking: toBookingRecord(created, booking), duplicate: false };
  } catch (error) {
    if (isDuplicateIdempotencyError(error)) {
      const duplicate = await findBookingByIdempotencyKey(payload, booking.idempotencyKey);
      if (duplicate) {
        return { booking: toBookingRecord(duplicate, booking), duplicate: true };
      }
    }

    throw error;
  }
}

async function findBookingByIdempotencyKey(payload: Payload, idempotencyKey: string): Promise<Booking | null> {
  const result = await payload.find({
    collection: "bookings",
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where: { idempotencyKey: { equals: idempotencyKey } }
  });

  return result.docs[0] ?? null;
}

async function findActiveTourBySlug(payload: Payload, slug: string): Promise<Tour> {
  const result = await payload.find({
    collection: "tours",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "active" } }]
    }
  });

  const tour = result.docs[0];
  if (!tour) {
    throw new Error(`Active tour not found for booking: ${slug}`);
  }

  return tour;
}

async function findOrCreateCustomer(payload: Payload, booking: BookingRecord): Promise<Customer> {
  const existing = await findCustomerByEmail(payload, booking.email);

  if (existing) {
    return existing;
  }

  try {
    return await payload.create({
      collection: "customers",
      depth: 0,
      overrideAccess: true,
      data: {
        name: booking.customerName,
        email: booking.email,
        phone: booking.phone,
        preferredContactChannel: booking.contactChannel
      }
    });
  } catch (error) {
    if (isDuplicateCustomerError(error)) {
      const duplicate = await findCustomerByEmail(payload, booking.email);
      if (duplicate) {
        return duplicate;
      }
    }

    throw error;
  }
}

async function findCustomerByEmail(payload: Payload, email: string): Promise<Customer | null> {
  const result = await payload.find({
    collection: "customers",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } }
  });

  return result.docs[0] ?? null;
}

function toBookingRecord(booking: Booking, fallback: BookingRecord): BookingRecord {
  const customer = relationshipDoc<Customer>(booking.customer);
  const tour = relationshipDoc<Tour>(booking.tour);

  return {
    id: String(booking.id),
    customerName: customer?.name ?? fallback.customerName,
    email: customer?.email ?? fallback.email,
    phone: customer?.phone ?? fallback.phone,
    tourSlug: tour?.slug ?? fallback.tourSlug,
    numPax: booking.numPax,
    preferredDate: booking.preferredDate,
    contactChannel: booking.contactChannel ?? fallback.contactChannel,
    specialRequest: booking.specialRequest ?? undefined,
    source: booking.source ?? fallback.source,
    status: booking.status,
    idempotencyKey: booking.idempotencyKey,
    statusHistory: normalizeStatusHistory(booking.statusHistory, fallback.statusHistory),
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}

function relationshipDoc<T extends { id: number | string }>(relationship: Relationship<T>): T | undefined {
  return typeof relationship === "object" && relationship !== null ? relationship : undefined;
}

function normalizeStatusHistory(
  history: Booking["statusHistory"],
  fallback: StatusHistoryEntry[]
): StatusHistoryEntry[] {
  if (!history?.length) {
    return fallback;
  }

  return history.map((entry) => ({
    from: normalizeFromStatus(entry.from),
    to: normalizeBookingStatus(entry.to),
    actor: entry.actor ?? "system",
    reason: entry.reason ?? undefined,
    source: normalizeHistorySource(entry.source),
    createdAt: entry.createdAt ?? new Date().toISOString()
  }));
}

function normalizeFromStatus(value: string | null | undefined): BookingStatus | "New" {
  return value === "New" || isBookingStatus(value) ? value : "New";
}

function normalizeBookingStatus(value: string): BookingStatus {
  return isBookingStatus(value) ? value : "Pending";
}

function isBookingStatus(value: string | null | undefined): value is BookingStatus {
  return typeof value === "string" && statusSet.has(value);
}

function normalizeHistorySource(value: string | null | undefined): StatusHistoryEntry["source"] {
  return historySources.includes(value as StatusHistoryEntry["source"])
    ? (value as StatusHistoryEntry["source"])
    : "server-action";
}

function isDuplicateIdempotencyError(error: unknown): boolean {
  return isPostgresUniqueError(error) || errorMessage(error).includes("idempotency");
}

function isDuplicateCustomerError(error: unknown): boolean {
  return isPostgresUniqueError(error) || errorMessage(error).includes("email");
}

function isPostgresUniqueError(error: unknown): boolean {
  return errorValue(error, "code") === "23505";
}

function errorMessage(error: unknown): string {
  const message = errorValue(error, "message");
  return typeof message === "string" ? message.toLowerCase() : "";
}

function errorValue(error: unknown, key: string): unknown {
  return typeof error === "object" && error !== null && key in error ? error[key as keyof typeof error] : undefined;
}
