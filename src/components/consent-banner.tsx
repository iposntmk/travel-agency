"use client";

import { useEffect, useState } from "react";

export const CONSENT_KEY = "tc.consent.v1";

export type ConsentState = "undecided" | "accepted" | "rejected";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "undecided";
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : "undecided";
}

export function ConsentBanner() {
  const [state, setState] = useState<ConsentState>("undecided");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getConsent());
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch {}
    setState(choice);
    window.dispatchEvent(new CustomEvent("tc:consent-change", { detail: choice }));
  };

  if (!mounted || state !== "undecided") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
        <p className="leading-6">
          We use cookies only when you opt in — for site analytics and improving tour recommendations.
          No tracking happens before you choose.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="min-h-10 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="min-h-10 rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
