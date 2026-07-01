import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Clerk is webhook-only in this app (no clerkMiddleware / auth() usage), so the
// i18n middleware can run standalone. The matcher excludes Payload admin/api,
// Next internals, and files with an extension so only public pages get locale
// routing.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|internal|_next|_vercel|.*\\..*).*)"]
};
