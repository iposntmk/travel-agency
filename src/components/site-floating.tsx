import { getSiteSettings } from "@/lib/cms";
import { FloatingActions } from "@/components/floating-actions";

export async function SiteFloating() {
  const settings = await getSiteSettings();
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`;
  return <FloatingActions whatsappHref={href} />;
}
