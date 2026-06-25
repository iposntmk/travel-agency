"use client";

import { Minus, Plus } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import type { CustomInquiryFormValues } from "./proposal-form-options";
import { Field, useFieldError } from "./proposal-form-controls";

export function CounterField({
  name,
  label,
  min,
  disabled
}: {
  name: "adults" | "children" | "estimatedDays";
  label: string;
  min: number;
  disabled?: boolean;
}) {
  const { control } = useFormContext<CustomInquiryFormValues>();
  return (
    <Field label={label} error={useFieldError(name)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = Number(field.value ?? min);
          return (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="font-medium text-slate-800">{value}</span>
              <div className="flex items-center gap-3">
                <button type="button" disabled={disabled} className={iconButtonClass} onClick={() => field.onChange(Math.max(min, value - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <button type="button" disabled={disabled} className={iconButtonClass} onClick={() => field.onChange(value + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        }}
      />
    </Field>
  );
}

export function SingleChoiceField({ values, disabled }: { values: string[]; disabled?: boolean }) {
  const { control } = useFormContext<CustomInquiryFormValues>();
  return (
    <Controller
      control={control}
      name="planningStage"
      render={({ field }) => (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Chip key={value} selected={field.value === value} disabled={disabled} onClick={() => field.onChange(value)}>
              {value}
            </Chip>
          ))}
        </div>
      )}
    />
  );
}

export function MultiChoiceField({
  name,
  values,
  labels,
  disabled
}: {
  name: "selectedDestinations" | "themes" | "accommodationLevels";
  values: string[];
  labels?: Record<string, string>;
  disabled?: boolean;
}) {
  const { control } = useFormContext<CustomInquiryFormValues>();
  return (
    <Field label="" error={useFieldError(name)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selected = Array.isArray(field.value) ? field.value : [];
          return (
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <Chip key={value} selected={selected.includes(value)} disabled={disabled} onClick={() => field.onChange(toggleValue(selected, value))}>
                  {labels?.[value] ?? value}
                </Chip>
              ))}
            </div>
          );
        }}
      />
    </Field>
  );
}

function Chip({ selected, disabled, onClick, children }: { selected: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={selected ? selectedChipClass : chipClass}>
      {children}
    </button>
  );
}

function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
}

const iconButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40";
const chipClass = "rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60";
const selectedChipClass = "rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
