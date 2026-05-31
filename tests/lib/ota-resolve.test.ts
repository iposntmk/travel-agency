import { describe, expect, it } from "vitest";
import {
  buildOtaUrl,
  otaProviderLabel,
  resolveOtaProvider,
  resolveOtaWidgets,
  type OtaConfig
} from "@/lib/ota-providers";

describe("resolveOtaProvider", () => {
  it("falls back to the code URL and label when no CMS override is given", () => {
    const widget = resolveOtaProvider("getyourguide", "Hội An");
    expect(widget.url).toBe(buildOtaUrl("getyourguide", "Hội An"));
    expect(widget.label).toBe(otaProviderLabel("getyourguide"));
    expect(widget.targetId).toBe("getyourguide:hoi-an");
  });

  it("injects the {city} token (URL-encoded) into a CMS urlTemplate and applies label override", () => {
    const widget = resolveOtaProvider("viator", "Nha Trang", {
      key: "viator",
      label: "Viator Partner",
      urlTemplate: "https://viator.com/s?q={city}&pid=ABC123"
    });
    expect(widget.label).toBe("Viator Partner");
    expect(widget.url).toBe(`https://viator.com/s?q=${encodeURIComponent("Nha Trang")}&pid=ABC123`);
    // tracking id is unchanged regardless of affiliate URL
    expect(widget.targetId).toBe("viator:nha-trang");
  });
});

describe("resolveOtaWidgets", () => {
  it("returns nothing when settings are absent", () => {
    expect(resolveOtaWidgets(null, "home", "Huế")).toEqual([]);
    expect(resolveOtaWidgets(undefined, "destination", "Huế")).toEqual([]);
    expect(resolveOtaWidgets(null, "tour", "Huế")).toEqual([]);
  });

  it("returns nothing when the master switch is off", () => {
    const ota: OtaConfig = { enabled: false };
    expect(resolveOtaWidgets(ota, "home", "Huế")).toEqual([]);
  });

  it("returns nothing when a placement is missing or disabled", () => {
    expect(resolveOtaWidgets({ enabled: true }, "tour", "Huế")).toEqual([]);

    const ota: OtaConfig = { enabled: true, placements: { tour: { enabled: false } } };
    expect(resolveOtaWidgets(ota, "tour", "Huế")).toEqual([]);
  });

  it("honors placement provider selection and skips disabled providers", () => {
    const ota: OtaConfig = {
      enabled: true,
      providers: [
        { key: "getyourguide", enabled: false },
        { key: "klook", enabled: true, urlTemplate: "https://klook.com/s?q={city}&aff=Z9" }
      ],
      placements: {
        home: { enabled: true, providers: ["getyourguide", "klook"] }
      }
    };
    const widgets = resolveOtaWidgets(ota, "home", "Hội An");
    // getyourguide is disabled in the catalog → skipped; klook remains with affiliate URL
    expect(widgets.map((w) => w.key)).toEqual(["klook"]);
    expect(widgets[0].url).toBe(`https://klook.com/s?q=${encodeURIComponent("Hội An")}&aff=Z9`);
  });

  it("falls back to default providers when a placement selects none", () => {
    const ota: OtaConfig = { enabled: true, placements: { home: { enabled: true, providers: [] } } };
    expect(resolveOtaWidgets(ota, "home", "Huế").map((w) => w.key)).toEqual(["getyourguide"]);
  });

  it("applies a placement heading override with {city} substitution", () => {
    const ota: OtaConfig = {
      enabled: true,
      placements: { destination: { enabled: true, heading: "Tours in {city}" } }
    };
    const widgets = resolveOtaWidgets(ota, "destination", "Huế");
    expect(widgets[0].heading).toBe("Tours in Huế");
  });
});
