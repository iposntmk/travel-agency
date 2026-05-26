import { describe, expect, it } from "vitest";
import type { Access, CollectionConfig, FieldAccess } from "payload";
import { Bookings } from "@/collections/payload/Bookings";
import { Destinations } from "@/collections/payload/Destinations";
import { Media } from "@/collections/payload/Media";
import { Partners } from "@/collections/payload/Partners";
import { Posts } from "@/collections/payload/Posts";
import { Tours } from "@/collections/payload/Tours";
import { Users } from "@/collections/payload/Users";

type PayloadUser = {
  id: number;
  role: "admin" | "editor" | "sales";
};

const adminUser: PayloadUser = { id: 1, role: "admin" };
const editorUser: PayloadUser = { id: 2, role: "editor" };

function accessArgs(user?: PayloadUser): Parameters<Access>[0] {
  return { req: { user } } as Parameters<Access>[0];
}

function fieldAccessArgs(user?: PayloadUser): Parameters<FieldAccess>[0] {
  return { req: { user } } as Parameters<FieldAccess>[0];
}

function callAccess(access: Access | undefined, user?: PayloadUser) {
  expect(access).toBeTypeOf("function");
  return access!(accessArgs(user));
}

function namedField(collection: CollectionConfig, name: string) {
  return collection.fields.find((field) => "name" in field && field.name === name);
}

function fieldReadAccess(collection: CollectionConfig, name: string): FieldAccess {
  const field = namedField(collection, name);
  expect(field).toBeDefined();
  expect("access" in field!).toBe(true);
  const access = "access" in field! ? field.access?.read : undefined;
  expect(access).toBeTypeOf("function");
  return access as FieldAccess;
}

describe("Payload collection access", () => {
  it("filters public content reads to publishable records", () => {
    expect(callAccess(Tours.access?.read)).toEqual({ status: { equals: "active" } });
    expect(callAccess(Posts.access?.read)).toEqual({ status: { equals: "published" } });
    expect(callAccess(Partners.access?.read)).toEqual({ isFeatured: { equals: true } });
    expect(callAccess(Media.access?.read)).toEqual({ status: { equals: "ready" } });
  });

  it("lets staff read full content sets for admin workflows", () => {
    expect(callAccess(Tours.access?.read, editorUser)).toBe(true);
    expect(callAccess(Posts.access?.read, editorUser)).toBe(true);
    expect(callAccess(Partners.access?.read, editorUser)).toBe(true);
    expect(callAccess(Media.access?.read, editorUser)).toBe(true);
  });

  it("keeps internal fields admin-only", () => {
    expect(fieldReadAccess(Bookings, "internalNotes")(fieldAccessArgs(editorUser))).toBe(false);
    expect(fieldReadAccess(Partners, "commissionRate")(fieldAccessArgs(editorUser))).toBe(false);
    expect(fieldReadAccess(Media, "processingError")(fieldAccessArgs(editorUser))).toBe(false);

    expect(fieldReadAccess(Bookings, "internalNotes")(fieldAccessArgs(adminUser))).toBe(true);
    expect(fieldReadAccess(Partners, "commissionRate")(fieldAccessArgs(adminUser))).toBe(true);
    expect(fieldReadAccess(Media, "processingError")(fieldAccessArgs(adminUser))).toBe(true);
  });

  it("exposes the sales role required by booking operations", () => {
    const role = namedField(Users, "role");
    expect(role).toBeDefined();

    const options = "options" in role! ? role.options : [];
    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "admin" }),
        expect.objectContaining({ value: "editor" }),
        expect.objectContaining({ value: "sales" })
      ])
    );
  });

  it("keeps admin media uploads usable without a storage adapter", () => {
    expect(Media.upload).toBe(true);
    expect(namedField(Media, "status")).toMatchObject({ defaultValue: "ready" });
  });

  it("keeps performance indexes on public content filters", () => {
    for (const field of ["status", "tourType", "season", "operationType", "isFeaturedInSeason", "priceFrom"]) {
      expect(namedField(Tours, field)).toMatchObject({ index: true });
    }

    expect(namedField(Posts, "status")).toMatchObject({ index: true });
  });

  it("registers cache invalidation hooks for public content collections", () => {
    expect(Tours.hooks?.afterChange).toHaveLength(1);
    expect(Tours.hooks?.afterDelete).toHaveLength(1);
    expect(Destinations.hooks?.afterChange).toHaveLength(1);
    expect(Destinations.hooks?.afterDelete).toHaveLength(1);
    expect(Posts.hooks?.afterChange).toHaveLength(1);
    expect(Posts.hooks?.afterDelete).toHaveLength(1);
  });
});
