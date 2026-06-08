// ─── Sticker library generator ────────────────────────────────────────────────
// Run once:  node scripts/generate-stickers.mjs
// Emits:
//   public/stickers/<category>/<name>.svg      (the sticker assets)
//   src/lib/stickers/manifest.ts               (client-safe list + search keywords)
//   src/lib/stickers/paths.ts                  (vector path data for the print PDF)
//
// Architecture note: everything is generated from the ONE source of truth below
// (PRIMITIVES + CATEGORIES), so the SVG files, the editor manifest, and the PDF
// path data can never drift apart. To add a Premium Pack later, add a category
// block + primitives and re-run — no app code changes required.

import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public", "stickers");
const LIB = join(ROOT, "src", "lib", "stickers");

// ── helpers ────────────────────────────────────────────────────────────────────
const circle = (cx, cy, r, fill) => ({
  d: `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r} ${r} 0 1 0 ${cx} ${cy - r} Z`,
  fill,
});
const path = (d, fill) => ({ d, fill });

// MAIN is replaced by the variant colour. Accent colours are literal.
const M = "MAIN";

// ── primitives: id -> (returns array of {d, fill}) ──────────────────────────────
const PRIMITIVES = {
  heart: () => [path("M50 86 C20 64 8 44 8 30 C8 16 20 8 32 8 C40 8 46 12 50 20 C54 12 60 8 68 8 C80 8 92 16 92 30 C92 44 80 64 50 86 Z", M)],
  star: () => [path("M50 6 L61 38 L95 38 L67 58 L78 91 L50 71 L22 91 L33 58 L5 38 L39 38 Z", M)],
  sparkle: () => [path("M50 8 C54 36 64 46 92 50 C64 54 54 64 50 92 C46 64 36 54 8 50 C36 46 46 36 50 8 Z", M)],
  cloud: () => [path("M28 70 C14 70 6 60 6 50 C6 40 14 32 26 33 C30 20 42 12 55 14 C66 16 74 24 76 35 C88 35 96 44 96 54 C96 64 88 70 78 70 Z", M)],
  leaf: () => [
    path("M50 92 C18 72 18 28 50 8 C82 28 82 72 50 92 Z", M),
    path("M50 16 L50 84", "#ffffff00"),
  ],
  tree: () => [
    path("M44 78 H56 V92 H44 Z", "#9b6b43"),
    path("M50 8 L78 50 L60 50 L82 80 L18 80 L40 50 L22 50 Z", M),
  ],
  balloon: () => [
    path("M50 12 C66 12 76 26 76 42 C76 60 60 72 50 74 C40 72 24 60 24 42 C24 26 34 12 50 12 Z", M),
    path("M46 74 L54 74 L50 82 Z", M),
    path("M50 82 C48 88 53 90 50 96", "#ffffff00"),
  ],
  gift: () => [
    path("M16 40 H84 V88 H16 Z", M),
    path("M12 28 H88 V42 H12 Z", "#ffffff"),
    path("M45 28 H55 V88 H45 Z", "#ffffff"),
    path("M50 28 C40 14 24 16 32 30 Z", "#ffffff"),
    path("M50 28 C60 14 76 16 68 30 Z", "#ffffff"),
  ],
  cake: () => [
    path("M14 84 H86 V90 H14 Z", "#e9c46a"),
    path("M22 54 H78 V84 H22 Z", M),
    path("M22 54 C30 46 38 62 50 54 C62 46 70 62 78 54 V64 H22 Z", "#ffffff"),
    path("M48 32 H52 V54 H48 Z", "#ffffff"),
    path("M50 22 C54 26 54 32 50 36 C46 32 46 26 50 22 Z", "#fca311"),
  ],
  rainbow: () => [
    path("M10 82 A40 40 0 0 1 90 82 H76 A26 26 0 0 0 24 82 Z", "#ff6b81"),
    path("M24 82 A26 26 0 0 1 76 82 H64 A14 14 0 0 0 36 82 Z", "#ffd166"),
    path("M36 82 A14 14 0 0 1 64 82 Z", "#4cc9f0"),
  ],
  butterfly: () => [
    path("M50 50 C30 20 8 24 14 44 C8 60 30 70 50 52 Z", M),
    path("M50 50 C70 20 92 24 86 44 C92 60 70 70 50 52 Z", M),
    path("M48 28 H52 C53 50 53 62 50 74 C47 62 47 50 48 28 Z", "#3a3a3a"),
  ],
  car: () => [
    path("M10 56 L24 40 H62 L82 52 H90 V66 H10 Z", M),
    path("M30 44 H58 L70 54 H30 Z", "#cfe8ff"),
    circle(30, 66, 8, "#2b2b2b"),
    circle(72, 66, 8, "#2b2b2b"),
  ],
  airplane: () => [path("M48 6 C52 6 56 14 56 30 L88 50 V58 L56 48 V70 L66 78 V84 L48 78 L30 84 V78 L40 70 V48 L8 58 V50 L40 30 C40 14 44 6 48 6 Z", M)],
  bow: () => [
    path("M50 50 L20 34 C12 30 12 50 20 46 L50 50 L80 34 C88 30 88 50 80 46 Z", M),
    path("M50 50 L24 64 C16 68 16 50 24 52 Z", M),
    path("M50 50 L76 64 C84 68 84 50 76 52 Z", M),
    circle(50, 50, 7, "#ffffff"),
  ],
  paw: () => [
    path("M50 60 C38 60 30 70 30 80 C30 90 40 92 50 88 C60 92 70 90 70 80 C70 70 62 60 50 60 Z", M),
    circle(32, 46, 7, M),
    circle(44, 38, 7, M),
    circle(56, 38, 7, M),
    circle(68, 46, 7, M),
  ],
  fish: () => [
    path("M20 50 C30 32 60 32 76 50 C60 68 30 68 20 50 Z", M),
    path("M76 50 L92 38 V62 Z", M),
    circle(34, 46, 3, "#2b2b2b"),
  ],
  icecream: () => [
    path("M38 50 H62 L50 92 Z", "#e9c46a"),
    circle(42, 40, 13, M),
    circle(58, 40, 13, "#ffffff"),
    circle(50, 30, 14, M),
  ],
  crown: () => [
    path("M16 76 H84 V86 H16 Z", M),
    path("M16 76 L24 40 L38 60 L50 32 L62 60 L76 40 L84 76 Z", M),
    circle(24, 40, 4, "#ffffff"),
    circle(50, 32, 4, "#ffffff"),
    circle(76, 40, 4, "#ffffff"),
  ],
  gem: () => [
    path("M28 22 H72 L92 44 L50 90 L8 44 Z", M),
    path("M28 22 L40 44 H8 Z", "#ffffff66"),
    path("M72 22 L60 44 H92 Z", "#ffffff66"),
  ],
  smiley: () => [
    circle(50, 50, 40, M),
    circle(38, 42, 4, "#2b2b2b"),
    circle(62, 42, 4, "#2b2b2b"),
    path("M34 58 C40 72 60 72 66 58 C60 64 40 64 34 58 Z", "#2b2b2b"),
  ],
  moon: () => [path("M58 12 C40 16 28 32 28 50 C28 68 40 84 58 88 C44 80 36 66 36 50 C36 34 44 20 58 12 Z", M)],
  tulip: () => [
    path("M50 44 C50 22 36 16 36 30 C30 20 20 26 26 38 C18 38 18 52 28 52 H72 C82 52 82 38 74 38 C80 26 70 20 64 30 C64 16 50 22 50 44 Z", M),
    path("M47 52 H53 V88 H47 Z", "#52b788"),
  ],
  flower: () => [
    circle(50, 30, 13, M),
    circle(70, 44, 13, M),
    circle(62, 68, 13, M),
    circle(38, 68, 13, M),
    circle(30, 44, 13, M),
    circle(50, 50, 12, "#ffd166"),
  ],
  ball: () => [
    circle(50, 50, 40, M),
    path("M50 24 L62 34 L58 50 L42 50 L38 34 Z", "#2b2b2b"),
    circle(50, 50, 40, "#ffffff00"),
  ],
  pencil: () => [
    path("M22 84 L30 60 L66 24 L80 38 L44 74 L22 84 Z", M),
    path("M66 24 L80 38 L72 46 L58 32 Z", "#ffd166"),
    path("M22 84 L30 78 L34 82 Z", "#2b2b2b"),
  ],
  book: () => [
    path("M14 24 C30 18 46 18 50 24 V84 C46 78 30 78 14 84 Z", M),
    path("M86 24 C70 18 54 18 50 24 V84 C54 78 70 78 86 84 Z", "#ffffff"),
    path("M50 24 V84", "#ffffff00"),
  ],
  sun: () => [
    path("M50 4 L58 22 L78 14 L72 34 L94 38 L76 50 L94 62 L72 66 L78 86 L58 78 L50 96 L42 78 L22 86 L28 66 L6 62 L24 50 L6 38 L28 34 L22 14 L42 22 Z", M),
    circle(50, 50, 20, "#fff3b0"),
  ],
};

