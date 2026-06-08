// Presentation metadata for sticker categories (label + emoji).
// This is NOT a list of stickers — stickers are auto-discovered from the
// filesystem. This only prettifies known folder slugs. Any NEW folder still
// appears automatically, using a title-cased label and a default emoji.

export interface CategoryMeta {
  label: string;
  emoji: string;
}

const META: Record<string, CategoryMeta> = {
  "scrapbook-essentials": { label: "Scrapbook Essentials", emoji: "📷" },
  "hearts-love": { label: "Hearts & Love", emoji: "💕" },
  "baby-memories": { label: "Baby Memories", emoji: "👶" },
  "birthday-party": { label: "Birthday Party", emoji: "🎂" },
  "travel-journal": { label: "Travel Journal", emoji: "✈️" },
  "flowers-nature": { label: "Flowers & Nature", emoji: "🌸" },
  "clouds-sky": { label: "Clouds & Sky", emoji: "☁️" },
  "pets-animals": { label: "Pets & Animals", emoji: "🐶" },
  "school-memories": { label: "School Memories", emoji: "🏫" },
  "frames-borders": { label: "Frames & Borders", emoji: "🖼️" },
};

/** Resolve metadata for a folder slug, with a graceful fallback for new folders. */
export function categoryMeta(slug: string): CategoryMeta {
  if (META[slug]) return META[slug];
  const label = slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { label, emoji: "🎨" };
}

/** Preferred display order for the known categories; unknown folders sort after. */
export const CATEGORY_ORDER = Object.keys(META);
