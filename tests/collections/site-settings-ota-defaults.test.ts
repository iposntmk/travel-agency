import { describe, expect, it } from "vitest";
import type { Field } from "payload";
import { otaField } from "@/collections/payload/fields/ota-fields";

type NamedField = Field & {
  name: string;
  fields?: Field[];
  defaultValue?: unknown;
};

function isNamedField(field: Field): field is NamedField {
  return "name" in field && typeof field.name === "string";
}

function namedField(fields: Field[], name: string): NamedField {
  const field = fields.find((candidate): candidate is NamedField => isNamedField(candidate) && candidate.name === name);
  expect(field).toBeDefined();
  return field!;
}

describe("SiteSettings OTA defaults", () => {
  it("keeps OTA master and placements disabled until staff explicitly enables them", () => {
    const ota = otaField as NamedField;

    expect(namedField(ota.fields ?? [], "enabled").defaultValue).toBe(false);

    const placements = namedField(ota.fields ?? [], "placements");
    for (const placement of ["home", "destination", "tour"]) {
      const placementGroup = namedField(placements.fields ?? [], placement);
      expect(namedField(placementGroup.fields ?? [], "enabled").defaultValue).toBe(false);
    }
  });
});
