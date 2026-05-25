import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-3 text-slate-600">The tour, destination, or article you were looking for does not exist.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link className="rounded-md bg-brand-blue px-4 py-2 font-semibold text-white" href="/">
          Back to home
        </Link>
        <Link className="rounded-md border border-brand-blue px-4 py-2 font-semibold text-brand-blue" href="/tours">
          Browse tours
        </Link>
      </div>
    </main>
  );
}
