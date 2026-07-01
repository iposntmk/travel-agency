import { NextResponse } from "next/server";

import { defaultLocale } from "@/i18n/routing";

// The llms.txt content lives under the localized segment
// (`src/app/[locale]/llms.txt/route.ts`) because it renders locale-specific
// tour/destination copy. With `localePrefix: "always"` there is no unprefixed
// variant, and the i18n middleware skips dotted paths, so a bare `/llms.txt`
// request has no matching route and 500s. Redirect it to the default locale so
// crawlers hitting the conventional root path still resolve the file.
export function GET(request: Request): Response {
  return NextResponse.redirect(new URL(`/${defaultLocale}/llms.txt`, request.url), 308);
}
