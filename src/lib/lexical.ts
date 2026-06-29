import type { Media } from "@/payload-types";
import { resolveImage } from "./media";

interface LexicalNode {
  type?: string;
  version?: number;
  text?: string;
  format?: number | string;
  tag?: string;
  url?: string;
  listType?: "bullet" | "number" | "check";
  value?: number | Media | null;
  relationTo?: string;
  children?: LexicalNode[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface LexicalRoot {
  root?: { type?: string; children?: LexicalNode[]; [k: string]: unknown } | null;
  [k: string]: unknown;
}

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTextNode(node: LexicalNode): string {
  let text = escapeHtml(node.text ?? "");
  const format = typeof node.format === "number" ? node.format : 0;
  if (format & FORMAT_BOLD) text = `<strong>${text}</strong>`;
  if (format & FORMAT_ITALIC) text = `<em>${text}</em>`;
  if (format & FORMAT_UNDERLINE) text = `<u>${text}</u>`;
  if (format & FORMAT_CODE) text = `<code>${text}</code>`;
  return text;
}

function renderChildren(children: LexicalNode[] | undefined): string {
  if (!children) return "";
  return children.map(renderNode).join("");
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case "text":
      return renderTextNode(node);
    case "linebreak":
      return "<br />";
    case "paragraph":
      return `<p>${renderChildren(node.children)}</p>`;
    case "heading": {
      const tag = node.tag && /^h[1-6]$/.test(node.tag) ? node.tag : "h2";
      const id = slugify(extractPlainChildren(node.children));
      const idAttr = id ? ` id="${id}"` : "";
      return `<${tag}${idAttr}>${renderChildren(node.children)}</${tag}>`;
    }
    case "upload": {
      const media = node.value && typeof node.value === "object" ? node.value : null;
      if (!media) return "";
      const resolved = resolveImage(media, media.alt ?? "", { variant: "card" });
      if (resolved.isFallback) return "";
      const dims =
        resolved.width && resolved.height ? ` width="${resolved.width}" height="${resolved.height}"` : "";
      const img = `<img src="${escapeHtml(resolved.url)}" alt="${escapeHtml(resolved.alt)}"${dims} loading="lazy" decoding="async" />`;
      const caption = media.alt ? `<figcaption>${escapeHtml(media.alt)}</figcaption>` : "";
      return `<figure>${img}${caption}</figure>`;
    }
    case "quote":
      return `<blockquote>${renderChildren(node.children)}</blockquote>`;
    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      return `<${tag}>${renderChildren(node.children)}</${tag}>`;
    }
    case "listitem":
      return `<li>${renderChildren(node.children)}</li>`;
    case "link": {
      const safeHref = node.url && /^(https?:|mailto:|tel:|\/)/i.test(node.url) ? node.url : "#";
      return `<a href="${escapeHtml(safeHref)}" rel="noreferrer">${renderChildren(node.children)}</a>`;
    }
    default:
      return renderChildren(node.children);
  }
}

export function lexicalToHtml(value: LexicalRoot | null | undefined): string {
  if (!value || !value.root || !value.root.children) return "";
  return value.root.children.map(renderNode).join("");
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function lexicalToHeadings(value: LexicalRoot | null | undefined): TocHeading[] {
  if (!value?.root?.children) return [];
  const headings: TocHeading[] = [];
  const walk = (nodes: LexicalNode[]): void => {
    for (const node of nodes) {
      if (node.type === "heading" && node.tag && /^h[2-4]$/.test(node.tag)) {
        const text = extractPlainChildren(node.children);
        if (text) {
          headings.push({ id: slugify(text), text, level: parseInt(node.tag[1], 10) });
        }
      }
      if (node.children) walk(node.children);
    }
  };
  walk(value.root.children);
  return headings;
}

function extractPlainChildren(children: LexicalNode[] | undefined): string {
  if (!children) return "";
  const parts: string[] = [];
  for (const node of children) {
    if (node.type === "text" && node.text) parts.push(node.text);
    if (node.children) parts.push(extractPlainChildren(node.children));
  }
  return parts.join("").trim();
}

export function lexicalToPlainText(value: LexicalRoot | null | undefined, maxLength = 200): string {
  if (!value || !value.root || !value.root.children) return "";
  const parts: string[] = [];
  const walk = (nodes: LexicalNode[] | undefined): void => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.type === "text" && node.text) parts.push(node.text);
      if (node.children) walk(node.children);
      if (node.type === "paragraph" || node.type === "heading") parts.push(" ");
    }
  };
  walk(value.root.children);
  const text = parts.join("").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
