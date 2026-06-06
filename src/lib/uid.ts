/**
 * Safe unique-id generator.
 *
 * `crypto.randomUUID()` is ONLY available in secure contexts (https or
 * localhost). On a phone testing over plain http (e.g. http://192.168.x.x)
 * or in some mobile browsers it is undefined and throws — which crashes the
 * whole client render to a blank page. This helper falls back gracefully.
 */
export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
  } catch {
    /* fall through */
  }
  // Last-resort fallback (non-crypto, still unique enough for client ids)
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
