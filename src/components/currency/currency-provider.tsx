"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultCurrency, findCurrency, type CurrencyOption } from "@/lib/currency";

const COOKIE_NAME = "currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface CurrencyContextValue {
  currencies: CurrencyOption[];
  active: CurrencyOption;
  setActive: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(code: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

interface CurrencyProviderProps {
  currencies: CurrencyOption[];
  children: React.ReactNode;
}

export function CurrencyProvider({ currencies, children }: CurrencyProviderProps) {
  // Server render (and first client paint) uses the base currency so the markup
  // matches across the hydration boundary — no mismatch warnings. The saved
  // preference is applied right after mount in the effect below.
  const fallback = useMemo(() => defaultCurrency(currencies), [currencies]);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = readCookie();
    if (saved) setCode(saved);
  }, []);

  const active = useMemo(
    () => findCurrency(currencies, code) ?? fallback,
    [currencies, code, fallback]
  );

  const setActive = useCallback((next: string) => {
    setCode(next);
    writeCookie(next);
  }, []);

  // No currencies configured → render children without a provider so price
  // components fall back to their plain base display.
  if (!active) return <>{children}</>;

  return (
    <CurrencyContext.Provider value={{ currencies, active, setActive }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue | null {
  return useContext(CurrencyContext);
}
