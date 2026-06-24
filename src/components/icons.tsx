import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const STROKE = "1.6";

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 3h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 00-8.6 15l-1 4 4.1-1A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.4.6.6-2.3-.2-.3A8 8 0 0112 4zm-3 4.3c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.2 1.6 2.6 4 3.5 1.9.8 2.3.6 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1l-.6-.3c-.3-.1-1.3-.7-1.5-.8-.2 0-.3-.1-.5.1l-.7.9c-.1.1-.2.2-.5 0-.3-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.3 0-.4.1-.5l.4-.5c.1-.1.1-.3.2-.4 0-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4z" />
    </svg>
  );
}

export function MessengerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.4 2 2 6.1 2 11.3c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.6 0 10-4.1 10-9.3S17.6 2 12 2zm1.1 12.4l-2.6-2.8-5 2.8 5.5-5.9 2.7 2.8 4.9-2.8-5.5 5.9z" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 3c.3 2 1.6 3.4 3.6 3.6V9c-1.3 0-2.5-.4-3.6-1.1V14a5 5 0 11-5-5c.3 0 .7 0 1 .1v2.6a2.4 2.4 0 102 2.3V3h2z" />
    </svg>
  );
}

export const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon
} as const;

export type SocialPlatform = keyof typeof SOCIAL_ICONS;
