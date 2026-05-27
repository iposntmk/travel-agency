"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
  medium: "tour" | "blog" | "destination";
  campaignId: string;
}

function buildShareUrl(url: string, medium: string, campaignId: string): string {
  try {
    const next = new URL(url);
    next.searchParams.set("utm_source", "share");
    next.searchParams.set("utm_medium", medium);
    next.searchParams.set("utm_campaign", `${medium}-${campaignId}`);
    return next.toString();
  } catch {
    return url;
  }
}

export function ShareButtons({ url, title, medium, campaignId }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildShareUrl(url, medium, campaignId);

  const targets = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: FacebookIcon
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      icon: XIcon
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      icon: WhatsAppIcon
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
      icon: MailIcon
    }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — older browsers without clipboard permission
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">Share</span>
      <div className="flex flex-wrap items-center gap-2">
        {targets.map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${t.label}`}
            title={`Share on ${t.label}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 bg-white text-navy-700 transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <t.icon />
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-navy-100 bg-white px-3 text-xs font-semibold text-navy-900 transition hover:border-navy-300 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          aria-live="polite"
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.7V14h2.7v8h3.1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M17.5 3h3l-6.6 7.5L21.5 21h-6L11 14.7 5.7 21H2.5l7-8L2 3h6.2l4 5.7L17.5 3zm-1.1 16h1.7L7.7 4.9H6L16.4 19z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.5 11.5c0 4.6-3.8 8.4-8.5 8.4-1.5 0-2.9-.4-4.1-1.1L3.5 20l1.3-4.6a8.4 8.4 0 117.2 12.5zm-8.5-7c-3.6 0-6.5 2.9-6.5 6.4 0 1.4.5 2.7 1.2 3.7l-.8 2.7 2.8-.7c1 .6 2.2.9 3.3.9 3.6 0 6.5-2.9 6.5-6.5S15.6 4.5 12 4.5zm3.8 8.2c0-.1-.2-.2-.5-.4l-1.4-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.4 5.4 0 01-2.7-2.4c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5l-.6-1.4c-.1-.3-.3-.2-.4-.2h-.4c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.8c.1.2 1.8 2.8 4.4 3.8 2.2.8 2.6.6 3.1.6.5-.1 1.4-.6 1.6-1.1.2-.5.2-.9.1-1z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 14a4 4 0 01.6-5.6L13 6a4 4 0 015.6 5.6L17 13M14 10a4 4 0 01-.6 5.6L11 18a4 4 0 01-5.6-5.6L7 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 12l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
