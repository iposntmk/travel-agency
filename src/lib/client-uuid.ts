/**
 * RFC 4122 v4 UUID safe for client components.
 *
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS / localhost).
 * Dev serves the app over plain HTTP on a LAN IP, where `crypto.randomUUID`
 * is `undefined`, so calling it throws "crypto.randomUUID is not a function".
 * Falls back to `crypto.getRandomValues`, then to `Math.random` as a last resort.
 */
export function clientUuid(): string {
  const cryptoObj = globalThis.crypto;

  if (typeof cryptoObj?.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoObj?.getRandomValues === "function") {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Set version (4) and variant (RFC 4122) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}
