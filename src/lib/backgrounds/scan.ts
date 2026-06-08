// Server-only filesystem scanner for the background library.
// The filesystem is the single source of truth — no hardcoded background lists.
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { categoryMeta, CATEGORY_ORDER } from "./categories";

const DIR = join(process.cwd(), "public", "backgrounds");
const IMAGE_RE = /\.(png|jpe?g|webp|svg)$/i;

export interface DiscoveredCategory {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

export interface DiscoveredBackground {
  id: string; // "category/name"
  category: string;
  name: string;
  src: string; // "/backgrounds/category/file.ext"
}

async function listFiles(category: string): Promise<string[]> {
  try {
    const entries = await readdir(join(DIR, category), { withFileTypes: true });
    return entries.filter((e) => e.isFile() && IMAGE_RE.test(e.name)).map((e) => e.name);
  } catch {
    return [];
  }
}

function toBg(category: string, file: string): DiscoveredBackground {
  const name = file.replace(IMAGE_RE, "");
  return { id: `${category}/${name}`, category, name, src: `/backgrounds/${category}/${file}` };
}

export async function scanCategories(): Promise<DiscoveredCategory[]> {
  let dirs: string[];
  try {
    const entries = await readdir(DIR, { withFileTypes: true });
    dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
  const cats = await Promise.all(
    dirs.map(async (id) => {
      const files = await listFiles(id);
      const meta = categoryMeta(id);
      return { id, label: meta.label, emoji: meta.emoji, count: files.length };
    })
  );
  return cats
    .filter((c) => c.count > 0)
    .sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.id);
      const ib = CATEGORY_ORDER.indexOf(b.id);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.label.localeCompare(b.label);
    });
}

export async function scanCategory(category: string): Promise<DiscoveredBackground[]> {
  if (!/^[a-z0-9-_]+$/i.test(category)) return [];
  const files = await listFiles(category);
  return files.map((f) => toBg(category, f)).sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchBackgrounds(query: string): Promise<DiscoveredBackground[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const cats = await scanCategories();
  const out: DiscoveredBackground[] = [];
  for (const c of cats) {
    const items = await scanCategory(c.id);
    for (const b of items) {
      if (b.name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)) out.push(b);
    }
  }
  return out;
}
