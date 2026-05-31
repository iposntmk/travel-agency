import type { ComponentType } from "react";
import { SectionHead } from "@/components/section";

export interface WhyUsItem {
  icon?: string | null;
  title: string;
  body: string;
}

const DEFAULT_ITEMS: WhyUsItem[] = [
  {
    icon: "compass",
    title: "Local Specialists",
    body: "Every tour is run by guides who live in Hội An, Huế and Đà Nẵng. Real stories, real recommendations."
  },
  {
    icon: "shield",
    title: "Trusted Local Operator",
    body: "A licensed Central Vietnam agency with real follow-up by phone and WhatsApp before every departure."
  },
  {
    icon: "wallet",
    title: "Book Now, Pay Later",
    body: "Submit an inquiry, confirm details with our team, then pay when you meet your guide. No prepayment."
  },
  {
    icon: "heart",
    title: "Value for Money",
    body: "Fair, transparent pricing with no hidden fees — including genuinely free walking and cycling tours."
  },
  {
    icon: "sparkle",
    title: "Authentic Experiences",
    body: "Small groups and private routes built around local life, realistic pacing, and the places we love."
  }
];

interface Props {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: WhyUsItem[];
}

export function WhyTcTravel({ eyebrow, title, subtitle, items }: Props) {
  const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
  return (
    <section className="bg-mist py-16 md:py-24">
      <div className="mx-auto max-w-page px-4">
        <SectionHead
          eyebrow={eyebrow ?? "Why travellers choose us"}
          title={title ?? "Local, trusted, low-pressure."}
          subtitle={subtitle ?? "A small inbound agency built around hospitality, not high-volume sales."}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {list.map((item) => {
            const Icon = ICONS[item.icon ?? "compass"] ?? CompassIcon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Icon />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight text-navy-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ICONS: Record<string, ComponentType> = {
  compass: CompassIcon,
  shield: ShieldIcon,
  wallet: WalletIcon,
  heart: HeartIcon,
  sparkle: SparkleIcon
};

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

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 7a2 2 0 012-2h11a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M16 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
