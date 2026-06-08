// ─── Sample background seeder ──────────────────────────────────────────────
// Run once:  node scripts/seed-backgrounds.mjs
// Writes placeholder SVG backgrounds. The app auto-discovers them — it never
// reads this file. Drop real .png/.jpg/.webp into the folders later, no code
// change. (Solid Colors are handled in the UI as swatches, not files.)

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "backgrounds");

const W = 420, H = 594; // A4 portrait ratio

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>\n`;
}

// gradient watercolor wash
function watercolor(c1, c2, c3, i) {
  return svg(
    `<defs><radialGradient id="g${i}" cx="35%" cy="30%" r="90%">` +
    `<stop offset="0%" stop-color="${c1}"/><stop offset="55%" stop-color="${c2}"/><stop offset="100%" stop-color="${c3}"/>` +
    `</radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g${i})"/>` +
    `<circle cx="${W * 0.7}" cy="${H * 0.25}" r="120" fill="${c1}" opacity="0.25"/>` +
    `<circle cx="${W * 0.25}" cy="${H * 0.75}" r="150" fill="${c3}" opacity="0.2"/>`
  );
}

// soft sky with clouds
function clouds(sky, i) {
  const cloud = (cx, cy, s) =>
    `<g transform="translate(${cx} ${cy}) scale(${s})" fill="#ffffff" opacity="0.9">` +
    `<ellipse cx="0" cy="0" rx="60" ry="34"/><ellipse cx="42" cy="6" rx="40" ry="26"/><ellipse cx="-42" cy="8" rx="40" ry="24"/></g>`;
  return svg(
    `<rect width="${W}" height="${H}" fill="${sky}"/>` +
    cloud(W * 0.32, H * 0.22, 1) + cloud(W * 0.72, H * 0.45, 0.8) + cloud(W * 0.28, H * 0.7, 1.1) + cloud(W * 0.66, H * 0.85, 0.7)
  );
}

// scrapbook dotted / striped paper
function scrapbook(base, dot, i) {
  const pattern =
    i % 2 === 0
      ? `<pattern id="p${i}" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="6" fill="${dot}" opacity="0.5"/></pattern>`
      : `<pattern id="p${i}" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="24" height="48" fill="${dot}" opacity="0.35"/></pattern>`;
  return svg(`<defs>${pattern}</defs><rect width="${W}" height="${H}" fill="${base}"/><rect width="${W}" height="${H}" fill="url(#p${i})"/>`);
}

const PALETTES = [
  ["#ffe3ec", "#ffc2d4", "#ff9ebb"], ["#e0f7fa", "#b2ebf2", "#80deea"],
  ["#fff3e0", "#ffe0b2", "#ffcc80"], ["#f3e5f5", "#e1bee7", "#ce93d8"],
  ["#e8f5e9", "#c8e6c9", "#a5d6a7"], ["#fffde7", "#fff9c4", "#fff59d"],
  ["#e3f2fd", "#bbdefb", "#90caf9"], ["#fce4ec", "#f8bbd0", "#f48fb1"],
  ["#ede7f6", "#d1c4e9", "#b39ddb"], ["#e0f2f1", "#b2dfdb", "#80cbc4"],
];
const SKIES = ["#cfeffd", "#d8ecff", "#e6f0ff", "#cdebff", "#dbeafe", "#c7e9ff", "#e0f7ff", "#d6ecfb", "#cfe8ff", "#e3f2fd"];
const SCRAP = [
  ["#fff5f7", "#ff9ebb"], ["#f0f9ff", "#7cc6ff"], ["#fffaf0", "#ffcf87"], ["#f6f0ff", "#c0a3ff"], ["#f0fff4", "#86e0a3"],
  ["#fff0f6", "#ff85c0"], ["#eefcff", "#66d9e8"], ["#fffbea", "#ffd43b"], ["#f3f0ff", "#9775fa"], ["#ebfbee", "#69db7c"],
];

mkdirSync(join(DIR, "watercolor"), { recursive: true });
mkdirSync(join(DIR, "clouds"), { recursive: true });
mkdirSync(join(DIR, "scrapbook-paper"), { recursive: true });

let n = 0;
for (let i = 0; i < 10; i++) {
  const nn = String(i + 1).padStart(2, "0");
  writeFileSync(join(DIR, "watercolor", `watercolor-${nn}.svg`), watercolor(...PALETTES[i], i), "utf8");
  writeFileSync(join(DIR, "clouds", `cloud-${nn}.svg`), clouds(SKIES[i], i), "utf8");
  writeFileSync(join(DIR, "scrapbook-paper", `paper-${nn}.svg`), scrapbook(SCRAP[i][0], SCRAP[i][1], i), "utf8");
  n += 3;
}

console.log(`✅ Seeded ${n} placeholder backgrounds (watercolor, clouds, scrapbook-paper)`);
