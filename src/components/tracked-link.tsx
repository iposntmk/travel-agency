"use client";

import type { ReactNode } from "react";

interface Props {
  href: string;
  targetType: "addon" | "ota";
  targetId: string;
  source: string;
  className?: string;
  children: ReactNode;
}

export function TrackedLink({ href, targetType, targetId, source, className, children }: Props) {
  const recordClick = () => {
    try {
      const body = JSON.stringify({ targetType, targetId, targetUrl: href, source });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/events/click", new Blob([body], { type: "application/json" }));
        return;
      }
      void fetch("/api/events/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => undefined);
    } catch {
      // ignore — tracking is best-effort, never block navigation
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={recordClick}
      onAuxClick={recordClick}
      className={className}
    >
      {children}
    </a>
  );
}
