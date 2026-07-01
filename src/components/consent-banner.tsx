"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export const CONSENT_KEY = "tc.consent.v1";

export type ConsentState = "undecided" | "accepted" | "rejected";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "undecided";
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : "undecided";
}

export function ConsentBanner() {
  const t = useTranslations("consent");
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
      aria-label={t("dialogLabel")}
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-3 md:p-5"
    >
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-navy-100 bg-white/95 p-5 shadow-elevated backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 md:inline-flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M12 2a10 10 0 100 20 10 10 0 008-15 4 4 0 01-3-3 4 4 0 01-5-2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="11" r="1" fill="currentColor" />
              <circle cx="15" cy="14" r="1" fill="currentColor" />
              <circle cx="11" cy="16" r="1" fill="currentColor" />
            </svg>
          </span>
          <p className="text-sm leading-7 text-slate-700">
            {t("message")}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 md:flex-nowrap">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-50"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-navy-800"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
