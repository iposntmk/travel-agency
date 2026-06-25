import { describe, expect, it } from "vitest";
import {
  normalizeNavigationHref,
  validateNavigationHref,
  validateOptionalNavigationHref
} from "@/collections/payload/fields/navigation-href";

describe("navigation href validation", () => {
  it("normalizes internal menu URLs before persistence", () => {
    expect(normalizeNavigationHref("/Car-Rentals/Sedan/")).toBe("/car-rentals/sedan");
    expect(normalizeNavigationHref("/thue_xe_sedan")).toBe("/thue-xe-sedan");
    expect(normalizeNavigationHref("/thue xe giá rẻ")).toBe("/thue-xe-gia-re");
  });

  it("allows root-relative internal links and https external links", () => {
    expect(validateNavigationHref("/car-rentals/sedan")).toBe(true);
    expect(validateNavigationHref("https://partner.com")).toBe(true);
  });

  it("rejects empty, fake, unsafe, and query-string menu links", () => {
    for (const href of ["", "#", "/car-rentals?type=sedan", "javascript:void(0)", "google.com", "http://google.com"]) {
      expect(validateNavigationHref(href)).not.toBe(true);
    }
  });

  it("allows omitted top-level hrefs for parent menu groups", () => {
    expect(validateOptionalNavigationHref(undefined)).toBe(true);
    expect(validateOptionalNavigationHref("/destinations")).toBe(true);
    expect(validateOptionalNavigationHref("google.com")).not.toBe(true);
  });
});
