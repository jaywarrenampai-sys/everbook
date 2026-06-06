@AGENTS.md

# Project: Everbook — Custom Photobook E-Commerce (Thailand)

## What we're building
A custom photobook web app for the Thai market. Customers upload their photos,
arrange them in an online editor, preview the book, and order a printed
hardcover copy.

It's two products in one codebase:
1. **Storefront** — marketing, pricing, "how it works", ordering.
2. **Photobook editor** — the core web app: upload photos, lay them out on
   pages, preview, and export a print-ready PDF. This is the moat.

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Hosting: Vercel
- Database: Supabase (Postgres) — orders + saved editor projects
- File storage: Supabase Storage or Vercel Blob — uploaded photos
- Payments: Thai gateway (Omise or 2C2P) — must support PromptPay + cards
- PDF export: server-side, high-resolution, print-ready

## Market rules (ALWAYS apply)
- Language: Thai-first UI. English secondary/optional.
- Currency: Thai Baht, formatted like ฿199.
- Payment: PromptPay support is required, not optional.
- Tone: warm, keepsake / "memories that last" feel.

## Print spec — FILL THIS IN once the printer is chosen (critical)
- Page size (mm):            e.g. 297 x 210 (A4 landscape)
- Bleed (mm, each edge):     e.g. 3
- Safe margin (mm):          e.g. 5
- Resolution:                300 DPI minimum
- Color profile:             CMYK / printer's ICC profile
- Cover spec:                wraparound; spine width varies by page count
- Page count:                min / max (usually in multiples of 4)
- Accepted file format:      e.g. PDF/X-1a

## Architecture notes
- Editor state stored as JSON (pages, photo placements, crops, text).
- Keep ORIGINAL photos for print; generate smaller web previews for editor.
- PDF export runs server-side from saved JSON + original photos.
- Editor preview and print PDF MUST use the same layout math (/lib/editor).

## Build phases  (CURRENT: Phase 1 — Storefront)
1. Storefront skeleton                          <- current
2. Editor MVP — upload, template, drag, reorder, preview
3. Print-ready PDF export
4. Cart + checkout + Thai payment
5. Order capture + simple admin view
6. Polish + launch

## Conventions
- TypeScript strict mode. Avoid `any` unless justified in a comment.
- Routes in /app, shared UI in /components, editor logic in /lib/editor.
- All Thai copy and prices in /lib/content — never scattered in components.
- Commit after each working feature with a clear message.

## Commands
- Dev:    npm run dev
- Build:  npm run build
- Deploy: push to main (Vercel auto-deploys)

## Don't
- Don't hardcode USD or build English-only screens.
- Don't build checkout before the editor + PDF export work.
- Don't let editor preview and print output drift apart.
- Don't guess the print spec — confirm with the printer first.
