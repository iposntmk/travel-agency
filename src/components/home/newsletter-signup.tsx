"use client";

import { useId, useState, useTransition } from "react";
import { subscribeNewsletter } from "@/app/actions/subscribe-newsletter";

type Status = { type: "idle" | "error" | "success"; message?: string };

export function NewsletterSignup({ source = "/" }: { source?: string }) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "idle" });
    startTransition(async () => {
      const result = await subscribeNewsletter({ email, source });
      if (result.ok) {
        setStatus({ type: "success", message: "Thanks! You’re on the list — watch for seasonal trip ideas." });
        setEmail("");
      } else {
        setStatus({ type: "error", message: result.error.message });
      }
    });
  }

  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-page gap-6 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:items-center md:py-16">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Stay in the loop</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Seasonal trip ideas, no spam
          </h2>
          <p className="mt-3 text-sm leading-7 text-navy-100">
            Join our newsletter for the best time to visit, new tours, and free-tour schedules across Central Vietnam.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" noValidate>
          <div className="flex-1">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-invalid={status.type === "error"}
              className="min-h-11 w-full rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-navy-100 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-navy-950 shadow-elevated transition hover:bg-navy-50 disabled:opacity-60"
          >
            {pending ? "Subscribing…" : "Subscribe"}
          </button>
        </form>

        {status.message ? (
          <p
            role="status"
            className={`text-sm md:col-start-2 ${status.type === "success" ? "text-emerald-200" : "text-red-200"}`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
