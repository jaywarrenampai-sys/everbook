import { BookPage } from "./types";

export interface Spread {
  left: BookPage | null;
  right: BookPage | null;
  label: string;
  /** Index of the page used as the edit target for this spread. */
  leadIndex: number;
}

/**
 * Pair pages into book spreads — the SAME pairing the editor uses:
 *   - cover alone (left)
 *   - page 1 alone (right)
 *   - then [2,3], [4,5], … as left|right
 * Shared so the editor and preview render identical spreads.
 */
export function buildSpreads(pages: BookPage[]): Spread[] {
  const out: Spread[] = [];
  if (pages[0]) out.push({ left: pages[0], right: null, label: "ปก", leadIndex: 0 });
  if (pages[1]) out.push({ left: null, right: pages[1], label: "หน้า 1", leadIndex: 1 });
  for (let i = 2; i < pages.length; i += 2) {
    out.push({
      left: pages[i],
      right: pages[i + 1] ?? null,
      label: pages[i + 1] ? `หน้า ${i}-${i + 1}` : `หน้า ${i}`,
      leadIndex: i,
    });
  }
  return out;
}
