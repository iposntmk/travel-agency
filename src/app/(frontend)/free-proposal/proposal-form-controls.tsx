"use client";

import { useFormContext, type Path } from "react-hook-form";
import type { CustomInquiryFormValues } from "./proposal-form-options";

type FieldName = Path<CustomInquiryFormValues>;

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      {children}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  disabled
}: {
  name: FieldName;
  label: string;
  type?: string;
  disabled?: boolean;
}) {
  const { register } = useFormContext<CustomInquiryFormValues>();
  return (
    <Field label={label} error={useFieldError(name)}>
      <input className={fieldClass} type={type} disabled={disabled} {...register(name)} />
    </Field>
  );
}

export function TextAreaField({ name, label, disabled }: { name: FieldName; label: string; disabled?: boolean }) {
  const { register } = useFormContext<CustomInquiryFormValues>();
  return (
    <Field label={label} error={useFieldError(name)}>
      <textarea className={`${fieldClass} min-h-28`} disabled={disabled} {...register(name)} />
    </Field>
  );
}

export function CheckboxField({ name, label, disabled }: { name: FieldName; label: string; disabled?: boolean }) {
  const { register } = useFormContext<CustomInquiryFormValues>();
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" disabled={disabled} {...register(name)} />
      {label}
    </label>
  );
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className="block">
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

export function useFieldError(name: FieldName): string | undefined {
  const { formState } = useFormContext<CustomInquiryFormValues>();
  const error = formState.errors[name as keyof CustomInquiryFormValues];
  return typeof error?.message === "string" ? error.message : undefined;
}

const fieldClass = "w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:cursor-not-allowed disabled:bg-slate-100";
