"use client";

import { useState } from "react";

export function FooterNewsletter() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  }

  return (
    <>
      <form className="flex gap-2 items-center" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email address"
          required
          className="flex-grow h-11 bg-white rounded-lg px-4 text-sm text-[var(--izitour-text)] placeholder-gray-400 outline-none"
        />
        <button
          type="submit"
          className="flex h-11 w-12 items-center justify-center rounded-lg bg-[var(--izitour-primary)] text-white hover:bg-[var(--izitour-primary-dark)] transition-colors shrink-0 cursor-pointer"
          aria-label="Submit newsletter"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
      {subscribed ? (
        <p className="text-xs text-green-400 font-medium animate-pulse">Subscribed successfully!</p>
      ) : null}
    </>
  );
}
