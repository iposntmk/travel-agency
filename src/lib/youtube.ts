const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extract an 11-character YouTube video id from a watch/short/embed URL or a
 * bare id. Returns null for empty or non-YouTube input.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (ID_RE.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return ID_RE.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}
