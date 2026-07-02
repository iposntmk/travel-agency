import { getTranslations } from "next-intl/server";

const SMALL_GROUP_MAX = 12;

interface ProductMetaProps {
  durationText?: string | null;
  pickupAvailable?: boolean | null;
  privateOption?: boolean | null;
  groupSizeMax?: number | null;
  className?: string;
}

/**
 * GetYourGuide-style meta row: "2.5 hours · Pickup available · Private option
 * · Small group". Small group derives from groupSizeMax (<= 12). Shared across
 * tour / cruise / car-rental cards to avoid drift.
 */
export async function ProductMeta({
  durationText,
  pickupAvailable,
  privateOption,
  groupSizeMax,
  className
}: ProductMetaProps) {
  const t = await getTranslations("meta");
  const parts: string[] = [];

  if (durationText) parts.push(durationText);
  if (pickupAvailable) parts.push(t("pickupAvailable"));
  if (privateOption) parts.push(t("privateOption"));
  if (typeof groupSizeMax === "number" && groupSizeMax > 0 && groupSizeMax <= SMALL_GROUP_MAX) {
    parts.push(t("smallGroup"));
  }

  if (parts.length === 0) return null;

  return <p className={className ?? "text-sm leading-6 text-slate-600"}>{parts.join(" · ")}</p>;
}
