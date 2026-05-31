"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon, WhatsAppIcon } from "@/components/icons";

interface Props {
  whatsappHref: string;
}

export function FloatingActions({ whatsappHref }: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white shadow-elevated transition hover:bg-brand-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-elevated transition hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
