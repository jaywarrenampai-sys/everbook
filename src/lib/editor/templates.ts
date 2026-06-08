// ─── Page Templates ────────────────────────────────────────────────────────
// Slot coordinates are 0–1 fractions of the page's printable area — the same
// coordinate system used for the print export. Templates are generated from a
// small set of layout factories so the library can scale to hundreds of designs
// without hand-authoring each one. Changing a template only repositions content
// (see applyTemplate in layout.ts) — photos/stickers/backgrounds/text are kept.

export interface TemplateSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: string;
  label: string;         // Thai display name
  icon: string;          // emoji icon
  category: string;      // category id
  photoCount: number;    // number of photo slots
  keywords: string[];    // for search (style/category/etc.)
  slots: TemplateSlot[];
}

export interface TemplateCategory {
  id: string;
  label: string;
  emoji: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: "full-photo", label: "Full Photo", emoji: "📷" },
  { id: "classic", label: "Classic", emoji: "🖼" },
  { id: "modern", label: "Modern", emoji: "✨" },
  { id: "scrapbook", label: "Scrapbook", emoji: "📔" },
  { id: "baby", label: "Baby", emoji: "👶" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "love-wedding", label: "Love & Wedding", emoji: "💕" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "creative-collage", label: "Creative Collage", emoji: "🎨" },
];

// ── layout factories ─────────────────────────────────────────────────────────
const PAD = 0.05;
const GAP = 0.025;
const S = (id: number, x: number, y: number, width: number, height: number): TemplateSlot => ({ id: `s${id}`, x, y, width, height });

function full(pad = 0): TemplateSlot[] {
  return [S(0, pad, pad, 1 - pad * 2, 1 - pad * 2)];
}
/** One photo leaving a caption/date strip at the bottom. */
function fullCaption(strip = 0.16): TemplateSlot[] {
  return [S(0, 0, 0, 1, 1 - strip)];
}
/** One photo on the left leaving a text block on the right. */
function textBlock(): TemplateSlot[] {
  return [S(0, PAD, PAD, 0.56, 1 - PAD * 2)];
}
function cols(n: number, pad = PAD, gap = GAP, y = pad, h = 1 - pad * 2): TemplateSlot[] {
  const w = (1 - pad * 2 - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => S(i, pad + i * (w + gap), y, w, h));
}
function rows(n: number, pad = PAD, gap = GAP): TemplateSlot[] {
  const h = (1 - pad * 2 - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => S(i, pad, pad + i * (h + gap), 1 - pad * 2, h));
}
function grid(c: number, r: number, pad = PAD, gap = GAP): TemplateSlot[] {
  const w = (1 - pad * 2 - gap * (c - 1)) / c;
  const h = (1 - pad * 2 - gap * (r - 1)) / r;
  const out: TemplateSlot[] = [];
  let k = 0;
  for (let yy = 0; yy < r; yy++) for (let xx = 0; xx < c; xx++) out.push(S(k++, pad + xx * (w + gap), pad + yy * (h + gap), w, h));
  return out;
}
/** Rows where each row has a given number of columns, e.g. [2,3] → 5 photos. */
function mixedRows(spec: number[], pad = PAD, gap = GAP): TemplateSlot[] {
  const R = spec.length;
  const h = (1 - pad * 2 - gap * (R - 1)) / R;
  const out: TemplateSlot[] = [];
  let k = 0;
  spec.forEach((c, ri) => {
    const w = (1 - pad * 2 - gap * (c - 1)) / c;
    const y = pad + ri * (h + gap);
    for (let i = 0; i < c; i++) out.push(S(k++, pad + i * (w + gap), y, w, h));
  });
  return out;
}
/** Big photo on the left + two stacked small on the right. */
function featureLeft(ratio = 0.62, pad = PAD, gap = GAP): TemplateSlot[] {
  const bigW = (1 - pad * 2 - gap) * ratio;
  const smW = 1 - pad * 2 - gap - bigW;
  const smH = (1 - pad * 2 - gap) / 2;
  return [
    S(0, pad, pad, bigW, 1 - pad * 2),
    S(1, pad + bigW + gap, pad, smW, smH),
    S(2, pad + bigW + gap, pad + smH + gap, smW, smH),
  ];
}
/** Big photo on top + two side by side beneath. */
function heroTop(ratio = 0.6, pad = PAD, gap = GAP): TemplateSlot[] {
  const bigH = (1 - pad * 2 - gap) * ratio;
  const smH = 1 - pad * 2 - gap - bigH;
  const smW = (1 - pad * 2 - gap) / 2;
  return [
    S(0, pad, pad, 1 - pad * 2, bigH),
    S(1, pad, pad + bigH + gap, smW, smH),
    S(2, pad + smW + gap, pad + bigH + gap, smW, smH),
  ];
}
/** Two uneven columns. */
function colsUneven(rA: number, pad = PAD, gap = GAP): TemplateSlot[] {
  const avail = 1 - pad * 2 - gap;
  const wA = avail * rA;
  const wB = avail - wA;
  return [S(0, pad, pad, wA, 1 - pad * 2), S(1, pad + wA + gap, pad, wB, 1 - pad * 2)];
}
/** Two overlapping, offset photos (modern). */
function offset2(): TemplateSlot[] {
  return [S(0, 0.06, 0.08, 0.56, 0.6), S(1, 0.42, 0.42, 0.52, 0.52)];
}
/** Two padded photos like polaroids. */
function polaroid2(): TemplateSlot[] {
  return [S(0, 0.1, 0.18, 0.36, 0.5), S(1, 0.54, 0.32, 0.36, 0.5)];
}
/** Asymmetrical 4-photo grid. */
function asym4(): TemplateSlot[] {
  return [
    S(0, PAD, PAD, 0.58, 0.58),
    S(1, 0.66, PAD, 0.29, 0.28),
    S(2, 0.66, 0.36, 0.29, 0.27),
    S(3, PAD, 0.66, 0.9, 0.29),
  ];
}
/** Modern mosaic of 4. */
function mosaic4(): TemplateSlot[] {
  return [
    S(0, PAD, PAD, 0.42, 0.6),
    S(1, 0.49, PAD, 0.46, 0.28),
    S(2, 0.49, 0.36, 0.21, 0.59),
    S(3, 0.72, 0.36, 0.23, 0.59),
  ];
}

