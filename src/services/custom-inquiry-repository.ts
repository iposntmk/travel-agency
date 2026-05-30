import "server-only";

import { getPayloadClient } from "@/lib/payload";
import { sanitizeOptionalPlainText } from "@/lib/sanitize";
import type { CustomInquiryInput } from "@/schemas/custom-inquiry";

export type CustomInquiryRecord = {
  id: string;
  customerName: string;
  email: string;
  selectedDestinations: string[];
  status: string;
  idempotencyKey: string;
};

type CreateCustomInquiryResult = {
  inquiry: CustomInquiryRecord;
  duplicate: boolean;
};

type CustomPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
  create(args: Record<string, unknown>): Promise<unknown>;
};

type Entity = Record<string, unknown> & { id?: number | string };

export async function createCustomInquiryOnce(input: CustomInquiryInput): Promise<CreateCustomInquiryResult> {
  const payload = (await getPayloadClient()) as unknown as CustomPayload;
  const existing = await findByIdempotencyKey(payload, input.idempotencyKey);

  if (existing) {
    return { inquiry: toRecord(existing, input), duplicate: true };
  }

  const [customer, destinationIds] = await Promise.all([
    findOrCreateCustomer(payload, input),
    destinationIdsForSlugs(payload, input.selectedDestinations)
  ]);

  if (destinationIds.length === 0) {
    throw new Error("No matching destinations found for custom inquiry");
  }

  try {
    const created = await payload.create({
      collection: "custom-inquiries",
      depth: 0,
      overrideAccess: true,
      data: {
        ...toPayloadData(input),
        customer: customer.id,
        selectedDestinations: destinationIds,
        status: "new"
      }
    });
    return { inquiry: toRecord(created, input), duplicate: false };
  } catch (error) {
    if (isDuplicateError(error)) {
      const duplicate = await findByIdempotencyKey(payload, input.idempotencyKey);
      if (duplicate) return { inquiry: toRecord(duplicate, input), duplicate: true };
    }
    throw error;
  }
}

async function findByIdempotencyKey(payload: CustomPayload, key: string): Promise<Entity | null> {
  const result = await payload.find({
    collection: "custom-inquiries",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { idempotencyKey: { equals: key } }
  });
  return asEntity(result.docs[0]);
}

async function findOrCreateCustomer(payload: CustomPayload, input: CustomInquiryInput): Promise<Entity> {
  const existing = await findCustomerByEmail(payload, input.email);
  if (existing) return existing;

  try {
    return asEntity(
      await payload.create({
        collection: "customers",
        depth: 0,
        overrideAccess: true,
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          preferredContactChannel: input.whatsappOptIn ? "whatsapp" : "email"
        }
      })
    )!;
  } catch (error) {
    if (isDuplicateError(error)) {
      const duplicate = await findCustomerByEmail(payload, input.email);
      if (duplicate) return duplicate;
    }
    throw error;
  }
}

async function findCustomerByEmail(payload: CustomPayload, email: string): Promise<Entity | null> {
  const result = await payload.find({
    collection: "customers",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } }
  });
  return asEntity(result.docs[0]);
}

async function destinationIdsForSlugs(payload: CustomPayload, slugs: string[]): Promise<(string | number)[]> {
  const result = await payload.find({
    collection: "destinations",
    depth: 0,
    limit: slugs.length,
    overrideAccess: true,
    where: { slug: { in: slugs } },
    select: { slug: true }
  });
  return result.docs
    .map(asEntity)
    .filter((doc): doc is Entity => Boolean(doc))
    .map((doc) => doc.id)
    .filter((id): id is string | number => id !== undefined);
}

function toPayloadData(input: CustomInquiryInput): Record<string, unknown> {
  return {
    customerName: input.name,
    email: input.email,
    phone: input.phone,
    nationality: input.nationality,
    whatsappOptIn: input.whatsappOptIn,
    planningStage: input.planningStage,
    referralSource: input.referralSource,
    travelCompanions: input.travelCompanions,
    occasion: input.occasion,
    adults: input.adults,
    children: input.children,
    exactDatesKnown: input.exactDatesKnown,
    departureDate: input.departureDate || undefined,
    returnDate: input.returnDate || undefined,
    departureMonth: input.departureMonth,
    estimatedDays: input.estimatedDays,
    accommodationLevels: input.accommodationLevels.map((value) => ({ value })),
    themes: input.themes.map((value) => ({ value })),
    accompanimentType: input.accompanimentType,
    budgetPerPerson: input.budgetPerPerson,
    maxBudget: input.maxBudget,
    message: sanitizeOptionalPlainText(input.message),
    source: input.source,
    idempotencyKey: input.idempotencyKey
  };
}

function toRecord(value: unknown, fallback: CustomInquiryInput): CustomInquiryRecord {
  const entity = asEntity(value);
  return {
    id: String(entity?.id ?? fallback.idempotencyKey),
    customerName: stringValue(entity?.customerName) ?? fallback.name,
    email: stringValue(entity?.email) ?? fallback.email,
    selectedDestinations: fallback.selectedDestinations,
    status: stringValue(entity?.status) ?? "new",
    idempotencyKey: stringValue(entity?.idempotencyKey) ?? fallback.idempotencyKey
  };
}

function asEntity(value: unknown): Entity | null {
  return typeof value === "object" && value !== null ? (value as Entity) : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isDuplicateError(error: unknown): boolean {
  const code = valueOf(error, "code");
  const message = valueOf(error, "message");
  return code === "23505" || (typeof message === "string" && message.toLowerCase().includes("duplicate"));
}

function valueOf(error: unknown, key: string): unknown {
  return typeof error === "object" && error !== null && key in error ? error[key as keyof typeof error] : undefined;
}
