import "server-only";

import sharp from "sharp";
import { IMMUTABLE_CACHE_CONTROL, r2GetObject, r2PutObject, r2PublicUrl } from "@/lib/r2";

export interface MediaVariants {
  thumb: { avif: string; webp: string };
  card: { avif: string; webp: string };
  hero: { avif: string; webp: string };
  og: string;
}

const PRESETS = {
  thumb: { width: 400, height: 300, avifQ: 60, webpQ: 75 },
  card: { width: 800, height: 600, avifQ: 65, webpQ: 75 },
  hero: { width: 1920, height: 1080, avifQ: 70, webpQ: 75 },
} as const;

type PresetName = keyof typeof PRESETS;

export function validateDimensions(width: number | undefined, height: number | undefined): void {
  if ((width ?? 0) > 8000 || (height ?? 0) > 8000) {
    throw new Error(`Image dimensions ${width}x${height} exceed the 8000px limit`);
  }
}

export function variantKey(mediaId: string | number, name: string, format: string): string {
  return `variants/${mediaId}/${name}.${format}`;
}

async function runConcurrent(tasks: Array<() => Promise<void>>, limit: number): Promise<void> {
  const queue = [...tasks];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length > 0) await queue.shift()!();
    })
  );
}

export async function generateVariants(mediaId: string, originalKey: string): Promise<MediaVariants> {
  const buffer = await r2GetObject(originalKey);
  const meta = await sharp(buffer).metadata();
  validateDimensions(meta.width, meta.height);

  const variants: MediaVariants = {
    thumb: { avif: "", webp: "" },
    card: { avif: "", webp: "" },
    hero: { avif: "", webp: "" },
    og: "",
  };

  const tasks: Array<() => Promise<void>> = [];

  for (const [name, preset] of Object.entries(PRESETS) as Array<[PresetName, (typeof PRESETS)[PresetName]]>) {
    tasks.push(async () => {
      const key = variantKey(mediaId, name, "avif");
      const buf = await sharp(buffer)
        .resize(preset.width, preset.height, { fit: "cover", position: "attention", withoutEnlargement: true })
        .avif({ quality: preset.avifQ, effort: 4 })
        .toBuffer();
      await r2PutObject(key, buf, "image/avif", IMMUTABLE_CACHE_CONTROL);
      variants[name].avif = r2PublicUrl(key);
    });

    tasks.push(async () => {
      const key = variantKey(mediaId, name, "webp");
      const buf = await sharp(buffer)
        .resize(preset.width, preset.height, { fit: "cover", position: "attention", withoutEnlargement: true })
        .webp({ quality: preset.webpQ })
        .toBuffer();
      await r2PutObject(key, buf, "image/webp", IMMUTABLE_CACHE_CONTROL);
      variants[name].webp = r2PublicUrl(key);
    });
  }

  tasks.push(async () => {
    const key = variantKey(mediaId, "og", "jpg");
    const buf = await sharp(buffer)
      .resize(1200, 630, { fit: "cover", position: "attention", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await r2PutObject(key, buf, "image/jpeg", IMMUTABLE_CACHE_CONTROL);
    variants.og = r2PublicUrl(key);
  });

  await runConcurrent(tasks, 3);

  return variants;
}
