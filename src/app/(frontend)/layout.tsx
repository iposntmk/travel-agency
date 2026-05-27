import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConsentBanner } from "@/components/consent-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNextConfigEnv, getSeoEnv, getSiteUrl } from "@/config/env";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap"
});

const indexingAllowed = getSeoEnv().ALLOW_INDEXING;
const siteUrl = getSiteUrl();
const r2PublicUrl = getNextConfigEnv().R2_PUBLIC_URL;
const r2Origin = r2PublicUrl ? new URL(r2PublicUrl).origin : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TC Travel Vietnam",
    template: "%s | TC Travel Vietnam"
  },
  description: "Private, small group, and free walking tours in Hội An, Huế, and Đà Nẵng. Book now, pay later — TC Travel Vietnam.",
  icons: {
    icon: "/favicon.svg"
  },
  robots: indexingAllowed ? { index: true, follow: true } : { index: false, follow: false }
};

export default function FrontendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>{r2Origin ? <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" /> : null}</head>
      <body className="bg-mist text-slate-800">
        <a className="skip-link sr-only" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
