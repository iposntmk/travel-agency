import { getPayload, type Payload } from "payload";
import configPromise from "@payload-config";

let cached: Promise<Payload> | undefined;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config: configPromise });
  }
  return cached;
}
