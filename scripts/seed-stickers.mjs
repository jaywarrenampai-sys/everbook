// ─── Sample sticker seeder ─────────────────────────────────────────────────────
// Run once:  node scripts/seed-stickers.mjs
// Writes ~20 sample path-only SVG stickers into the new category folders.
//
// This is ONLY for test assets. The app does NOT read this file — stickers are
// auto-discovered from public/stickers at runtime. To add real artwork later,
// just drop .png/.svg/.webp files into any category folder. No code changes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public", "stickers");

// path-only primitives (so the print PDF can parse <path> elements too)
const P = {
  heart: (c) => `<path d="M50 86 C20 64 8 44 8 30 C8 16 20 8 32 8 C40 8 46 12 50 20 C54 12 60 8 68 8 C80 8 92 16 92 30 C92 44 80 64 50 86 Z" fill="${c}"/>`,
  star: (c) => `<path d="M50 6 L61 38 L95 38 L67 58 L78 91 L50 71 L22 91 L33 58 L5 38 L39 38 Z" fill="${c}"/>`,
  cloud: (c) => `<path d="M28 70 C14 70 6 60 6 50 C6 40 14 32 26 33 C30 20 42 12 55 14 C66 16 74 24 76 35 C88 35 96 44 96 54 C96 64 88 70 78 70 Z" fill="${c}"/>`,
  flower: (c) => `<path d="M50 17 A11 11 0 1 0 50 39 A11 11 0 1 0 50 17 Z" fill="${c}"/><path d="M71 31 A11 11 0 1 0 71 53 A11 11 0 1 0 71 31 Z" fill="${c}"/><path d="M63 56 A11 11 0 1 0 63 78 A11 11 0 1 0 63 56 Z" fill="${c}"/><path d="M37 56 A11 11 0 1 0 37 78 A11 11 0 1 0 37 56 Z" fill="${c}"/><path d="M29 31 A11 11 0 1 0 29 53 A11 11 0 1 0 29 31 Z" fill="${c}"/><path d="M50 36 A12 12 0 1 0 50 60 A12 12 0 1 0 50 36 Z" fill="#ffd166"/>`,
  leaf: (c) => `<path d="M50 92 C18 72 18 28 50 8 C82 28 82 72 50 92 Z" fill="${c}"/>`,
  airplane: (c) => `<path d="M48 6 C52 6 56 14 56 30 L88 50 V58 L56 48 V70 L66 78 V84 L48 78 L30 84 V78 L40 70 V48 L8 58 V50 L40 30 C40 14 44 6 48 6 Z" fill="${c}"/>`,
  sun: (c) => `<path d="M50 4 L58 22 L78 14 L72 34 L94 38 L76 50 L94 62 L72 66 L78 86 L58 78 L50 96 L42 78 L22 86 L28 66 L6 62 L24 50 L6 38 L28 34 L22 14 L42 22 Z" fill="${c}"/><path d="M50 30 A20 20 0 1 0 50 70 A20 20 0 1 0 50 30 Z" fill="#fff3b0"/>`,
  paw: (c) => `<path d="M50 60 C38 60 30 70 30 80 C30 90 40 92 50 88 C60 92 70 90 70 80 C70 70 62 60 50 60 Z" fill="${c}"/><path d="M32 39 A7 7 0 1 0 32 53 A7 7 0 1 0 32 39 Z" fill="${c}"/><path d="M44 31 A7 7 0 1 0 44 45 A7 7 0 1 0 44 31 Z" fill="${c}"/><path d="M56 31 A7 7 0 1 0 56 45 A7 7 0 1 0 56 31 Z" fill="${c}"/><path d="M68 39 A7 7 0 1 0 68 53 A7 7 0 1 0 68 39 Z" fill="${c}"/>`,
  fish: (c) => `<path d="M20 50 C30 32 60 32 76 50 C60 68 30 68 20 50 Z" fill="${c}"/><path d="M76 50 L92 38 V62 Z" fill="${c}"/>`,
  cake: (c) => `<path d="M22 54 H78 V84 H22 Z" fill="${c}"/><path d="M14 84 H86 V90 H14 Z" fill="#e9c46a"/><path d="M48 32 H52 V54 H48 Z" fill="#ffffff"/><path d="M50 22 C54 26 54 32 50 36 C46 32 46 26 50 22 Z" fill="#fca311"/>`,
  balloon: (c) => `<path d="M50 12 C66 12 76 26 76 42 C76 60 60 72 50 74 C40 72 24 60 24 42 C24 26 34 12 50 12 Z" fill="${c}"/><path d="M46 74 L54 74 L50 82 Z" fill="${c}"/>`,
  gift: (c) => `<path d="M16 40 H84 V88 H16 Z" fill="${c}"/><path d="M12 28 H88 V42 H12 Z" fill="#ffffff"/><path d="M45 28 H55 V88 H45 Z" fill="#ffffff"/>`,
  moon: (c) => `<path d="M58 12 C40 16 28 32 28 50 C28 68 40 84 58 88 C44 80 36 66 36 50 C36 34 44 20 58 12 Z" fill="${c}"/>`,
  pencil: (c) => `<path d="M22 84 L30 60 L66 24 L80 38 L44 74 L22 84 Z" fill="${c}"/><path d="M66 24 L80 38 L72 46 L58 32 Z" fill="#ffd166"/>`,
  book: (c) => `<path d="M14 24 C30 18 46 18 50 24 V84 C46 78 30 78 14 84 Z" fill="${c}"/><path d="M86 24 C70 18 54 18 50 24 V84 C54 78 70 78 86 84 Z" fill="#ffffff"/>`,
  camera: (c) => `<path d="M10 32 H30 L36 22 H64 L70 32 H90 V82 H10 Z" fill="${c}"/><path d="M50 44 A16 16 0 1 0 50 76 A16 16 0 1 0 50 44 Z" fill="#ffffff"/><path d="M50 52 A8 8 0 1 0 50 68 A8 8 0 1 0 50 52 Z" fill="${c}"/>`,
  frame: (c) => `<path d="M6 6 H94 V20 H6 Z M6 80 H94 V94 H6 Z M6 6 H20 V94 H6 Z M80 6 H94 V94 H80 Z" fill="${c}"/>`,
};

