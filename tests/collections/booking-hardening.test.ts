import { describe, expect, it } from "vitest";
import { hardenBookingBeforeValidate } from "@/collections/payload/hooks/booking-hardening";

type HookArgs = Parameters<typeof hardenBookingBeforeValidate>[0];

function hookArgs(data: HookArgs["data"], payloadAPI: HookArgs["req"]["payloadAPI"] = "REST"): HookArgs {
  return {
    data,
    operation: "create",
    req: { payloadAPI },
    context: {},
    collection: {}
  } as HookArgs;
}

describe("booking hardening hook", () => {
  it("forces public API creates into the initial Pending state", async () => {
    const result = await hardenBookingBeforeValidate(
      hookArgs({
        status: "Confirmed - Paid",
        specialRequest: "<strong>Vegan meal</strong><script>alert(1)</script>",
        statusHistory: [{ from: "Pending", to: "Confirmed - Paid", actor: "public", source: "admin" }]
      })
    );

    expect(result.status).toBe("Pending");
    expect(result.specialRequest).toBe("Vegan meal");
    expect(result.statusHistory).toMatchObject([
      {
        from: "New",
        to: "Pending",
        actor: "public",
        source: "server-action"
      }
    ]);
  });

  it("does not rewrite local API seed states", async () => {
    const result = await hardenBookingBeforeValidate(
      hookArgs(
        {
          status: "Confirmed - Paid",
          statusHistory: [{ from: "Pending", to: "Confirmed - Paid", actor: "seed", source: "seed" }]
        },
        "local"
      )
    );

    expect(result.status).toBe("Confirmed - Paid");
    expect(result.statusHistory).toMatchObject([{ to: "Confirmed - Paid", actor: "seed" }]);
  });
});