let _gid = 0;
function T(label: string, category: string, slots: TemplateSlot[], keywords: string[] = []): Template {
  const cat = TEMPLATE_CATEGORIES.find((c) => c.id === category);
  return {
    id: `t${_gid++}-${category}`,
    label,
    icon: cat?.emoji ?? "▦",
    category,
    photoCount: slots.length,
    keywords: [category, ...keywords, `${slots.length}`],
    slots,
  };
}

// ── Base templates (stable ids — used by the AI auto layout) ──
const BASE: Template[] = [
  { id: "blank", label: "ว่างเปล่า", icon: "⬜", category: "full-photo", photoCount: 0, keywords: ["blank", "0"], slots: [] },
  { id: "full", label: "เต็มหน้า", icon: "📷", category: "full-photo", photoCount: 1, keywords: ["full", "1"], slots: full(0.04) },
  { id: "two-h", label: "บน-ล่าง", icon: "⬛", category: "classic", photoCount: 2, keywords: ["2", "rows"], slots: rows(2, 0.04, 0.03) },
  { id: "two-v", label: "ซ้าย-ขวา", icon: "▮▮", category: "classic", photoCount: 2, keywords: ["2", "cols"], slots: cols(2, 0.04, 0.03) },
  { id: "four-grid", label: "ตาราง 4", icon: "⊞", category: "classic", photoCount: 4, keywords: ["4", "grid"], slots: grid(2, 2, 0.04, 0.03) },
  { id: "feature-left", label: "ใหญ่ซ้าย + 2", icon: "▉▪", category: "classic", photoCount: 3, keywords: ["3", "feature"], slots: featureLeft(0.62, 0.04, 0.03) },
];

