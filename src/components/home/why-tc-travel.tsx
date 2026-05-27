import { SectionHead } from "@/components/section";

const ITEMS = [
  {
    title: "Book Now, Pay Later",
    body: "Submit an inquiry, confirm details with our team, then pay when you meet your guide. No prepayment, no friction.",
    icon: ShieldIcon
  },
  {
    title: "Local Specialists",
    body: "Every tour is run by guides who live in Hội An, Huế and Đà Nẵng. Real stories, real recommendations.",
    icon: CompassIcon
  },
  {
    title: "Free Tours Welcome",
    body: "Free walking and cycling tours so you can experience the region first. Tips appreciated, never required.",
    icon: HeartIcon
  }
] as const;

export function WhyTcTravel() {
  return (
    <section className="bg-mist py-16 md:py-24">
      <div className="mx-auto max-w-page px-4">
        <SectionHead
          eyebrow="Why travellers choose us"
          title="Local, trusted, low-pressure."
          subtitle="A small inbound agency built around hospitality, not high-volume sales."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                <item.icon />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 017-2.7A4 4 0 0119 10c0 5.5-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
