import { getTranslations } from "next-intl/server";
import { BlogCard } from "@/components/blog-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { SectionHead } from "@/components/section";
import type { Post } from "@/payload-types";

interface HubGuidesProps {
  destinationTitle: string;
  destinationSlug: string;
  /** Posts with guideCategory eat/drink → "Must eat". */
  mustEat: Post[];
  /** Posts with guideCategory general/before-trip/service → "Trip inspiration". */
  inspiration: Post[];
}

function GuideRow({ posts }: { posts: Post[] }) {
  return (
    <MobileScrollRow className="gap-5 pb-3 md:grid md:grid-cols-3 md:overflow-visible">
      {posts.slice(0, 3).map((post) => (
        <div key={post.id} className="w-[82vw] shrink-0 md:w-auto">
          <BlogCard post={post} />
        </div>
      ))}
    </MobileScrollRow>
  );
}

/**
 * "Must eat" + "Trip inspiration" hub sections fed from Posts guide categories
 * (the blog is the content engine; the hub is the surface).
 */
export async function HubGuides({ destinationTitle, destinationSlug, mustEat, inspiration }: HubGuidesProps) {
  if (mustEat.length === 0 && inspiration.length === 0) return null;
  const t = await getTranslations("hub");

  return (
    <>
      {mustEat.length > 0 ? (
        <section id="must-eat" className="mt-16 scroll-mt-24">
          <SectionHead
            eyebrow={t("mustEatEyebrow")}
            title={t("mustEatTitle", { destination: destinationTitle })}
            actionHref={`/blog/destination/${destinationSlug}`}
            actionLabel={t("allGuides")}
          />
          <GuideRow posts={mustEat} />
        </section>
      ) : null}

      {inspiration.length > 0 ? (
        <section id="inspiration" className="mt-16 scroll-mt-24">
          <SectionHead
            eyebrow={t("inspirationEyebrow")}
            title={t("inspirationTitle", { destination: destinationTitle })}
            actionHref={`/blog/destination/${destinationSlug}`}
            actionLabel={t("allGuides")}
          />
          <GuideRow posts={inspiration} />
        </section>
      ) : null}
    </>
  );
}
