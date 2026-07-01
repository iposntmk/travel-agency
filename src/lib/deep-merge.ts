// Recursively merge plain objects. Scalars and arrays in `source` overwrite
// those in `target`; nested plain objects merge key-by-key. Used to layer
// translation messages: English JSON → locale JSON → Payload DB (DB wins).
// Inputs are never mutated — a fresh object is always returned.
type Plain = Record<string, unknown>;

function isPlainObject(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T extends Plain>(target: T, source: Plain): T {
  const out: Plain = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = out[key];
    out[key] = isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }
  return out as T;
}