// strip zero-alpha helper paths from PDF (they are guide lines only)
const isVisible = (p) => p.fill !== "#ffffff00";

// ── category config ─────────────────────────────────────────────────────────────
const PALETTE = [
  "#FF6B81", "#FF8FA3", "#FFB3C1", "#FF5C8A", "#C9184A",
  "#FFD166", "#FCA311", "#F4A261", "#FFADAD", "#FFD6A5",
  "#06D6A0", "#2EC4B6", "#83C5BE", "#52B788", "#80ED99",
  "#4CC9F0", "#4895EF", "#56CFE1", "#90E0EF", "#A0C4FF",
  "#B5179E", "#C77DFF", "#9D4EDD", "#E0AAFF", "#F72585",
];

const SYN = {
  heart: ["love", "heart", "หัวใจ", "รัก"],
  star: ["star", "ดาว"],
  sparkle: ["sparkle", "shine", "ประกาย"],
  cloud: ["cloud", "เมฆ"],
  leaf: ["leaf", "ใบไม้"],
  tree: ["tree", "ต้นไม้", "pine"],
  balloon: ["balloon", "ลูกโป่ง"],
  gift: ["gift", "present", "ของขวัญ"],
  cake: ["cake", "เค้ก"],
  rainbow: ["rainbow", "สายรุ้ง"],
  butterfly: ["butterfly", "ผีเสื้อ"],
  car: ["car", "รถ"],
  airplane: ["airplane", "plane", "เครื่องบิน"],
  bow: ["bow", "ribbon", "โบว์"],
  paw: ["paw", "อุ้งเท้า", "dog", "cat"],
  fish: ["fish", "ปลา"],
  icecream: ["ice cream", "ไอติม", "ไอศกรีม"],
  crown: ["crown", "มงกุฎ"],
  gem: ["gem", "diamond", "เพชร"],
  smiley: ["smiley", "face", "หน้ายิ้ม"],
  moon: ["moon", "พระจันทร์"],
  tulip: ["tulip", "ทิวลิป", "flower"],
  flower: ["flower", "ดอกไม้"],
  ball: ["ball", "ลูกบอล", "soccer"],
  pencil: ["pencil", "ดินสอ"],
  book: ["book", "หนังสือ"],
  sun: ["sun", "พระอาทิตย์"],
};

