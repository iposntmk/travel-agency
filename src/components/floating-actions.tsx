"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowUpIcon, MessengerIcon, WhatsAppIcon } from "@/components/icons";

interface Props {
  whatsappHref: string;
  messengerHref?: string;
  proposalHref: string;
}

export function FloatingActions({ whatsappHref, messengerHref, proposalHref }: Props) {
  const t = useTranslations("actions");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky-box flex flex-col items-end">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp")}
        className="row-needhelp flex size-[50px] items-center justify-center rounded-full bg-[#00947d] text-white shadow-lg transition-all hover:bg-[#007a67] hover:scale-110 active:scale-95 cursor-pointer max-sm:size-[56px]"
      >
        <WhatsAppIcon className="size-6 max-sm:size-7" />
      </a>

      {messengerHref ? (
        <a
          href={messengerHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("messenger")}
          className="row-needhelp mt-3 flex size-[50px] items-center justify-center rounded-full bg-[#00947d] text-white shadow-lg transition-all hover:bg-[#007a67] hover:scale-110 active:scale-95 cursor-pointer max-sm:size-[56px]"
        >
          <MessengerIcon className="size-6 max-sm:size-7" />
        </a>
      ) : null}

      <Link
        href={proposalHref}
        aria-label={t("customTrip")}
        className="row-needhelp mt-3 flex size-[50px] items-center justify-center rounded-full bg-[#00947d] text-white shadow-lg transition-all hover:bg-[#007a67] hover:scale-110 active:scale-95 max-sm:size-[56px]"
      >
        <Image
          src="/images/icons/customize_2.svg"
          alt=""
          width={22}
          height={22}
          className="size-5 max-sm:size-6"
        />
      </Link>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("backToTop")}
        className={`mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition-all hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
