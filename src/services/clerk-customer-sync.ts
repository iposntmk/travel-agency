import "server-only";

import type { Payload } from "payload";
import { getPayloadClient } from "@/lib/payload";
import type { Customer } from "@/payload-types";

type ClerkEmailAddress = {
  id?: string;
  email_address: string;
};

export type ClerkUserData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailAddress[];
};

export type CustomerSyncResult =
  | { status: "created" | "updated"; customerId: number | string; email: string }
  | { status: "skipped"; reason: "missing-email" | "email-already-linked" };

export async function syncCustomerFromClerkUser(user: ClerkUserData): Promise<CustomerSyncResult> {
  const email = primaryEmail(user);
  if (!email) {
    return { status: "skipped", reason: "missing-email" };
  }

  const payload = await getPayloadClient();
  const name = displayName(user, email);
  const existingByClerkId = await findCustomerByClerkUserId(payload, user.id);

  if (existingByClerkId) {
    const emailOwner =
      existingByClerkId.email === email ? existingByClerkId : await findCustomerByEmail(payload, email);
    const data = emailOwner && !sameId(emailOwner.id, existingByClerkId.id) ? { name } : { name, email };
    const updated = await updateCustomer(payload, existingByClerkId.id, data);

    return { status: "updated", customerId: updated.id, email: updated.email };
  }

  const existingByEmail = await findCustomerByEmail(payload, email);
  if (existingByEmail) {
    if (existingByEmail.clerkUserId && existingByEmail.clerkUserId !== user.id) {
      return { status: "skipped", reason: "email-already-linked" };
    }

    const updated = await updateCustomer(payload, existingByEmail.id, { clerkUserId: user.id });
    return { status: "updated", customerId: updated.id, email: updated.email };
  }

  const created = await payload.create({
    collection: "customers",
    depth: 0,
    overrideAccess: true,
    data: {
      name,
      email,
      clerkUserId: user.id
    }
  });

  return { status: "created", customerId: created.id, email: created.email };
}

function primaryEmail(user: ClerkUserData): string | undefined {
  const primary = user.email_addresses.find((email) => email.id === user.primary_email_address_id);
  return primary?.email_address ?? user.email_addresses[0]?.email_address;
}

function displayName(user: ClerkUserData, email: string): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.username || email;
}

async function findCustomerByClerkUserId(payload: Payload, clerkUserId: string): Promise<Customer | null> {
  const result = await payload.find({
    collection: "customers",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { clerkUserId: { equals: clerkUserId } }
  });

  return result.docs[0] ?? null;
}

async function findCustomerByEmail(payload: Payload, email: string): Promise<Customer | null> {
  const result = await payload.find({
    collection: "customers",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } }
  });

  return result.docs[0] ?? null;
}

function updateCustomer(
  payload: Payload,
  id: number | string,
  data: Partial<Pick<Customer, "clerkUserId" | "email" | "name">>
): Promise<Customer> {
  return payload.update({
    collection: "customers",
    id,
    depth: 0,
    overrideAccess: true,
    data
  });
}

function sameId(left: number | string, right: number | string): boolean {
  return String(left) === String(right);
}
