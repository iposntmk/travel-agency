"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/app/actions/subscribe-newsletter";

const SHOWN_KEY = "tc-giveaway-last-shown";
const SUBSCRIBED_KEY = "tc-giveaway-subscribed";

export interface GiveawayConfig {
  title: string;
  description?: string;
  prizeText?: string;
  ctaLabel: string;
  delaySeconds: number;
  frequencyDays: number;
}

interface NewsletterPopupProps {
  config: GiveawayConfig;
}

/**
 * Giveaway lead-capture popup ("Win a $500 Travel Voucher"). Triggers after a
 * delay or on desktop exit intent, whichever first. Frequency-capped and
 * suppressed after subscribe via localStorage — ISR HTML stays user-agnostic.
 */
export function NewsletterPopup({ config }: NewsletterPopupProps) {
  const t = useTranslations("giveaway");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const firedRef = useRef(false);

  const shouldShow = useCallback((): boolean => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return false;
      const lastShown = Number(localStorage.getItem(SHOWN_KEY) ?? 0);
      return Date.now() - lastShown > config.frequencyDays * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }, [config.frequencyDays]);

  const trigger = useCallback(() => {
    if (firedRef.current || !shouldShow()) return;
    firedRef.current = true;
    try {
      localStorage.setItem(SHOWN_KEY, String(Date.now()));
    } catch {
      // storage unavailable — still show this once
    }
    setOpen(true);
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow()) return;

    const timer = setTimeout(trigger, config.delaySeconds * 1000);
    const onMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null && event.clientY <= 0) trigger();
    };
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [config.delaySeconds, shouldShow, trigger]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    const result = await subscribeNewsletter({ email });
    if (result.ok) {
      setStatus("success");
      try {
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      } catch {
        // non-fatal
      }
    } else {
      setStatus("error");
      setErrorMessage(result.error.message);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold text-navy-950">{t("successTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("successBody")}</p>
          </div>
        ) : (
          <>
            {config.prizeText ? (
              <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                {config.prizeText}
              </p>
            ) : null}
            <h2 className="mt-3 text-xl font-bold tracking-tight text-navy-950">{config.title}</h2>
            {config.description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">{config.description}</p>
            ) : null}
            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-green"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="h-11 rounded-lg bg-brand-green px-5 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:opacity-60"
              >
                {status === "submitting" ? "…" : config.ctaLabel}
              </button>
            </form>
            {status === "error" ? (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            ) : null}
            <p className="mt-3 text-[11px] leading-4 text-slate-400">{t("disclaimer")}</p>
          </>
        )}
      </div>
    </div>
  );
}
