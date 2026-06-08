// Presentation metadata for background categories (label + emoji).
// Not a list of backgrounds — those are auto-discovered from the filesystem.
// New folders still appear, with a title-cased label + default emoji.

export interface CategoryMeta {
  label: string;
  emoji: string;
}

const META: Record<string, CategoryMeta> = {
  "solid-colors": { label: "Solid Colors", emoji: "🎨" },
  clouds: { label: "Clouds", emoji: "☁️" },
  flowers: { label: "Flowers", emoji: "🌸" },
  watercolor: { label: "Watercolor", emoji: "🖌️" },
  baby: { label: "Baby", emoji: "👶" },
  birthday: { label: "Birthday", emoji: "🎂" },
  travel: { label: "Travel", emoji: "✈️" },
  wedding: { label: "Wedding", emoji: "💍" },
  family: { label: "Family", emoji: "🏠" },
  "magic-fantasy": { label: "Magic & Fantasy", emoji: "⭐" },
  school: { label: "School", emoji: "📚" },
  holidays: { label: "Holidays", emoji: "🎄" },
  "scrapbook-paper": { label: "Scrapbook Paper", emoji: "📷" },
  "pastel-patterns": { label: "Pastel Patterns", emoji: "🌈" },
};

export function categoryMeta(slug: string): CategoryMeta {
  if (META[slug]) return META[slug];
  const label = slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { label, emoji: "🖼️" };
}

export const CATEGORY_ORDER = Object.keys(META);