// (category, filename, primitive, color)
const SEED = [
  ["scrapbook-essentials", "camera", "camera", "#4895EF"],
  ["scrapbook-essentials", "star", "star", "#FFD166"],
  ["scrapbook-essentials", "heart", "heart", "#FF6B81"],
  ["hearts-love", "heart-pink", "heart", "#FF6B81"],
  ["hearts-love", "heart-red", "heart", "#C9184A"],
  ["baby-memories", "moon", "moon", "#A0C4FF"],
  ["baby-memories", "cloud", "cloud", "#90E0EF"],
  ["birthday-party", "cake", "cake", "#FF8FA3"],
  ["birthday-party", "balloon", "balloon", "#F72585"],
  ["birthday-party", "gift", "gift", "#9D4EDD"],
  ["travel-journal", "airplane", "airplane", "#4CC9F0"],
  ["travel-journal", "sun", "sun", "#FCA311"],
  ["flowers-nature", "flower", "flower", "#FF8FA3"],
  ["flowers-nature", "leaf", "leaf", "#52B788"],
  ["clouds-sky", "cloud", "cloud", "#A0C4FF"],
  ["clouds-sky", "sun", "sun", "#FFD166"],
  ["pets-animals", "paw", "paw", "#9b6b43"],
  ["pets-animals", "fish", "fish", "#4CC9F0"],
  ["school-memories", "pencil", "pencil", "#FCA311"],
  ["school-memories", "book", "book", "#06D6A0"],
  ["frames-borders", "frame-peach", "frame", "#F4A261"],
  ["frames-borders", "frame-mint", "frame", "#52B788"],
];

for (const [cat, name, prim, color] of SEED) {
  const dir = join(PUB, cat);
  mkdirSync(dir, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${P[prim](color)}</svg>\n`;
  writeFileSync(join(dir, `${name}.svg`), svg, "utf8");
}

console.log(`✅ Seeded ${SEED.length} sample stickers into public/stickers/`);
