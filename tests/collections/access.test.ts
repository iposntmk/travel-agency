import { describe, expect, it } from "vitest";
import { collectionContracts } from "@/collections/contracts";
import type { AccessContext } from "@/types/domain";

const publicUser: AccessContext = { role: "public" };
const salesUser: AccessContext = { role: "sales", userId: "sales-1" };
const adminUser: AccessContext = { role: "admin", userId: "admin-1" };

describe("collection access contracts", () => {
  it("declares access control for all required collections", () => {
    expect(collectionContracts.map((collection) => collection.slug)).toEqual([
      "users",
      "media",
      "destinations",
      "tours",
      "customers",
      "bookings",
      "posts",
      "comments",
      "reviews",
      "partners",
      "promotions",
      "payments"
    ]);
  });

  it("allows public booking creation but blocks public booking reads", () => {
    const bookings = collectionContracts.find((collection) => collection.slug === "bookings");

    expect(bookings?.access.create(publicUser)).toBe(true);
    expect(bookings?.access.read(publicUser)).toBe(false);
    expect(bookings?.access.read(salesUser)).toBe(true);
  });

  it("keeps destructive operations admin-only", () => {
    for (const collection of collectionContracts) {
      expect(collection.access.delete(publicUser)).toBe(false);
      expect(collection.access.delete(adminUser)).toBe(true);
    }
  });
});
