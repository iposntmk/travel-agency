"use client";

import { Share2 } from "lucide-react";

interface Props {
  url: string;
  title: string;
}

const channels = [
  { name: "f", bg: "bg-[#748BBC]", href: (u: string) => `https://www.facebook.com/sharer.php?u=${u}` },
  { name: "X", bg: "bg-[#54D1F8]", href: (u: string, t: string) => `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
  { name: "W", bg: "bg-[#25d366]", href: (u: string, t: string) => `https://api.whatsapp.com/send?text=${t} ${u}` },
  { name: "in", bg: "bg-[#3585B3]", href: (u: string, t: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${t}` },
];

export function TourShareBar({ url, title }: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm font-bold text-navy-950">Share:</span>
      <div className="flex gap-2">
        {channels.map((ch) => (
          <a
            key={ch.name}
            href={ch.href(url, title)}
            target="_blank"
            rel="nofollow"
            className={`size-[30px] rounded ${ch.bg} flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity`}
          >
            {ch.name === "S" ? <Share2 className="size-3" /> : ch.name}
          </a>
        ))}
      </div>
    </div>
  );
}
