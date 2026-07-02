"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { checkVoucher } from "@/app/actions/validate-voucher";

interface VoucherCheckFormProps {
  productType: "tours" | "experiences";
  productId: number | string;
}

/**
 * "Have a voucher code?" mini-form on experience/tour pages. Validates the
 * cross-sell code so the traveller knows the discount applies before they
 * send the inquiry (final application happens at confirmation by staff).
 */
export function VoucherCheckForm({ productType, productId }: VoucherCheckFormProps) {
  const t = useTranslations("voucher");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "checking" || code.trim() === "") return;
    setStatus("checking");

    const result = await checkVoucher({ code, productType, productId });
    if (!result.ok) {
      setStatus("error");
      setMessage(result.error.message);
      return;
    }
    if (result.data.valid) {
      setStatus("valid");
      setMessage(t("valid", { discount: result.data.discountLabel ?? "", name: result.data.promotionName ?? "" }));
    } else {
      setStatus("invalid");
      setMessage(t(`invalid.${result.data.reason ?? "not-found"}`));
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-navy-950">{t("title")}</p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="TC-XXXX-XXXX"
          className="h-10 flex-1 rounded-lg border border-slate-300 px-3 font-mono text-sm uppercase outline-none focus:border-brand-green"
        />
        <button
          type="submit"
          disabled={status === "checking"}
          className="h-10 rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {status === "checking" ? "…" : t("check")}
        </button>
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${status === "valid" ? "text-brand-green" : "text-red-600"}`}>{message}</p>
      ) : null}
    </form>
  );
}
