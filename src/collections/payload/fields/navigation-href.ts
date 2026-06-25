import type { FieldHook } from "payload";

const invalidHrefMessage =
  "Use a root-relative internal URL like /car-rentals/sedan or a full https:// external URL. Empty, #, javascript:, and query-string menu links are not allowed.";

export const normalizeNavigationHrefHook: FieldHook = ({ value }) => normalizeNavigationHref(value);

export function validateOptionalNavigationHref(value: unknown): true | string {
  if (value === null || value === undefined || value === "") return true;
  return validateNavigationHref(value);
}

export function validateNavigationHref(value: unknown): true | string {
  const normalized = normalizeNavigationHref(value);
  if (!normalized) return invalidHrefMessage;
  if (normalized === "#" || normalized.includes("#")) return invalidHrefMessage;
  if (normalized.includes("?")) return invalidHrefMessage;
  if (normalized.startsWith("javascript:")) return invalidHrefMessage;
  if (normalized.startsWith("//")) return invalidHrefMessage;
  if (normalized.startsWith("/")) return true;
  if (normalized.startsWith("https://")) return true;
  return invalidHrefMessage;
}

export function normalizeNavigationHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const lowered = stripVietnameseMarks(trimmed).toLowerCase();
  if (lowered.startsWith("https://")) return trimTrailingSlash(lowered);
  if (lowered.startsWith("http://")) return trimTrailingSlash(lowered);
  if (lowered.startsWith("//")) return lowered;
  if (!lowered.startsWith("/")) return lowered;
  if (lowered.includes("?") || lowered.includes("#")) return lowered;

  return slugifyInternalPath(lowered);
}

function slugifyInternalPath(value: string): string {
  const [path] = value.split(/[?#]/, 1);
  const segments = path
    .split("/")
    .map((segment) =>
      segment
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
    )
    .filter(Boolean);

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function stripVietnameseMarks(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d");
}

function trimTrailingSlash(value: string): string {
  return value.length > 1 ? value.replace(/\/+$/g, "") : value;
}
