"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactChannelSchema, bookingSourceSchema } from "@/schemas/booking";
import { customerSchema } from "@/schemas/customer";
import { submitBooking } from "@/app/actions/submit-booking";
import { clientUuid } from "@/lib/client-uuid";

const formSchema = customerSchema.extend({
  numPax: z.coerce.number().int().min(1).max(40),
  preferredDate: z.string().trim().refine((v) => !Number.isNaN(Date.parse(v)), "Please pick a valid date"),
  contactChannel: contactChannelSchema,
  specialRequest: z.string().trim().max(2000).optional().or(z.literal(""))
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  tourSlug: string;
  tourTitle: string;
  source?: z.infer<typeof bookingSourceSchema>;
}

export function BookingForm({ tourSlug, tourTitle, source = "direct" }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      numPax: 1,
      preferredDate: "",
      contactChannel: "whatsapp",
      specialRequest: ""
    }
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitBooking({
        ...values,
        tourSlug,
        source,
        idempotencyKey: clientUuid()
      });
      if (result.ok) {
        router.push("/booking/confirmation");
        return;
      }
      setServerError(result.error.message);
    });
  };

  const busy = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-slate-600">
        Booking for <strong>{tourTitle}</strong>. No payment required now — our team confirms within 24h.
      </p>

      <Field label="Full name" error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          className={inputClass}
          {...register("name")}
          disabled={busy}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            {...register("email")}
            disabled={busy}
          />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone?.message}>
          <input
            type="tel"
            autoComplete="tel"
            className={inputClass}
            {...register("phone")}
            disabled={busy}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Number of travellers" error={errors.numPax?.message}>
          <input type="number" min={1} max={40} className={inputClass} {...register("numPax")} disabled={busy} />
        </Field>
        <Field label="Preferred date" error={errors.preferredDate?.message}>
          <input type="date" className={inputClass} {...register("preferredDate")} disabled={busy} />
        </Field>
      </div>

      <Field label="Preferred contact channel" error={errors.contactChannel?.message}>
        <select className={inputClass} {...register("contactChannel")} disabled={busy}>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="zalo">Zalo</option>
          <option value="phone">Phone</option>
        </select>
      </Field>

      <Field label="Special request (optional)" error={errors.specialRequest?.message}>
        <textarea rows={4} className={inputClass} {...register("specialRequest")} disabled={busy} />
      </Field>

      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="block w-full rounded-md bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {busy ? "Submitting..." : "Submit booking inquiry"}
      </button>
    </form>
  );
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:cursor-not-allowed disabled:bg-slate-100";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
