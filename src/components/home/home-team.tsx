import Image from "next/image";
import type { TeamMember } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import { SectionBand, SectionHead } from "@/components/section";

interface Props {
  members: TeamMember[];
}

export function HomeTeam({ members }: Props) {
  if (members.length === 0) return null;

  return (
    <SectionBand tone="soft">
      <SectionHead
        eyebrow="Meet the team"
        title="People behind your trip"
        subtitle="A small local team that plans, confirms, and guides — so every detail is handled by someone who lives here."
        actionHref="/about-us"
        actionLabel="About us"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => {
          const photo = resolveImage(member.photo, member.name, { variant: "card" });
          return (
            <article
              key={member.id}
              className="rounded-2xl border border-navy-100 bg-white p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-navy-50">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  width={96}
                  height={96}
                  className="h-24 w-24 object-cover"
                  style={photo.objectPosition ? { objectPosition: photo.objectPosition } : undefined}
                />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-navy-950">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-brand-blue">{member.role}</p>
              {member.quote ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{member.quote}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </SectionBand>
  );
}
