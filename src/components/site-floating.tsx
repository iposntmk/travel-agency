import { getSiteSettings } from "@/lib/cms";
import { FloatingActions } from "@/components/floating-actions";

function messengerHref(messenger?: string | null): string | undefined {
  if (!messenger) return undefined;
  const value = messenger.trim();
  if (!value) return undefined;
  return value.startsWith("http") ? value : `https://m.me/${value}`;
}

export async function SiteFloating() {
  const settings = await getSiteSettings();
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`;
  return (
    <FloatingActions
      whatsappHref={href}
      messengerHref={messengerHref(settings?.messenger)}
      proposalHref="/customize-tour"
    />
  );
}
