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
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-slate-700">Share:</span>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-9 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t.label}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-9 rounded-md border border-brand-blue bg-white px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-blue-50"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
