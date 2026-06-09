// Extract individual stickers from a sheet image into trimmed transparent PNGs.
// Uses sharp + a connected-component labeler. No redraw — pure pixel cutout.
//
// Usage:
//   node scripts/extract-stickers.mjs detect <sheet.png>
//   node scripts/extract-stickers.mjs write  <sheet.png> <manifest.json>
//
// manifest.json: [{ "category": "...", "name": "..." }, ...] in READING ORDER
// (top→bottom, left→right). Components beyond the manifest length are skipped.

import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PUB = join(ROOT, "public", "stickers");

const [, , mode, sheetPath, manifestPath] = process.argv;

async function load(path) {
  const img = sharp(path).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, ch: info.channels };
}

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Build a foreground mask (1 = sticker, 0 = background). */
function foregroundMask(data, W, H, ch) {
  const N = W * H;
  // sample corners to decide dark vs light background
  const corner = (x, y) => { const i = (y * W + x) * ch; return lum(data[i], data[i + 1], data[i + 2]); };
  const cAvg = (corner(2, 2) + corner(W - 3, 2) + corner(2, H - 3) + corner(W - 3, H - 3)) / 4;
  const dark = cAvg < 70;

  const fg = new Uint8Array(N);
  if (dark) {
    for (let p = 0; p < N; p++) {
      const i = p * ch;
      fg[p] = lum(data[i], data[i + 1], data[i + 2]) > 55 ? 1 : 0;
    }
    return { fg, dark };
  }
  // light/checker background: flood-fill "light" pixels from the border = background
  const isLight = (p) => { const i = p * ch; return lum(data[i], data[i + 1], data[i + 2]) > 200; };
  const bg = new Uint8Array(N);
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
  for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !isLight(p)) continue;
    bg[p] = 1;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  for (let p = 0; p < N; p++) fg[p] = bg[p] ? 0 : 1;
  return { fg, dark };
}

/** 4-connected components → list of {pixels:Set-like via bbox, x0,y0,x1,y1,area}. */
function components(fg, W, H, minArea) {
  const N = W * H;
  const label = new Int32Array(N).fill(-1);
  const comps = [];
  const stack = [];
  for (let s = 0; s < N; s++) {
    if (fg[s] === 0 || label[s] !== -1) continue;
    const id = comps.length;
    let x0 = W, y0 = H, x1 = 0, y1 = 0, area = 0;
    stack.push(s);
    label[s] = id;
    while (stack.length) {
      const p = stack.pop();
      const x = p % W, y = (p / W) | 0;
      area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0 && fg[p - 1] && label[p - 1] === -1) { label[p - 1] = id; stack.push(p - 1); }
      if (x < W - 1 && fg[p + 1] && label[p + 1] === -1) { label[p + 1] = id; stack.push(p + 1); }
      if (y > 0 && fg[p - W] && label[p - W] === -1) { label[p - W] = id; stack.push(p - W); }
      if (y < H - 1 && fg[p + W] && label[p + W] === -1) { label[p + W] = id; stack.push(p + W); }
    }
    comps.push({ id, x0, y0, x1, y1, area });
  }
  return { comps: comps.filter((c) => c.area >= minArea && (c.x1 - c.x0) > 18 && (c.y1 - c.y0) > 18), label };
}

/** Reading order: band into rows by vertical overlap, then sort by x. */
function readingOrder(comps) {
  const sorted = [...comps].sort((a, b) => a.y0 - b.y0);
  const rows = [];
  for (const c of sorted) {
    const cy = (c.y0 + c.y1) / 2;
    let row = rows.find((r) => cy >= r.top && cy <= r.bot);
    if (!row) { row = { top: c.y0, bot: c.y1, items: [] }; rows.push(row); }
    row.top = Math.min(row.top, c.y0); row.bot = Math.max(row.bot, c.y1);
    row.items.push(c);
  }
  rows.sort((a, b) => a.top - b.top);
  return rows.flatMap((r) => r.items.sort((a, b) => a.x0 - b.x0));
}

async function main() {
  const { data, W, H, ch } = await load(sheetPath);
  const minArea = Math.round(W * H * 0.0006);
  const { fg, dark } = foregroundMask(data, W, H, ch);
  const { comps, label } = components(fg, W, H, minArea);
  const ordered = readingOrder(comps);

  console.log(`Sheet ${W}x${H} · background=${dark ? "dark" : "light/checker"} · minArea=${minArea}`);
  console.log(`Detected ${ordered.length} stickers (reading order):`);
  ordered.forEach((c, i) => {
    console.log(`  #${i} bbox=[${c.x0},${c.y0} ${c.x1 - c.x0}x${c.y1 - c.y0}] area=${c.area}`);
  });

  if (mode !== "write") return;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const counts = {};
  let written = 0;
  for (let i = 0; i < ordered.length && i < manifest.length; i++) {
    const m = manifest[i];
    if (!m || !m.category || !m.name) continue;
    const c = ordered[i];
    const pad = 6;
    const bx0 = Math.max(0, c.x0 - pad), by0 = Math.max(0, c.y0 - pad);
    const bx1 = Math.min(W - 1, c.x1 + pad), by1 = Math.min(H - 1, c.y1 + pad);
    const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
    const out = Buffer.alloc(bw * bh * 4);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const sp = (by0 + y) * W + (bx0 + x);
        const di = (y * bw + x) * 4;
        if (label[sp] === c.id) {
          const si = sp * ch;
          out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2]; out[di + 3] = 255;
        } else {
          out[di + 3] = 0;
        }
      }
    }
    const dir = join(PUB, m.category);
    mkdirSync(dir, { recursive: true });
    counts[m.name] = (counts[m.name] ?? 0) + 1;
    const fname = counts[m.name] > 1 ? `${m.name}-${String(counts[m.name]).padStart(2, "0")}` : `${m.name}-01`;
    await sharp(out, { raw: { width: bw, height: bh, channels: 4 } }).png().toFile(join(dir, `${fname}.png`));
    written++;
  }
  console.log(`✅ Wrote ${written} PNG stickers.`);
}

main();
