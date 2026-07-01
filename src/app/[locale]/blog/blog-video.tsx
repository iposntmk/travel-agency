import type { SiteSetting } from "@/payload-types";
import { parseYouTubeId } from "@/lib/youtube";

interface BlogVideoProps {
  media: NonNullable<SiteSetting["blogMedia"]> | null;
}

export function BlogVideo({ media }: BlogVideoProps) {
  const id = parseYouTubeId(media?.videoUrl);
  if (!id) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-4 text-center">
        {media?.videoEyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            {media.videoEyebrow}
          </p>
        ) : null}
        {media?.videoTitle ? (
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            {media.videoTitle}
          </h2>
        ) : null}
        {media?.videoSubtitle ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-navy-600">{media.videoSubtitle}</p>
        ) : null}
        <div className="mx-auto mt-8 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-navy-950 shadow-elevated">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={media?.videoTitle || "Travel video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
