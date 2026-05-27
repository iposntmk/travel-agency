import { readFileSync } from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import config from "../payload.config";

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env");
  const raw = readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API = "https://api.clerk.com/v1";

if (!CLERK_SECRET_KEY) {
  console.error("Missing CLERK_SECRET_KEY in .env");
  process.exit(1);
}

interface ClerkUser {
  id: string;
  primary_email_address_id: string | null;
  email_addresses: { id: string; email_address: string }[];
}

async function clerkFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CLERK_API}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Clerk ${init.method ?? "GET"} ${endpoint} failed (${res.status}): ${text}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function clerkCreateUser(email: string, password: string): Promise<ClerkUser> {
  return clerkFetch<ClerkUser>("/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: "QA",
      last_name: "Sync",
      skip_password_checks: true,
      skip_password_requirement: true
    })
  });
}

async function clerkDeleteUser(userId: string): Promise<void> {
  await clerkFetch(`/users/${userId}`, { method: "DELETE" });
}

async function main() {
  const stamp = Date.now();
  const email = `qa-clerk-sync-${stamp}@tctravel.qa`;
  const password = `Qa-${stamp}-Verify-9X!`;

  console.log("=== Clerk → Payload customer sync verification ===\n");

  console.log("[0/5] Initialising Payload client");
  const payload = await getPayload({ config });

  console.log(`\n[1/5] Creating Clerk test user ${email}`);
  let user: ClerkUser;
  try {
    user = await clerkCreateUser(email, password);
  } catch (err) {
    console.error("Create failed:", (err as Error).message);
    process.exit(1);
  }
  console.log(`      Clerk user id: ${user.id}`);

  const waitMs = 15000;
  console.log(`\n[2/5] Waiting ${waitMs / 1000}s for webhook delivery...`);
  await new Promise((r) => setTimeout(r, waitMs));

  console.log("\n[3/5] Querying Payload customers via Local API");
  const result = await payload.find({
    collection: "customers",
    where: { clerkUserId: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const customer = result.docs[0];

  if (customer) {
    console.log("      ✓ SYNCED. Row:", {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      clerkUserId: customer.clerkUserId
    });
  } else {
    console.log("      ✗ NOT FOUND. Webhook did not reach Payload (or sync errored).");
  }

  console.log("\n[4/5] Cleaning up Clerk test user");
  try {
    await clerkDeleteUser(user.id);
    console.log("      Clerk user deleted");
  } catch (err) {
    console.error("      Clerk delete failed:", (err as Error).message);
  }

  console.log("\n[5/5] Cleaning up Payload customer row (if synced)");
  if (customer) {
    await payload.delete({ collection: "customers", id: customer.id, overrideAccess: true });
    console.log(`      Removed customer id ${customer.id}`);
  } else {
    console.log("      Nothing to clean (no row was created)");
  }

  console.log("\n=== Result ===");
  if (customer) {
    console.log("CLERK WEBHOOK SYNC: WORKING ✓");
    process.exit(0);
  } else {
    console.log("CLERK WEBHOOK SYNC: NOT WORKING ✗");
    console.log("Check Clerk Dashboard → Webhooks → Recent deliveries for error details.");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
