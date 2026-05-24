import type { BookingRecord, BookingStatus, StatusHistoryEntry } from "@/types/domain";

const allowedTransitions: Record<BookingStatus | "New", BookingStatus[]> = {
  New: ["Pending"],
  Pending: ["Confirmed - Pay Later", "Cancelled"],
  "Confirmed - Pay Later": ["Confirmed - Paid", "Cancelled"],
  "Confirmed - Paid": ["Completed"],
  Completed: [],
  Cancelled: []
};

export function canTransitionBooking(from: BookingStatus | "New", to: BookingStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function createInitialStatusHistory(actor = "public"): StatusHistoryEntry[] {
  return [
    {
      from: "New",
      to: "Pending",
      actor,
      source: "server-action",
      createdAt: new Date().toISOString()
    }
  ];
}

export function transitionBookingStatus(
  booking: BookingRecord,
  to: BookingStatus,
  options: {
    actor: string;
    source: StatusHistoryEntry["source"];
    reason?: string;
    allowAdminReverse?: boolean;
  }
): BookingRecord {
  const from = booking.status;
  const isAllowed = canTransitionBooking(from, to);

  if (!isAllowed && !options.allowAdminReverse) {
    throw new Error(`Invalid booking transition: ${from} -> ${to}`);
  }

  if (!isAllowed && options.allowAdminReverse && !options.reason) {
    throw new Error("Admin reverse transitions require an audit reason");
  }

  const now = new Date().toISOString();

  return {
    ...booking,
    status: to,
    updatedAt: now,
    statusHistory: [
      ...booking.statusHistory,
      {
        from,
        to,
        actor: options.actor,
        source: options.source,
        reason: options.reason,
        createdAt: now
      }
    ]
  };
}
