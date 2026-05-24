import type { BookingRecord } from "@/types/domain";

const bookingsByIdempotencyKey = new Map<string, BookingRecord>();

export async function createBookingOnce(
  booking: BookingRecord
): Promise<{ booking: BookingRecord; duplicate: boolean }> {
  const existing = bookingsByIdempotencyKey.get(booking.idempotencyKey);

  if (existing) {
    return { booking: existing, duplicate: true };
  }

  bookingsByIdempotencyKey.set(booking.idempotencyKey, booking);
  return { booking, duplicate: false };
}

export async function listBookings(): Promise<BookingRecord[]> {
  return Array.from(bookingsByIdempotencyKey.values());
}

export function resetBookings(): void {
  bookingsByIdempotencyKey.clear();
}
