import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation primitives. `Link`, `useRouter`, `usePathname`, and
// `redirect` automatically keep the active locale prefix in sync.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
