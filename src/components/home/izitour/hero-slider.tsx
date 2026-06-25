"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "./types";

const AUTO_ROTATE_INTERVAL = 5000;

interface Props {
  slides: HeroSlide[];
  title: string;
  subtitle: string;
}

export function IzitourHeroSlider({ slides, title, subtitle }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const transitionRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const list = slides.length > 0 ? slides : [{ id: "fallback", image: { url: "/og-fallback.svg", alt: title } }];

  const goToSlide = useCallback(
    (index: number) => {
      if (transitionRef.current) return;
      transitionRef.current = true;
      setCurrent(index);
      window.setTimeout(() => {
        transitionRef.current = false;
      }, 500);
    },
    []
  );

  const goNext = useCallback(() => goToSlide((current + 1) % list.length), [current, goToSlide, list.length]);

  useEffect(() => {
    if (paused || list.length < 2) return;
    const timer = window.setInterval(() => setCurrent((value) => (value + 1) % list.length), AUTO_ROTATE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, list.length]);

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) goNext();
    else goToSlide(current === 0 ? list.length - 1 : current - 1);
  }

  return (
    <section
      className="relative h-[500px] w-full overflow-hidden md:h-[650px] lg:h-[750px] xl:h-[800px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
        touchEndX.current = event.touches[0].clientX;
      }}
      onTouchMove={(event) => {
        touchEndX.current = event.touches[0].clientX;
      }}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero carousel"
    >
      {list.map((slide, index) => (
        <div
          key={slide.id}
          className={cn("absolute inset-0 transition-opacity duration-700", index === current ? "z-10 opacity-100" : "z-0 opacity-0")}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.image.url}
            alt={slide.image.alt}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="100vw"
            className="object-cover transition-transform duration-[8000ms]"
            style={{ objectPosition: slide.image.objectPosition, transform: index === current ? "scale(1)" : "scale(1.05)" }}
          />
        </div>
      ))}
      <div className="absolute inset-0 z-10 bg-black/40" />
      <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
        <div className="container-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-[36.75px] font-normal leading-[44.1px] tracking-tight text-white drop-shadow-md md:text-6xl md:font-extrabold md:leading-tight">
              {title}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-white/90 drop-shadow-md md:text-lg">{subtitle}</p>
            <div className="flex flex-col items-center pt-2">
              <Link
                href="/free-proposal"
                className="inline-flex min-h-12 items-center rounded-lg bg-[var(--izitour-orange)] px-7 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--izitour-orange-dark)]"
              >
                Start designing my trip
              </Link>
              <Dots list={list} current={current} goToSlide={goToSlide} mobile />
            </div>
          </div>
        </div>
      </div>
      <Dots list={list} current={current} goToSlide={goToSlide} />
    </section>
  );
}

function Dots({ list, current, goToSlide, mobile = false }: { list: HeroSlide[]; current: number; goToSlide: (index: number) => void; mobile?: boolean }) {
  return (
    <div className={mobile ? "mt-4 flex gap-2 md:hidden" : "absolute bottom-16 left-1/2 z-30 hidden -translate-x-1/2 gap-2.5 md:bottom-24 md:flex"}>
      {list.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => goToSlide(index)}
          className={cn("size-3 rounded-full transition-all", index === current ? "bg-[var(--izitour-primary)] md:w-8" : "bg-white/60 hover:bg-white/90")}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === current}
        />
      ))}
    </div>
  );
}
