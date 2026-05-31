"use client";

import type { Destination } from "@/payload-types";
import { CounterField, MultiChoiceField, SingleChoiceField } from "./proposal-choice-fields";
import { CheckboxField, Step, TextAreaField, TextField } from "./proposal-form-controls";

interface ProposalFormStepProps {
  step: number;
  destinations: Destination[];
  destinationLabels: Record<string, string>;
  busy: boolean;
  stages: string[];
  themes: string[];
}

export function ProposalFormStep({ step, destinations, destinationLabels, busy, stages, themes }: ProposalFormStepProps) {
  if (step === 0) {
    return (
      <Step title="Planning">
        <SingleChoiceField values={stages} disabled={busy} />
      </Step>
    );
  }

  if (step === 1) {
    return (
      <Step title="Participants & dates">
        <CounterField name="adults" label="Adults" min={1} disabled={busy} />
        <CounterField name="children" label="Children" min={0} disabled={busy} />
        <TextField name="departureMonth" label="Departure month, e.g. March 2027" disabled={busy} />
        <CounterField name="estimatedDays" label="Estimated days" min={1} disabled={busy} />
      </Step>
    );
  }

  if (step === 2) {
    return (
      <Step title="Travel project">
        <MultiChoiceField
          name="selectedDestinations"
          values={destinations.map((d) => d.slug)}
          labels={destinationLabels}
          disabled={busy}
        />
        <MultiChoiceField name="themes" values={themes} disabled={busy} />
        <TextAreaField name="message" label="Notes, pace, must-sees, hotel style..." disabled={busy} />
      </Step>
    );
  }

  return (
    <Step title="Contact">
      <TextField name="name" label="Full name" disabled={busy} />
      <TextField name="email" label="Email" type="email" disabled={busy} />
      <TextField name="phone" label="Phone or WhatsApp" disabled={busy} />
      <TextField name="nationality" label="Nationality" disabled={busy} />
      <CheckboxField name="whatsappOptIn" label="Contact me by WhatsApp if useful" disabled={busy} />
    </Step>
  );
}
