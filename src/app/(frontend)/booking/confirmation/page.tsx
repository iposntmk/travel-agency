import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "Contact details and next steps after submitting a travel inquiry."
};

export default function ConfirmationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-950">Thanks. Our team will contact you within 24h.</h1>
      <p className="mt-4 leading-7 text-slate-600">
        This MVP keeps payment offline. Paid tour inquiries and free tour registrations start as
        Pending, then sales confirms details manually.
      </p>
      <div className="mt-8 grid gap-3 rounded-md border border-slate-200 p-5 text-sm text-slate-700">
        <p>
          <strong>WhatsApp:</strong> +84 000 000 000
        </p>
        <p>
          <strong>Email:</strong> sales@example.com
        </p>
        <p>
          <strong>Zalo:</strong> +84 000 000 000
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-md bg-brand-blue px-4 py-2 font-semibold text-white" href="/tours">
          Explore More Tours
        </Link>
        <Link className="rounded-md border border-brand-blue px-4 py-2 font-semibold text-brand-blue" href="/free-tours">
          Join Free Tours
        </Link>
      </div>
    </main>
  );
}
