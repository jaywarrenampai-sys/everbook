// Presentation metadata for sticker categories (label + emoji).
// Not a list of stickers — stickers are auto-discovered from the filesystem.
// New folders still appear, with a title-cased label + default emoji.

export interface CategoryMeta {
  label: string;
  emoji: string;
}

const META: Record<string, CategoryMeta> = {
  "scrapbook-essentials": { label: "Scrapbook Essentials", emoji: "🧸" },
  "cute-dreams": { label: "Cute Dreams", emoji: "☁️" },
  "baby-memories": { label: "Baby Memories", emoji: "👶" },
  "floral-garden": { label: "Floral Garden", emoji: "🌸" },
  "birthday-party": { label: "Birthday Party", emoji: "🎂" },
  "travel-memories": { label: "Travel Memories", emoji: "✈️" },
  "love-wedding": { label: "Love & Wedding", emoji: "💕" },
  "woodland-friends": { label: "Woodland Friends", emoji: "🦊" },
  "cute-animals": { label: "Cute Animals", emoji: "🦕" },
};

export function categoryMeta(slug: string): CategoryMeta {
  if (META[slug]) return META[slug];
  const label = slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { label, emoji: "✨" };
}

export const CATEGORY_ORDER = Object.keys(META);
