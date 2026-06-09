// Presentation metadata for sticker STYLE collections (label + emoji).
// Not a list of stickers — stickers are auto-discovered from the filesystem.
// Users pick an art style; drop PNG/WEBP packs into a folder and it appears.
// New folders still work, with a title-cased label + default emoji.

export interface CategoryMeta {
  label: string;
  emoji: string;
}

const META: Record<string, CategoryMeta> = {
  "pastel-watercolor": { label: "Pastel Watercolor", emoji: "🎀" },
  "kawaii-japanese": { label: "Kawaii Japanese", emoji: "🌈" },
  "hand-doodle": { label: "Hand Doodle", emoji: "✏️" },
  "vintage-scrapbook": { label: "Vintage Scrapbook", emoji: "📜" },
  "korean-aesthetic": { label: "Korean Aesthetic", emoji: "🌸" },
  "flat-vivid-pop": { label: "Flat Vivid Pop", emoji: "🍬" },
  "magical-fantasy": { label: "Magical Fantasy", emoji: "✨" },
  "embroidery-felt": { label: "Embroidery / Felt", emoji: "🧵" },
  "crayon-kids": { label: "Crayon Kids", emoji: "🖍" },
  "puffy-bubble": { label: "Puffy Bubble", emoji: "🫧" },
  // Future collections (appear automatically once a folder has art):
  "oil-painting": { label: "Oil Painting", emoji: "🎨" },
  "clay-art": { label: "Clay Art", emoji: "🧱" },
  "anime-chibi": { label: "Anime Chibi", emoji: "👧" },
  "disney-storybook": { label: "Disney Storybook", emoji: "🏰" },
  "gold-foil-luxury": { label: "Gold Foil Luxury", emoji: "🥇" },
  "pixel-art": { label: "Pixel Art", emoji: "🟦" },
  "cottagecore": { label: "Cottagecore", emoji: "🌿" },
  "scandinavian-minimal": { label: "Scandinavian Minimal", emoji: "🤍" },
  "neon-doodles": { label: "Neon Doodles", emoji: "💡" },
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
