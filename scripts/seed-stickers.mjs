// ─── Premium pastel sticker seeder ─────────────────────────────────────────
// Run once:  node scripts/seed-stickers.mjs
// Writes pastel, white-outlined, soft-shadowed SVG stickers into the 9 sticker
// folders. The app auto-discovers them — it never reads this file. Drop real
// watercolor .png/.webp packs into the folders later and they appear with no
// code change (and replace these).

import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public", "stickers");

// soft pastel palette
const C = {
  pink: "#f6c3d5", peach: "#ffd5bd", cream: "#fdeecb", mint: "#bfe6d6",
  sage: "#cfe0bd", lavender: "#ddccf3", babyblue: "#c4e3f6", yellow: "#fbeaa0",
  sky: "#bfe0f5", rose: "#f4a9c0", leaf: "#a9d6b5", brown: "#d8b89a",
};

// shape helpers — every visible shape gets a soft white outline
const OUT = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const P = (d, f) => `<path d="${d}" fill="${f}" ${OUT}/>`;
const PA = (d, f) => `<path d="${d}" fill="${f}" fill-rule="evenodd" ${OUT}/>`; // annulus
const CR = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${OUT}/>`;
const EL = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${OUT}/>`;
const eye = (x, y, r = 2.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5b5048"/>`;
const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#5b5048" stroke-width="1.6" stroke-linecap="round"/>`;
const ann = (cx, cy, ro, ri, f) => PA(`M${cx} ${cy - ro} A${ro} ${ro} 0 1 0 ${cx} ${cy + ro} A${ro} ${ro} 0 1 0 ${cx} ${cy - ro} Z M${cx} ${cy - ri} A${ri} ${ri} 0 1 1 ${cx} ${cy + ri} A${ri} ${ri} 0 1 1 ${cx} ${cy - ri} Z`, f);

// ── motifs: id -> (color) => inner svg markup ──
const M = {
  heart: (c) => P("M50 82 C26 63 14 47 14 33 C14 22 23 14 32 14 C40 14 46 18 50 25 C54 18 60 14 68 14 C77 14 86 22 86 33 C86 47 74 63 50 82 Z", c),
  star: (c) => P("M50 12 L60 38 L88 38 L66 55 L74 84 L50 67 L26 84 L34 55 L12 38 L40 38 Z", c),
  moon: (c) => P("M62 14 C44 18 32 33 32 50 C32 67 44 82 62 86 C48 78 41 65 41 50 C41 35 48 22 62 14 Z", c),
  cloud: (c) => P("M30 68 C18 68 10 59 10 49 C10 40 17 33 27 34 C31 23 42 16 53 18 C63 20 70 28 71 38 C82 38 90 46 90 56 C90 63 84 68 76 68 Z", c),
  rainbow: () =>
    P("M12 80 A38 38 0 0 1 88 80 H74 A24 24 0 0 0 26 80 Z", C.rose) +
    P("M26 80 A24 24 0 0 1 74 80 H62 A12 12 0 0 0 38 80 Z", C.peach) +
    P("M38 80 A12 12 0 0 1 62 80 Z", C.babyblue),
  sun: (c) => P("M50 6 L57 22 L74 14 L70 32 L88 36 L72 47 L88 58 L70 62 L74 80 L57 72 L50 90 L43 72 L26 80 L30 62 L12 58 L28 47 L12 36 L30 32 L26 14 L43 22 Z", c) + CR(50, 47, 16, "#fff6d6"),
  flower: (c) => CR(50, 28, 13, c) + CR(70, 44, 13, c) + CR(62, 67, 13, c) + CR(38, 67, 13, c) + CR(30, 44, 13, c) + CR(50, 48, 12, C.yellow),
  daisy: (c) => [0, 45, 90, 135].map((a) => { const r = (a * Math.PI) / 180; return EL(50 + Math.cos(r) * 22, 48 + Math.sin(r) * 22, 13, 7, "#fff").replace("/>", ` transform="rotate(${a} ${50 + Math.cos(r) * 22} ${48 + Math.sin(r) * 22})"/>`); }).join("") + CR(50, 48, 12, c),
  tulip: (c) => P("M50 40 C50 20 36 14 36 28 C30 18 20 24 26 36 C18 36 18 50 28 50 H72 C82 50 82 36 74 36 C80 24 70 18 64 28 C64 14 50 20 50 40 Z", c) + P("M48 50 H52 V86", C.leaf),
  rose: (c) => CR(50, 48, 24, c) + P("M50 32 C40 38 40 54 50 60 C60 54 60 38 50 32 Z", C.rose) + CR(50, 48, 6, C.rose),
  leaf: (c) => P("M50 88 C20 70 20 30 50 12 C80 30 80 70 50 88 Z", c) + line(50, 22, 50, 80),
  camera: (c) => P("M12 34 H30 L36 24 H64 L70 34 H88 V82 H12 Z", c) + CR(50, 56, 15, "#fff") + CR(50, 56, 9, C.babyblue) + P("M74 40 h8 v5 h-8 Z", "#fff"),
  bow: (c) => P("M50 50 L22 36 C14 32 14 50 22 46 L50 50 L78 36 C86 32 86 50 78 46 Z", c) + P("M50 50 L26 64 C18 68 18 50 26 53 Z", c) + P("M50 50 L74 64 C82 68 82 50 74 53 Z", c) + CR(50, 50, 7, "#fff"),
  gift: (c) => P("M18 42 H82 V84 H18 Z", c) + P("M14 30 H86 V44 H14 Z", "#fff") + P("M45 30 H55 V84 H45 Z", "#fff") + P("M50 30 C40 16 24 18 32 32 Z", c) + P("M50 30 C60 16 76 18 68 32 Z", c),
  balloon: (c) => EL(50, 40, 26, 30, c) + P("M46 70 L54 70 L50 78 Z", c) + `<path d="M50 78 C48 84 53 88 50 94" stroke="#fff" stroke-width="2.4" fill="none"/>`,
  cake: (c) => P("M22 54 H78 V84 H22 Z", c) + P("M14 84 H86 V90 H14 Z", C.cream) + P("M22 54 C30 46 38 62 50 54 C62 46 70 62 78 54 V64 H22 Z", "#fff") + P("M48 32 H52 V54 H48 Z", "#fff") + P("M50 22 C54 26 54 32 50 36 C46 32 46 26 50 22 Z", C.peach),
  cupcake: (c) => P("M30 54 H70 L64 86 H36 Z", C.cream) + P("M26 54 C26 38 74 38 74 54 Z", c) + CR(50, 36, 6, C.rose),
  partyhat: (c) => P("M50 14 L74 80 H26 Z", c) + CR(50, 12, 6, "#fff") + CR(40, 46, 3, "#fff") + CR(58, 60, 3, "#fff") + CR(46, 68, 3, "#fff"),
  plane: (c) => P("M48 8 C52 8 56 16 56 30 L86 50 V58 L56 48 V68 L66 76 V82 L48 76 L30 82 V76 L40 68 V48 L10 58 V50 L40 30 C40 16 44 8 48 8 Z", c),
  ring: (c) => ann(50, 56, 22, 12, c) + P("M50 14 L60 30 L50 40 L40 30 Z", C.babyblue),
  envelope: (c) => P("M14 30 H86 V74 H14 Z", c) + P("M14 30 L50 56 L86 30", "#fff") + `<path d="M14 30 L50 56 L86 30" fill="none" stroke="#fff" stroke-width="3"/>`,
  key: (c) => ann(36, 40, 18, 9, c) + P("M44 48 L74 78 H82 V86 H62 L40 64 Z", c),
  bear: (c) => CR(34, 30, 11, c) + CR(66, 30, 11, c) + CR(50, 54, 30, c) + EL(50, 62, 13, 10, "#fff") + eye(40, 50) + eye(60, 50) + CR(50, 58, 4, "#5b5048"),
  bunny: (c) => EL(40, 22, 7, 20, c) + EL(60, 22, 7, 20, c) + CR(50, 58, 26, c) + EL(50, 66, 11, 8, "#fff") + eye(41, 54) + eye(59, 54) + CR(50, 62, 3.5, C.rose),
  fox: (c) => P("M24 22 L40 40 L30 46 Z", c) + P("M76 22 L60 40 L70 46 Z", c) + CR(50, 52, 28, c) + P("M50 80 L34 60 H66 Z", "#fff") + eye(40, 48) + eye(60, 48) + CR(50, 66, 4, "#5b5048"),
  cat: (c) => P("M28 24 L40 44 L24 44 Z", c) + P("M72 24 L60 44 L76 44 Z", c) + CR(50, 54, 28, c) + eye(40, 52) + eye(60, 52) + P("M47 60 H53 L50 64 Z", C.rose) + line(20, 58, 38, 60) + line(20, 64, 38, 64) + line(80, 58, 62, 60) + line(80, 64, 62, 64),
  duck: (c) => CR(50, 50, 26, c) + P("M70 50 L92 44 L92 58 Z", C.peach) + eye(44, 44),
  whale: (c) => P("M16 52 C24 32 56 32 72 52 C56 70 28 70 16 52 Z", c) + P("M72 52 L90 40 V64 Z", c) + eye(34, 48) + `<path d="M30 30 C30 24 34 24 34 30" stroke="#fff" stroke-width="2.6" fill="none"/>`,
};

// soft drop shadow wrapper
const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<defs><filter id="s" x="-25%" y="-25%" width="150%" height="150%">` +
  `<feDropShadow dx="0" dy="1.6" stdDeviation="1.8" flood-color="#7a6a58" flood-opacity="0.28"/></filter></defs>` +
  `<g filter="url(#s)">${inner}</g></svg>\n`;

// ── per-category assignment (motif, colorKey) ──
const CATS = {
  "scrapbook-essentials": [["camera", "babyblue"], ["bow", "pink"], ["bow", "peach"], ["heart", "rose"], ["gift", "mint"], ["balloon", "lavender"], ["envelope", "cream"], ["flower", "pink"], ["star", "yellow"], ["key", "peach"], ["cake", "pink"], ["leaf", "leaf"]],
  "cute-dreams": [["moon", "lavender"], ["star", "yellow"], ["star", "peach"], ["cloud", "babyblue"], ["cloud", "pink"], ["rainbow", "pink"], ["sun", "yellow"], ["heart", "pink"], ["moon", "babyblue"], ["star", "mint"], ["cloud", "lavender"], ["rainbow", "mint"]],
  "baby-memories": [["bear", "peach"], ["bunny", "pink"], ["duck", "yellow"], ["star", "babyblue"], ["moon", "lavender"], ["cloud", "babyblue"], ["gift", "mint"], ["balloon", "pink"], ["heart", "rose"], ["bow", "babyblue"], ["cat", "cream"], ["bear", "mint"]],
  "floral-garden": [["flower", "pink"], ["flower", "lavender"], ["flower", "peach"], ["daisy", "yellow"], ["daisy", "pink"], ["tulip", "rose"], ["tulip", "peach"], ["rose", "rose"], ["leaf", "leaf"], ["leaf", "sage"], ["bow", "pink"], ["flower", "mint"]],
  "birthday-party": [["cake", "pink"], ["cupcake", "peach"], ["balloon", "pink"], ["balloon", "babyblue"], ["gift", "lavender"], ["partyhat", "mint"], ["star", "yellow"], ["heart", "rose"], ["bow", "peach"], ["cupcake", "lavender"], ["cake", "mint"], ["gift", "pink"]],
  "travel-memories": [["plane", "babyblue"], ["camera", "peach"], ["sun", "yellow"], ["cloud", "babyblue"], ["balloon", "pink"], ["star", "lavender"], ["heart", "rose"], ["leaf", "leaf"], ["gift", "mint"], ["envelope", "cream"], ["plane", "pink"], ["camera", "mint"]],
  "love-wedding": [["heart", "rose"], ["heart", "pink"], ["heart", "peach"], ["ring", "cream"], ["bow", "pink"], ["gift", "lavender"], ["rose", "rose"], ["flower", "pink"], ["envelope", "cream"], ["key", "peach"], ["balloon", "pink"], ["heart", "lavender"]],
  "woodland-friends": [["fox", "peach"], ["bear", "brown"], ["bunny", "cream"], ["cat", "peach"], ["duck", "yellow"], ["leaf", "leaf"], ["leaf", "sage"], ["flower", "pink"], ["star", "yellow"], ["heart", "rose"], ["cloud", "babyblue"], ["bear", "peach"]],
  "cute-animals": [["whale", "babyblue"], ["duck", "yellow"], ["cat", "peach"], ["bunny", "pink"], ["bear", "brown"], ["fox", "peach"], ["whale", "lavender"], ["cat", "cream"], ["bunny", "mint"], ["bear", "mint"], ["duck", "cream"], ["fox", "rose"]],
};

if (existsSync(PUB)) rmSync(PUB, { recursive: true, force: true });
mkdirSync(PUB, { recursive: true });

let total = 0;
for (const [cat, items] of Object.entries(CATS)) {
  const dir = join(PUB, cat);
  mkdirSync(dir, { recursive: true });
  const counts = {};
  for (const [motif, colorKey] of items) {
    counts[motif] = (counts[motif] ?? 0) + 1;
    const name = counts[motif] > 1 ? `${motif}-${counts[motif]}` : motif;
    const svg = wrap(M[motif](C[colorKey]));
    writeFileSync(join(dir, `${name}.svg`), svg, "utf8");
    total++;
  }
}

console.log(`✅ Seeded ${total} premium pastel stickers across ${Object.keys(CATS).length} categories`);
