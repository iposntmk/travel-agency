import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { getClerkWebhookEnv } from "@/config/env";
import { syncCustomerFromClerkUser } from "@/services/clerk-customer-sync";

export async function POST(req: NextRequest) {
  const env = getClerkWebhookEnv();
  const event = await verifyWebhook(req, { signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET }).catch(() => null);

  if (!event) {
    return NextResponse.json({ ok: false, error: "Invalid Clerk webhook" }, { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const result = await syncCustomerFromClerkUser(event.data);
  return NextResponse.json({ ok: true, data: result });
}
