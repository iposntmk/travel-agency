const controlCharactersExceptTabAndNewline = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const scriptOrStyleBlock = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const lineBreakTag = /<\s*br\s*\/?\s*>/gi;
const blockClosingTag = /<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi;
const htmlTag = /<[^>]*>/g;

export function sanitizePlainText(value: string): string {
  const withoutHtml = value
    .replace(/\r\n?/g, "\n")
    .replace(controlCharactersExceptTabAndNewline, "")
    .replace(scriptOrStyleBlock, "")
    .replace(lineBreakTag, "\n")
    .replace(blockClosingTag, "\n")
    .replace(htmlTag, "");

  return withoutHtml
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeOptionalPlainText(value?: string | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const sanitized = sanitizePlainText(value);
  return sanitized.length > 0 ? sanitized : undefined;
}
