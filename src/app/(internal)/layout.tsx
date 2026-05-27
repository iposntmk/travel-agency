import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";

export const metadata: Metadata = {
  title: "Internal",
  robots: { index: false, follow: false }
};

export default function InternalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm">
            <div className="flex items-center gap-4">
              <Link className="font-semibold text-brand-blue" href="/internal/affiliate-clicks">
                TC Travel · Internal
              </Link>
              <span className="text-slate-400">/</span>
              <Link className="text-slate-600 hover:text-slate-900" href="/internal/affiliate-clicks">
                Affiliate clicks
              </Link>
            </div>
            <Link className="text-slate-500 hover:text-slate-900" href="/admin">
              Payload admin →
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
