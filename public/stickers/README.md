# Sticker Style Collections

Each folder is an ART STYLE. Drop PNG or WEBP files into a folder and they
appear automatically in the editor (auto-discovery, lazy-loaded) — no code change.
A style tab only shows once its folder contains at least one image.

Folders: pastel-watercolor, kawaii-japanese, hand-doodle, vintage-scrapbook,
korean-aesthetic, flat-vivid-pop, magical-fantasy, embroidery-felt, crayon-kids,
puffy-bubble (+ future styles listed in src/lib/stickers/categories.ts).

## Adding a pack
1. Put transparent PNG/WEBP files in the matching style folder.
2. Name them by content, e.g. heart-01.png, camera-01.png.
3. Redeploy (static assets ship with the build). Done.

## Extracting from a sticker SHEET
Use scripts/extract-stickers.mjs (sharp-based cut-out):
  node scripts/extract-stickers.mjs detect <sheet.png>
  node scripts/extract-stickers.mjs write  <sheet.png> <manifest.json>
Works cleanly on sheets with a solid (black) or truly transparent background.
