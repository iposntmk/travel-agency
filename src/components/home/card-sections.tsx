"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeBlogItem, HomeTourCardItem } from "./types";

export function TourCards({ items }: { items: HomeTourCardItem[] }) {
  return <CardRail eyebrow="Our team of local travel experts has curated unique experiences and tours at competitive prices." title="Featured Trips" items={items} href="/tours" kind="tour" />;
}

export function BlogSection({ items }: { items: HomeBlogItem[] }) {
  return (
    <section className="border-b border-[var(--izitour-border)] bg-[#f8f9fa] py-12 md:py-16">
      <div className="container-center">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-2xl font-bold text-[var(--izitour-text)] md:text-3xl lg:text-4xl max-sm:text-[28px]">Travel Guide</h2>
          <p className="text-sm font-medium text-[var(--izitour-text-light)] max-sm:text-[15px]">Get expert advice, destination inspiration, and the best travel tips.</p>
        </div>
        <Carousel items={items} render={(item) => <BlogCard item={item} />} cardClassName="px-4 md:px-3" />
        <div className="mt-8 flex justify-center">
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-lg bg-[var(--izitour-orange)] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow transition-all hover:bg-[var(--izitour-orange-dark)] max-sm:min-h-[44px] max-sm:text-[15px]">See More</Link>
        </div>
      </div>
    </section>
  );
}

function CardRail({ eyebrow, title, items, href, kind }: { eyebrow: string; title: string; items: HomeTourCardItem[]; href: string; kind: "tour" }) {
  return (
    <section className="border-b border-[var(--izitour-border)] bg-white py-12 md:py-16">
      <div className="container-center">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="mb-4 text-2xl font-bold text-[var(--izitour-text)] md:text-3xl lg:text-4xl max-sm:text-[28px]">{title}</h2>
          <p className="mx-auto max-w-3xl px-4 text-sm leading-relaxed text-[var(--izitour-text-light)] md:text-base max-sm:text-[15px]">{eyebrow}</p>
        </div>
        <div className="mb-8 flex justify-center border-b border-[var(--izitour-border)] pb-0.5">
          <button className="border-b-2 border-[var(--izitour-primary)] px-6 py-2 text-sm font-bold uppercase tracking-wide text-[var(--izitour-primary)]">PRIVATE TOURS</button>
        </div>
        <Carousel items={items} render={(item) => <RailCard item={item} kind={kind} />} cardClassName="px-4 md:px-3" />
        <div className="mt-6 flex justify-center md:mt-8">
          <Link href={href} className="rounded-lg bg-[var(--izitour-orange)] px-8 py-3 text-[14px] font-bold uppercase tracking-wider text-white shadow transition-all hover:-translate-y-0.5 hover:bg-[var(--izitour-orange-dark)] max-sm:min-h-[44px] max-sm:px-10 max-sm:py-3.5 max-sm:text-[15px]">See More</Link>
        </div>
      </div>
    </section>
  );
}

function Carousel<T extends { id: string }>({ items, render, cardClassName }: { items: T[]; render: (item: T) => React.ReactNode; cardClassName?: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  useEffect(() => {
    const update = () => setVisible(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const max = Math.max(0, items.length - visible);
  const go = (next: number) => setIndex(Math.max(0, Math.min(next, max)));
  const dots = max + 1;
  return (
    <>
      <div
        className="relative touch-pan-y"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; touchEnd.current = e.touches[0].clientX; }}
        onTouchMove={(e) => { touchEnd.current = e.touches[0].clientX; }}
        onTouchEnd={() => {
          const diff = touchStart.current - touchEnd.current;
          if (Math.abs(diff) > 50) go(diff > 0 ? index + 1 : index - 1);
        }}
      >
        {index > 0 ? <ArrowButton side="left" onClick={() => go(index - 1)} /> : null}
        {index < max ? <ArrowButton side="right" onClick={() => go(index + 1)} /> : null}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(calc(-${index} * (100% / ${visible})))` }}>
            {items.map((item) => <div key={item.id} className={cn("shrink-0", cardClassName)} style={{ width: `${100 / visible}%` }}>{render(item)}</div>)}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {Array.from({ length: dots }).map((_, dot) => (
          <button key={dot} type="button" onClick={() => go(dot)} className={cn("size-2 rounded-full transition-all duration-300 cursor-pointer border border-white/30", dot === index ? "bg-[var(--izitour-primary)]" : "bg-white hover:bg-white/80")} aria-label={`Go to slide ${dot + 1}`} />
        ))}
      </div>
    </>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button type="button" onClick={onClick} className={cn("absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg md:size-10", side === "left" ? "left-2 md:-left-5" : "right-2 md:-right-5")} aria-label={side === "left" ? "Previous" : "Next"}>
      <Icon className="size-5 text-[var(--izitour-text)]" />
    </button>
  );
}

function RailCard({ item }: { item: HomeTourCardItem; kind: "tour" }) {
  return (
    <Link href={item.href} className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Image src={item.image.url} alt={item.image.alt} fill sizes="(min-width:1024px) 33vw, 82vw" className="object-cover transition duration-500 group-hover:scale-105" style={{ objectPosition: item.image.objectPosition }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all group-hover:from-black/95" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 px-4 pb-4 pt-10 text-white md:px-5 md:pb-5">
        <h3 className="line-clamp-2 text-left text-[16px] font-bold leading-tight drop-shadow-md transition-colors group-hover:text-[var(--izitour-primary)] max-sm:text-[18px]">{item.title}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-[var(--izitour-primary)] px-2 py-0.5 text-[11px] font-bold text-white shadow max-sm:text-[13px]">{item.duration}</span>
          <span className="text-[10px] font-medium text-white/90 max-sm:text-[12px]">{item.reviewsCount}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between border-t border-white/20 pt-2.5">
          <span className="text-[18px] font-extrabold text-[var(--izitour-orange)] max-sm:text-[20px]">{item.price}</span>
          <span className="rounded bg-[var(--izitour-orange)] px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-white">View detail</span>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ item }: { item: HomeBlogItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={item.href} className="relative aspect-[16/9] overflow-hidden">
        <Image src={item.image.url} alt={item.image.alt} fill sizes="(max-width:1024px) 82vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: item.image.objectPosition }} />
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--izitour-primary)] px-3 py-1 text-xs font-semibold text-white shadow-md">{item.category}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5 text-left">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--izitour-text-light)]"><Calendar className="size-3.5" /> Last update {item.date}</div>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--izitour-text)] transition-colors group-hover:text-[var(--izitour-primary)] max-sm:text-[17px]"><Link href={item.href}>{item.title}</Link></h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-[var(--izitour-text-light)]">{item.excerpt}</p>
        <Link href={item.href} className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[var(--izitour-primary)]">Read more <ArrowRight className="size-3.5" /></Link>
      </div>
    </article>
  );
}
