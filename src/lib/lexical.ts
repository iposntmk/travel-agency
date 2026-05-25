interface LexicalNode {
  type?: string;
  version?: number;
  text?: string;
  format?: number | string;
  tag?: string;
  url?: string;
  listType?: "bullet" | "number" | "check";
  children?: LexicalNode[];
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
      return `<${tag}>${renderChildren(node.children)}</${tag}>`;
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
