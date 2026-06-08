// Server-only filesystem scanner for the sticker library.
// The filesystem is the single source of truth — no hardcoded sticker lists.
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { categoryMeta, CATEGORY_ORDER } from "./categories";

const STICKERS_DIR = join(process.cwd(), "public", "stickers");
const IMAGE_RE = /\.(png|svg|webp|jpe?g)$/i;

export interface DiscoveredCategory {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

export interface DiscoveredSticker {
  id: string; // "category/name"
  category: string;
  name: string; // filename without extension
  src: string; // "/stickers/category/file.ext"
}

async function listImageFiles(category: string): Promise<string[]> {
  try {
    const entries = await readdir(join(STICKERS_DIR, category), { withFileTypes: true });
    return entries.filter((e) => e.isFile() && IMAGE_RE.test(e.name)).map((e) => e.name);
  } catch {
    return [];
  }
}

function toSticker(category: string, file: string): DiscoveredSticker {
  const name = file.replace(IMAGE_RE, "");
  return { id: `${category}/${name}`, category, name, src: `/stickers/${category}/${file}` };
}

/** List all category folders with their sticker counts. */
export async function scanCategories(): Promise<DiscoveredCategory[]> {
  let dirs: string[];
  try {
    const entries = await readdir(STICKERS_DIR, { withFileTypes: true });
    dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }

  const cats = await Promise.all(
    dirs.map(async (id) => {
      const files = await listImageFiles(id);
      const meta = categoryMeta(id);
      return { id, label: meta.label, emoji: meta.emoji, count: files.length };
    })
  );

  // Keep categories that actually contain stickers; sort by known order then name.
  return cats
    .filter((c) => c.count > 0)
    .sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.id);
      const ib = CATEGORY_ORDER.indexOf(b.id);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.label.localeCompare(b.label);
    });
}

/** List stickers in a single category (lazy per-category loading). */
export async function scanCategory(category: string): Promise<DiscoveredSticker[]> {
  // Guard against path traversal — only a bare folder name is allowed.
  if (!/^[a-z0-9-_]+$/i.test(category)) return [];
  const files = await listImageFiles(category);
  return files.map((f) => toSticker(category, f)).sort((a, b) => a.name.localeCompare(b.name));
}

/** Search sticker filenames across all categories. */
export async function searchStickers(query: string): Promise<DiscoveredSticker[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const cats = await scanCategories();
  const out: DiscoveredSticker[] = [];
  for (const c of cats) {
    const items = await scanCategory(c.id);
    for (const s of items) {
      if (s.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)) out.push(s);
    }
  }
  return out;
}