const CATEGORIES = [
  { id: "hearts", label: "Hearts", th: "หัวใจ", emoji: "❤️", prims: ["heart"] },
  { id: "flowers", label: "Flowers", th: "ดอกไม้", emoji: "🌸", prims: ["flower", "tulip"] },
  { id: "nature", label: "Nature", th: "ธรรมชาติ", emoji: "🌳", prims: ["leaf", "tree"] },
  { id: "stars", label: "Stars", th: "ดวงดาว", emoji: "⭐", prims: ["star", "sparkle"] },
  { id: "clouds", label: "Clouds", th: "เมฆ", emoji: "☁️", prims: ["cloud"] },
  { id: "birthday", label: "Birthday", th: "วันเกิด", emoji: "🎂", prims: ["cake", "balloon", "gift"] },
  { id: "baby", label: "Baby", th: "เด็กน้อย", emoji: "👶", prims: ["heart", "star", "moon", "cloud"] },
  { id: "pets", label: "Pets", th: "สัตว์เลี้ยง", emoji: "🐶", prims: ["paw", "fish"] },
  { id: "christmas", label: "Christmas", th: "คริสต์มาส", emoji: "🎄", prims: ["tree", "gift", "star"] },
  { id: "celebration", label: "Celebration", th: "เฉลิมฉลอง", emoji: "🎉", prims: ["balloon", "sparkle", "gift"] },
  { id: "travel", label: "Travel", th: "ท่องเที่ยว", emoji: "✈️", prims: ["airplane", "sun"] },
  { id: "summer", label: "Summer", th: "ฤดูร้อน", emoji: "🏖️", prims: ["sun", "icecream", "fish"] },
  { id: "school", label: "School", th: "โรงเรียน", emoji: "🏫", prims: ["pencil", "book", "star"] },
  { id: "wedding", label: "Wedding", th: "งานแต่ง", emoji: "💍", prims: ["gem", "bow", "heart"] },
  { id: "cartoon", label: "Cartoon", th: "การ์ตูน", emoji: "🎨", prims: ["smiley", "star"] },
  { id: "food", label: "Food", th: "อาหาร", emoji: "🍓", prims: ["icecream", "cake"] },
  { id: "vehicles", label: "Vehicles", th: "ยานพาหนะ", emoji: "🚗", prims: ["car", "airplane"] },
  { id: "sports", label: "Sports", th: "กีฬา", emoji: "⚽", prims: ["ball"] },
  { id: "cute", label: "Cute", th: "น่ารัก", emoji: "🌈", prims: ["heart", "smiley", "rainbow"] },
  { id: "misc", label: "Miscellaneous", th: "อื่นๆ", emoji: "🎁", prims: ["gem", "crown", "sparkle", "moon"] },
];

