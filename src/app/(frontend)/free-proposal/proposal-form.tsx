"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { submitCustomInquiry } from "@/app/actions/submit-custom-inquiry";
import type { Destination } from "@/payload-types";

interface Props {
  destinations: Destination[];
}

const THEMES = ["Culture", "Food", "Nature", "Family", "Beach", "Photography"];
const STAGES = ["I have an idea", "I need advice", "Ready to book"];

export function FreeProposalForm({ destinations }: Props) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [state, setState] = useState({
    planningStage: STAGES[0],
    adults: 2,
    children: 0,
    exactDatesKnown: false,
    departureMonth: "",
    estimatedDays: 7,
    selectedDestinations: [] as string[],
    themes: [] as string[],
    accommodationLevels: ["Comfort"],
    budgetPerPerson: 800,
    message: "",
    name: "",
    email: "",
    phone: "",
    nationality: "",
    whatsappOptIn: true
  });
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const progress = ((step + 1) / 4) * 100;

  function toggle(list: "selectedDestinations" | "themes", value: string) {
    setState((current) => ({
      ...current,
      [list]: current[list].includes(value)
        ? current[list].filter((item) => item !== value)
        : [...current[list], value]
    }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitCustomInquiry({ ...state, idempotencyKey, source: "free-proposal" });
      if (result.ok) setDone(true);
      else setError(result.error.message);
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Your request is in.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          We will review your project and reply within 24 hours. No payment is required now.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-elevated md:p-6">
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-[#047857]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-6">
        {step === 0 ? (
          <Step title="Planning">
            <ChipGroup values={STAGES} selected={[state.planningStage]} onToggle={(value) => setState({ ...state, planningStage: value })} />
          </Step>
        ) : null}
        {step === 1 ? (
          <Step title="Participants & dates">
            <Counter label="Adults" value={state.adults} min={1} onChange={(adults) => setState({ ...state, adults })} />
            <Counter label="Children" value={state.children} min={0} onChange={(children) => setState({ ...state, children })} />
            <input className={fieldClass} placeholder="Departure month, e.g. March 2027" value={state.departureMonth} onChange={(e) => setState({ ...state, departureMonth: e.target.value })} />
            <input className={fieldClass} type="number" min={1} placeholder="Estimated days" value={state.estimatedDays} onChange={(e) => setState({ ...state, estimatedDays: Number(e.target.value) })} />
          </Step>
        ) : null}
        {step === 2 ? (
          <Step title="Travel project">
            <ChipGroup values={destinations.map((d) => d.slug)} labels={Object.fromEntries(destinations.map((d) => [d.slug, d.title]))} selected={state.selectedDestinations} onToggle={(value) => toggle("selectedDestinations", value)} />
            <ChipGroup values={THEMES} selected={state.themes} onToggle={(value) => toggle("themes", value)} />
            <textarea className={`${fieldClass} min-h-28`} placeholder="Notes, pace, must-sees, hotel style..." value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} />
          </Step>
        ) : null}
        {step === 3 ? (
          <Step title="Contact">
            <input className={fieldClass} placeholder="Full name" value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
            <input className={fieldClass} type="email" placeholder="Email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} />
            <input className={fieldClass} placeholder="Phone or WhatsApp" value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} />
            <input className={fieldClass} placeholder="Nationality" value={state.nationality} onChange={(e) => setState({ ...state, nationality: e.target.value })} />
          </Step>
        ) : null}
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      <div className="mt-6 flex justify-between gap-3">
        <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold disabled:opacity-40">Back</button>
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-[#047857] px-5 py-2 text-sm font-semibold text-white">Next</button>
        ) : (
          <button type="button" disabled={pending} onClick={submit} className="rounded-full bg-[#047857] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Submit</button>
        )}
      </div>
    </section>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-4"><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>{children}</div>;
}

function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (value: number) => void }) {
  return <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3"><span className="font-medium text-slate-800">{label}</span><div className="flex items-center gap-3"><button type="button" className={iconButtonClass} onClick={() => onChange(Math.max(min, value - 1))}><Minus className="h-4 w-4" /></button><span className="w-8 text-center font-semibold">{value}</span><button type="button" className={iconButtonClass} onClick={() => onChange(value + 1)}><Plus className="h-4 w-4" /></button></div></div>;
}

function ChipGroup({ values, labels, selected, onToggle }: { values: string[]; labels?: Record<string, string>; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{values.map((value) => <button key={value} type="button" onClick={() => onToggle(value)} className={selected.includes(value) ? "rounded-full bg-[#047857] px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"}>{labels?.[value] ?? value}</button>)}</div>;
}

const fieldClass = "w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15";
const iconButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700";
