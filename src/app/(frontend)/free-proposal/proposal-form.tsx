"use client";

import { useMemo, useState, useTransition } from "react";
import { FormProvider, useForm, type FieldErrors, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitCustomInquiry } from "@/app/actions/submit-custom-inquiry";
import { clientUuid } from "@/lib/client-uuid";
import type { Destination } from "@/payload-types";
import { customInquirySchema, type CustomInquiryInput } from "@/schemas/custom-inquiry";
import { PROPOSAL_STAGES, PROPOSAL_STEP_FIELDS, type CustomInquiryFormValues } from "./proposal-form-options";
import { ProposalFormStep } from "./proposal-form-steps";

interface Props {
  destinations: Destination[];
}

export function FreeProposalForm({ destinations }: Props) {
  const idempotencyKey = useMemo(() => clientUuid(), []);
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const methods = useForm<CustomInquiryFormValues, unknown, CustomInquiryInput>({
    resolver: zodResolver(customInquirySchema),
    mode: "onTouched",
    defaultValues: {
      planningStage: PROPOSAL_STAGES[0],
      adults: 2,
      children: 0,
      exactDatesKnown: false,
      departureMonth: "",
      estimatedDays: 7,
      selectedDestinations: [],
      themes: [],
      accommodationLevels: ["Comfort"],
      budgetPerPerson: 800,
      message: "",
      name: "",
      email: "",
      phone: "",
      nationality: "",
      whatsappOptIn: true,
      source: "free-proposal",
      idempotencyKey
    }
  });
  const busy = pending || methods.formState.isSubmitting;
  const progress = ((step + 1) / PROPOSAL_STEP_FIELDS.length) * 100;
  const destinationLabels = Object.fromEntries(destinations.map((d) => [d.slug, d.title]));

  async function nextStep() {
    const valid = await methods.trigger(PROPOSAL_STEP_FIELDS[step]);
    if (valid) setStep((current) => Math.min(current + 1, PROPOSAL_STEP_FIELDS.length - 1));
  }

  function submit(values: CustomInquiryInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await submitCustomInquiry(values);
      if (result.ok) {
        setDone(true);
        return;
      }

      applyServerErrors(result.error.fieldErrors);
      setServerError(result.error.message);
    });
  }

  function applyServerErrors(fieldErrors?: Record<string, string[]>) {
    if (!fieldErrors) return;
    const targetStep = firstStepWithError(Object.keys(fieldErrors));
    if (targetStep !== undefined) setStep(targetStep);
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      if (messages[0]) methods.setError(field as Path<CustomInquiryFormValues>, { type: "server", message: messages[0] });
    });
  }

  function handleInvalid(errors: FieldErrors<CustomInquiryFormValues>) {
    const targetStep = firstStepWithError(Object.keys(errors));
    if (targetStep !== undefined) setStep(targetStep);
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
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit, handleInvalid)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-elevated md:p-6" noValidate>
        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-[#047857]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-6">
          <ProposalFormStep
            step={step}
            destinations={destinations}
            destinationLabels={destinationLabels}
            busy={busy}
          />
        </div>
        {serverError ? <p className="mt-4 text-sm font-medium text-red-600">{serverError}</p> : null}
        <div className="mt-6 flex justify-between gap-3">
          <button type="button" disabled={step === 0 || busy} onClick={() => setStep(step - 1)} className={secondaryButtonClass}>
            Back
          </button>
          {step < PROPOSAL_STEP_FIELDS.length - 1 ? (
            <button type="button" disabled={busy} onClick={nextStep} className={primaryButtonClass}>Next</button>
          ) : (
            <button type="submit" disabled={busy} className={primaryButtonClass}>
              {busy ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

function firstStepWithError(fields: string[]): number | undefined {
  const names = new Set(fields);
  const index = PROPOSAL_STEP_FIELDS.findIndex((stepFields) => stepFields.some((field) => names.has(field)));
  return index === -1 ? undefined : index;
}

const primaryButtonClass = "rounded-full bg-[#047857] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass = "rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40";