const PER_CATEGORY = 12;

// ── build ───────────────────────────────────────────────────────────────────────
if (existsSync(PUB)) rmSync(PUB, { recursive: true, force: true });
mkdirSync(PUB, { recursive: true });
mkdirSync(LIB, { recursive: true });

const manifest = [];
const pathData = {};

for (const cat of CATEGORIES) {
  const dir = join(PUB, cat.id);
  mkdirSync(dir, { recursive: true });

  for (let i = 0; i < PER_CATEGORY; i++) {
    const prim = cat.prims[i % cat.prims.length];
    const color = PALETTE[(i * 7 + cat.id.length) % PALETTE.length];
    const nn = String(i + 1).padStart(2, "0");
    const name = `${prim}-${nn}`;
    const id = `${cat.id}-${nn}`;
    const file = `/stickers/${cat.id}/${name}.svg`;

    const parts = PRIMITIVES[prim]().map((p) => ({ ...p, fill: p.fill === M ? color : p.fill }));

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      parts.filter(isVisible).map((p) => `<path d="${p.d}" fill="${p.fill}"/>`).join("") +
      `</svg>\n`;
    writeFileSync(join(dir, `${name}.svg`), svg, "utf8");

    manifest.push({
      id,
      category: cat.id,
      name,
      file,
      keywords: [cat.id, cat.label.toLowerCase(), cat.th, ...(SYN[prim] ?? [prim])],
    });

    pathData[id] = {
      viewBox: "0 0 100 100",
      paths: parts.filter(isVisible).map((p) => ({ d: p.d, fill: p.fill })),
    };
  }
}

// ── manifest.ts (client) ─────────────────────────────────────────────────────────
const manifestTs =
  `// AUTO-GENERATED by scripts/generate-stickers.mjs — do not edit by hand.\n` +
  `export interface StickerCategory { id: string; label: string; th: string; emoji: string }\n` +
  `export interface StickerDef { id: string; category: string; name: string; file: string; keywords: string[] }\n\n` +
  `export const STICKER_CATEGORIES: StickerCategory[] = ${JSON.stringify(
    CATEGORIES.map((c) => ({ id: c.id, label: c.label, th: c.th, emoji: c.emoji })),
    null,
    2
  )};\n\n` +
  `export const STICKERS: StickerDef[] = ${JSON.stringify(manifest, null, 2)};\n`;
writeFileSync(join(LIB, "manifest.ts"), manifestTs, "utf8");

// ── paths.ts (server / PDF) ──────────────────────────────────────────────────────
const pathsTs =
  `// AUTO-GENERATED by scripts/generate-stickers.mjs — do not edit by hand.\n` +
  `// Vector path data so the print PDF can draw stickers with pdf-lib drawSvgPath.\n` +
  `export interface StickerPath { d: string; fill: string }\n` +
  `export interface StickerArt { viewBox: string; paths: StickerPath[] }\n\n` +
  `export const STICKER_PATHS: Record<string, StickerArt> = ${JSON.stringify(pathData, null, 2)};\n`;
writeFileSync(join(LIB, "paths.ts"), pathsTs, "utf8");

console.log(
  `✅ Generated ${manifest.length} stickers across ${CATEGORIES.length} categories`
);
console.log(`   public/stickers/*  +  src/lib/stickers/manifest.ts  +  paths.ts`);
