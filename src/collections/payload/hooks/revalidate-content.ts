import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidateTag } from "next/cache";

type SluggedDoc = {
  id: number | string;
  slug?: string | null;
};

function tagsForDoc(listTag: string, itemPrefix: string, doc?: SluggedDoc | null): string[] {
  return doc?.slug ? [listTag, `${itemPrefix}-${doc.slug}`] : [listTag];
}

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags));
}

function revalidateContentTags(tags: string[]): void {
  for (const tag of uniqueTags(tags)) {
    try {
      revalidateTag(tag);
    } catch (err) {
      if (!(err instanceof Error) || !err.message.includes("static generation store missing")) {
        throw err;
      }
    }
  }
}

function afterChange(listTag: string, itemPrefix: string): CollectionAfterChangeHook<SluggedDoc> {
  return ({ doc, previousDoc }) => {
    revalidateContentTags([...tagsForDoc(listTag, itemPrefix, doc), ...tagsForDoc(listTag, itemPrefix, previousDoc)]);
    return doc;
  };
}

function afterDelete(listTag: string, itemPrefix: string): CollectionAfterDeleteHook<SluggedDoc> {
  return ({ doc }) => {
    revalidateContentTags(tagsForDoc(listTag, itemPrefix, doc));
    return doc;
  };
}

function afterCollectionChange(listTag: string): CollectionAfterChangeHook {
  return ({ doc }) => {
    revalidateContentTags([listTag]);
    return doc;
  };
}

function afterCollectionDelete(listTag: string): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidateContentTags([listTag]);
    return doc;
  };
}

export const revalidateTourAfterChange = afterChange("tours", "tour");
export const revalidateTourAfterDelete = afterDelete("tours", "tour");
export const revalidateCruiseAfterChange = afterChange("cruises", "cruise");
export const revalidateCruiseAfterDelete = afterDelete("cruises", "cruise");
export const revalidateDestinationAfterChange = afterChange("destinations", "destination");
export const revalidateDestinationAfterDelete = afterDelete("destinations", "destination");
export const revalidatePostAfterChange = afterChange("posts", "post");
export const revalidatePostAfterDelete = afterDelete("posts", "post");
export const revalidateNavigationAfterChange = afterCollectionChange("navigation");
export const revalidateNavigationAfterDelete = afterCollectionDelete("navigation");
export const revalidateSiteSettingsAfterChange = afterCollectionChange("site-settings");
export const revalidateSiteSettingsAfterDelete = afterCollectionDelete("site-settings");