// ── Generated library ──
const GEN: Template[] = [
  // Full Photo
  T("Full Bleed", "full-photo", full(0), ["fullbleed", "edge"]),
  T("Full Inset", "full-photo", full(0.07), ["frame"]),
  T("Full + Caption", "full-photo", fullCaption(0.16), ["caption"]),
  T("Full + Date", "full-photo", fullCaption(0.1), ["date"]),
  T("Full + Text Block", "full-photo", textBlock(), ["text", "story"]),
  T("Hero Image", "full-photo", heroTop(0.74), ["hero"]),

  // Classic
  T("Side by Side", "classic", cols(2), ["2"]),
  T("Vertical Split", "classic", cols(2, 0.08, 0.03), ["2", "split"]),
  T("Top & Bottom", "classic", rows(2), ["2"]),
  T("Three Columns", "classic", cols(3), ["3"]),
  T("Three Rows", "classic", rows(3), ["3"]),
  T("Hero + Two Small", "classic", featureLeft(0.62), ["3", "hero"]),
  T("Grid of Four", "classic", grid(2, 2), ["4", "grid"]),
  T("One + Two", "classic", heroTop(0.6), ["3"]),

  // Modern
  T("Offset Photos", "modern", offset2(), ["overlap", "2"]),
  T("Polaroid Style", "modern", polaroid2(), ["polaroid", "2"]),
  T("Modern Offset", "modern", colsUneven(0.6), ["2", "split"]),
  T("Magazine Style", "modern", mixedRows([1, 2]), ["3", "magazine"]),
  T("Asymmetrical Grid", "modern", asym4(), ["4", "asymmetric"]),
  T("Modern Mosaic", "modern", mosaic4(), ["4", "mosaic"]),
  T("Clean Hero", "modern", heroTop(0.66), ["3", "apple"]),

  // Scrapbook
  T("Scrapbook Duo", "scrapbook", cols(2, 0.1, 0.05), ["2", "frame"]),
  T("Scrapbook Trio", "scrapbook", cols(3, 0.08, 0.05), ["3", "frame"]),
  T("Scrapbook Grid", "scrapbook", grid(2, 2, 0.09, 0.05), ["4", "frame"]),
  T("Memory Journal", "scrapbook", fullCaption(0.22), ["journal", "caption"]),
  T("Scrapbook Six", "scrapbook", grid(3, 2, 0.07, 0.04), ["6"]),

  // Baby
  T("Baby Portrait", "baby", fullCaption(0.18), ["1", "caption"]),
  T("Baby Duo", "baby", cols(2), ["2"]),
  T("Baby Feature", "baby", featureLeft(0.6), ["3"]),
  T("Baby Grid", "baby", grid(2, 2), ["4"]),
  T("Baby Memories", "baby", grid(3, 2), ["6"]),

  // Travel
  T("Travel Story", "travel", featureLeft(0.58), ["3", "story"]),
  T("Travel Magazine", "travel", mixedRows([1, 2]), ["3", "magazine"]),
  T("Travel Collage 5", "travel", mixedRows([2, 3]), ["5", "collage"]),
  T("Travel Collage 6", "travel", grid(3, 2), ["6", "collage"]),
  T("Panorama + Two", "travel", heroTop(0.62), ["3", "pano"]),

  // Birthday
  T("Birthday Duo", "birthday", cols(2), ["2"]),
  T("Birthday Grid", "birthday", grid(2, 2), ["4"]),
  T("Birthday Collage 5", "birthday", mixedRows([2, 3]), ["5", "collage"]),
  T("Birthday Collage 6", "birthday", grid(3, 2), ["6", "collage"]),
  T("Birthday Nine", "birthday", grid(3, 3), ["9", "collage"]),

  // Love & Wedding
  T("Love Portrait", "love-wedding", fullCaption(0.16), ["1", "caption"]),
  T("Love Duo", "love-wedding", cols(2), ["2"]),
  T("Wedding Feature", "love-wedding", featureLeft(0.62), ["3"]),
  T("Wedding Grid", "love-wedding", grid(2, 2), ["4"]),
  T("Wedding Hero", "love-wedding", heroTop(0.7), ["3", "hero"]),

  // Family
  T("Family Album", "family", grid(2, 2), ["4", "album"]),
  T("Family Six", "family", grid(3, 2), ["6"]),
  T("Family Nine", "family", grid(3, 3), ["9"]),
  T("Family Feature", "family", featureLeft(0.6), ["3"]),
  T("Family Rows", "family", rows(3), ["3"]),

  // Creative Collage
  T("Collage Five", "creative-collage", mixedRows([2, 3]), ["5"]),
  T("Collage Six", "creative-collage", mixedRows([3, 3]), ["6"]),
  T("Collage Seven", "creative-collage", mixedRows([3, 4]), ["7"]),
  T("Collage Nine", "creative-collage", grid(3, 3), ["9"]),
  T("Storyboard", "creative-collage", mixedRows([1, 2, 2]), ["5", "storyboard"]),
  T("Mosaic Four", "creative-collage", mosaic4(), ["4", "mosaic"]),
  T("Asymmetric Five", "creative-collage", mixedRows([2, 3], 0.06, 0.03), ["5", "asymmetric"]),
];

export const TEMPLATES: Template[] = [...BASE, ...GEN];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
