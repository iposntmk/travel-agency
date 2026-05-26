import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import { getSeoEnv } from "@/config/env";
import "../globals.css";

const indexingAllowed = getSeoEnv().ALLOW_INDEXING;

export const metadata: Metadata = {
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
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link className="text-lg font-bold text-brand-blue" href="/">
                TC Travel Vietnam
              </Link>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
                <Link href="/tours">Tours</Link>
                <Link href="/destinations">Destinations</Link>
                <Link href="/free-tours">Free Tours</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/booking/confirmation">Contact</Link>
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto grid max-w-6xl gap-2 px-4 py-8 text-sm text-slate-600 md:grid-cols-3">
              <p>Book Now - Pay Later for paid and free tour inquiries.</p>
              <p>WhatsApp: +84 000 000 000</p>
              <p>Email: sales@example.com</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
