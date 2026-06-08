"use client";

import { create } from "zustand";
import { BookLayout, BookPage, UploadedPhoto, PlacedPhoto, TextBox, Sticker } from "@/lib/editor/types";
import {
  newPage,
  applyTemplate as applyTemplateToPage,
  fillSlot,
  clearSlot,
  updatePlacement as updatePlacementOnPage,
  removePlacement,
  addPlacement,
  defaultPlacement,
  defaultTextBox,
  addText as addTextToPage,
  updateText as updateTextOnPage,
  removeText as removeTextFromPage,
  setBackground as setBackgroundOnPage,
  setFullBleed as setFullBleedOnPage,
  setCropX as setCropXOnPage,
  setCropY as setCropYOnPage,
  setZoom as setZoomOnPage,
  applyCoverTemplate as applyCoverTemplateToPage,
  defaultSticker,
  addSticker as addStickerToPage,
  updateSticker as updateStickerOnPage,
  removeSticker as removeStickerFromPage,
} from "@/lib/editor/layout";
import { getTemplate } from "@/lib/editor/templates";
import { uid } from "@/lib/uid";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "single";
// "templates" = the unified "Page Designs" panel (templates + layouts merged).
// "layouts" kept in the union only for backward-safety; no rail uses it.
export type Panel = "images" | "templates" | "layouts" | "backgrounds" | "stickers" | "covers";
export type SaveState = "idle" | "saving" | "saved" | "error";

/** A selected element on the canvas */
export interface Selection {
  pageId: string;
  kind: "photo" | "text" | "slot" | "sticker";
  id: string; // placement id, text id, slot id, or sticker id
}

interface EditorState {
  // ── Document ──
  layout: BookLayout;
  photos: UploadedPhoto[];

  // ── Project / persistence ──
  projectId: string | null;
  projectTitle: string;
  saveState: SaveState;

  // ── UI ──
  viewMode: ViewMode;
  activePanel: Panel;
  selection: Selection | null;
  hideUsedPhotos: boolean;
  /** Photo "armed" for tap-to-place (touch-friendly alternative to drag) */
  armedPhotoId: string | null;

  // ── History (operates on `layout` only) ──
  past: BookLayout[];
  future: BookLayout[];

  // ── Derived helpers ──
  currentPageIndex: () => number;
  isPhotoUsed: (photoId: string) => boolean;
  usageCount: (photoId: string) => number;

  // ── History actions ──
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ── UI actions ──
  setViewMode: (v: ViewMode) => void;
  setPanel: (p: Panel) => void;
  setHideUsed: (v: boolean) => void;
  armPhoto: (photoId: string | null) => void;
  select: (sel: Selection | null) => void;
  goToPage: (index: number) => void;
  setProject: (id: string | null, title: string) => void;
  setSaveState: (s: SaveState) => void;
  setTitle: (t: string) => void;

  // ── Photo actions ──
  addPhotos: (photos: UploadedPhoto[]) => void;

  // ── Page mutations (all undoable) ──
  fillSlotAction: (pageId: string, slotId: string, photoId: string) => void;
  clearSlotAction: (pageId: string, slotId: string) => void;
  placePhotoFree: (pageId: string, photoId: string, x: number, y: number) => void;
  updatePlacement: (pageId: string, placement: PlacedPhoto) => void;
  removeSelected: () => void;
  applyTemplate: (pageId: string, templateId: string) => void;
  applyCoverTemplate: (pageId: string, coverTemplateId: string) => void;
  setBackground: (pageId: string, background?: string) => void;
  setBackgroundAll: (background?: string) => void;
  setFullBleed: (pageId: string, fullBleed: boolean) => void;
  setCropX: (pageId: string, cropX: number) => void;
  setCropY: (pageId: string, cropY: number) => void;
  setZoom: (pageId: string, zoom: number) => void;

  // ── Text ──
  addTextBox: (pageId: string) => void;
  updateTextBox: (pageId: string, box: TextBox) => void;

  // ── Stickers ──
  addSticker: (pageId: string, stickerId: string, category: string, src: string, x?: number, y?: number) => void;
  updateSticker: (pageId: string, sticker: Sticker) => void;
  duplicateSticker: (pageId: string, stickerId: string) => void;

  // ── Page management ──
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (from: number, to: number) => void;

  // ── Smart features ──
  smartCreate: (opts?: AutoBookOptions) => void;
  autofill: () => void;

  // ── Bulk load (from saved project) ──
  loadDocument: (layout: BookLayout, photos: UploadedPhoto[]) => void;
}

// ─── Initial document ─────────────────────────────────────────────────────────

function initialLayout(): BookLayout {
  const cover = newPage("full");
  cover.isCover = true;
  return {
    pages: [
      cover,
      newPage("blank"),
      newPage("two-v"),
      newPage("two-v"),
      newPage("four-grid"),
      newPage("four-grid"),
    ],
    currentPageIndex: 0,
  };
}

const HISTORY_LIMIT = 50;

function snapshot(layout: BookLayout): BookLayout {
  return structuredClone(layout);
}

/** Options for the AI auto book creation. */
export interface AutoBookOptions {
  /** Backgrounds (hex colours or image srcs) rotated across content pages. */
  backgrounds?: string[];
  /** Stickers to sprinkle subtly across some pages. */
  stickers?: { stickerId: string; category: string; src: string }[];
}

type Orient = "land" | "port" | "square";
function orientOf(p: UploadedPhoto): Orient {
  const r = p.width / p.height;
  if (r >= 1.2) return "land";
  if (r <= 0.83) return "port";
  return "square";
}

/** Place a small decorative sticker in a rotating corner. */
function cornerSticker(idx: number, s: { stickerId: string; category: string; src: string }) {
  const corners = [
    { x: 0.04, y: 0.04, rot: -8 },
    { x: 0.78, y: 0.04, rot: 8 },
    { x: 0.04, y: 0.82, rot: 6 },
    { x: 0.78, y: 0.82, rot: -6 },
  ];
  const c = corners[idx % corners.length];
  const width = 0.14;
  return {
    id: uid(), stickerId: s.stickerId, category: s.category, src: s.src,
    x: c.x, y: c.y, width, height: width * 0.7071, rotation: c.rot, zIndex: 1,
  };
}

/**
 * Orientation-aware auto layout: walks the photos and emits varied content
 * pages (full-bleed / 2-up / 3-up / collage), preferring layouts that suit
 * each photo's orientation, never repeating the same template back-to-back,
 * and filling every page (no empties). Pure array work → fast for 300+ photos.
 */
function planContentPages(rest: UploadedPhoto[]): BookPage[] {
  const pages: BookPage[] = [];
  const rotation = ["full", "collage", "pair", "trio", "full", "pair"];
  let i = 0, ri = 0, last = "";
  while (i < rest.length) {
    const remaining = rest.length - i;
    const o = orientOf(rest[i]);
    let intent = rotation[ri % rotation.length]; ri++;

    // orientation nudges
    if (o === "square" && remaining >= 4) intent = "collage";
    else if (o === "port" && remaining >= 2 && intent === "full") intent = "pair";
    else if (o === "land" && intent === "trio" && remaining >= 2) intent = "pair";

    let templateId = "full", count = 1, fullBleed = false;
    if (intent === "pair" && remaining >= 2) {
      count = 2;
      const o2 = orientOf(rest[i + 1]);
      templateId = o === "land" && o2 === "land" ? "two-h" : "two-v";
    } else if (intent === "trio" && remaining >= 3) {
      count = 3; templateId = "feature-left";
    } else if (intent === "collage" && remaining >= 4) {
      count = 4; templateId = "four-grid";
    } else {
      count = 1; templateId = "full"; fullBleed = o !== "port"; // wide/square → edge-to-edge
    }

    // avoid the same template twice in a row
    if (templateId === last && remaining > count) {
      if (templateId === "full" && remaining >= 2) { templateId = "two-v"; count = 2; fullBleed = false; }
      else if (remaining >= 4) { templateId = "four-grid"; count = 4; fullBleed = false; }
      else { templateId = "full"; count = 1; }
    }

    count = Math.min(count, remaining);
    const page = newPage(templateId);
    const slots = getTemplate(templateId).slots;
    const used: string[] = [];
    slots.forEach((slot, k) => {
      const ph = rest[i + k];
      if (ph) { page.slotFills[slot.id] = ph.id; used.push(ph.id); }
    });
    page.images = used;
    if (fullBleed) page.fullBleed = true;
    pages.push(page);
    last = templateId;
    i += count;
  }
  return pages;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => {
  /** Apply an undoable mutation to the page list. */
  const commit = (mutator: (pages: BookPage[]) => BookPage[]) => {
    set((s) => {
      const past = [...s.past, snapshot(s.layout)].slice(-HISTORY_LIMIT);
      return {
        past,
        future: [],
        layout: { ...s.layout, pages: mutator(s.layout.pages) },
      };
    });
  };

  const mapPage = (pageId: string, fn: (p: BookPage) => BookPage) => (pages: BookPage[]) =>
    pages.map((p) => (p.id === pageId ? fn(p) : p));

  return {
    layout: initialLayout(),
    photos: [],
    projectId: null,
    projectTitle: "หนังสือของฉัน",
    saveState: "idle",
    viewMode: "grid",
    activePanel: "images",
    selection: null,
    hideUsedPhotos: false,
    armedPhotoId: null,
    past: [],
    future: [],

    // ── Derived ──
    currentPageIndex: () => get().layout.currentPageIndex,
    usageCount: (photoId) => {
      let n = 0;
      for (const page of get().layout.pages) {
        n += Object.values(page.slotFills).filter((id) => id === photoId).length;
        n += page.placements.filter((p) => p.photoId === photoId).length;
      }
      return n;
    },
    isPhotoUsed: (photoId) => get().usageCount(photoId) > 0,

    // ── History ──
    undo: () =>
      set((s) => {
        if (s.past.length === 0) return s;
        const previous = s.past[s.past.length - 1];
        return {
          past: s.past.slice(0, -1),
          future: [snapshot(s.layout), ...s.future].slice(0, HISTORY_LIMIT),
          layout: previous,
          selection: null,
        };
      }),
    redo: () =>
      set((s) => {
        if (s.future.length === 0) return s;
        const next = s.future[0];
        return {
          past: [...s.past, snapshot(s.layout)].slice(-HISTORY_LIMIT),
          future: s.future.slice(1),
          layout: next,
          selection: null,
        };
      }),
    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    // ── UI ──
    setViewMode: (viewMode) => set({ viewMode }),
    setPanel: (activePanel) => set({ activePanel }),
    setHideUsed: (hideUsedPhotos) => set({ hideUsedPhotos }),
    armPhoto: (armedPhotoId) => set({ armedPhotoId }),
    select: (selection) => set({ selection }),
    goToPage: (index) =>
      set((s) => ({
        layout: { ...s.layout, currentPageIndex: Math.max(0, Math.min(s.layout.pages.length - 1, index)) },
      })),
    setProject: (projectId, projectTitle) => set({ projectId, projectTitle }),
    setSaveState: (saveState) => set({ saveState }),
    setTitle: (projectTitle) => set({ projectTitle }),

    // ── Photos ──
    addPhotos: (incoming) => set((s) => ({ photos: [...s.photos, ...incoming] })),

    // ── Page mutations ──
    fillSlotAction: (pageId, slotId, photoId) =>
      commit(mapPage(pageId, (p) => fillSlot(p, slotId, photoId))),
    clearSlotAction: (pageId, slotId) =>
      commit(mapPage(pageId, (p) => clearSlot(p, slotId))),
    placePhotoFree: (pageId, photoId, x, y) =>
      commit(
        mapPage(pageId, (p) =>
          addPlacement(p, { ...defaultPlacement(photoId), x: Math.max(0, x - 0.2), y: Math.max(0, y - 0.2) })
        )
      ),
    updatePlacement: (pageId, placement) =>
      commit(mapPage(pageId, (p) => updatePlacementOnPage(p, placement))),
    removeSelected: () => {
      const sel = get().selection;
      if (!sel) return;
      commit(
        mapPage(sel.pageId, (p) => {
          if (sel.kind === "photo") return removePlacement(p, sel.id);
          if (sel.kind === "text") return removeTextFromPage(p, sel.id);
          if (sel.kind === "slot") return clearSlot(p, sel.id);
          if (sel.kind === "sticker") return removeStickerFromPage(p, sel.id);
          return p;
        })
      );
      set({ selection: null });
    },
    applyTemplate: (pageId, templateId) =>
      commit(mapPage(pageId, (p) => applyTemplateToPage(p, templateId))),
    applyCoverTemplate: (pageId, coverTemplateId) =>
      commit(mapPage(pageId, (p) => applyCoverTemplateToPage(p, coverTemplateId))),
    setBackground: (pageId, background) =>
      commit(mapPage(pageId, (p) => setBackgroundOnPage(p, background))),
    setBackgroundAll: (background) =>
      commit((pages) => pages.map((p) => setBackgroundOnPage(p, background))),
    setFullBleed: (pageId, fullBleed) =>
      commit(mapPage(pageId, (p) => setFullBleedOnPage(p, fullBleed))),
    setCropX: (pageId, cropX) =>
      commit(mapPage(pageId, (p) => setCropXOnPage(p, cropX))),
    setCropY: (pageId, cropY) =>
      commit(mapPage(pageId, (p) => setCropYOnPage(p, cropY))),
    setZoom: (pageId, zoom) =>
      commit(mapPage(pageId, (p) => setZoomOnPage(p, zoom))),

    // ── Text ──
    addTextBox: (pageId) => commit(mapPage(pageId, (p) => addTextToPage(p, defaultTextBox()))),
    updateTextBox: (pageId, box) => commit(mapPage(pageId, (p) => updateTextOnPage(p, box))),

    // ── Stickers ──
    addSticker: (pageId, stickerId, category, src, x, y) => {
      // zIndex = one above the current max on this page
      const page = get().layout.pages.find((p) => p.id === pageId);
      const maxZ = Math.max(0, ...(page?.stickers ?? []).map((s) => s.zIndex));
      const sticker = defaultSticker(stickerId, category, src, x, y, maxZ + 1);
      commit(mapPage(pageId, (p) => addStickerToPage(p, sticker)));
      set({ selection: { pageId, kind: "sticker", id: sticker.id } });
    },
    updateSticker: (pageId, sticker) =>
      commit(mapPage(pageId, (p) => updateStickerOnPage(p, sticker))),
    duplicateSticker: (pageId, stickerId) => {
      const page = get().layout.pages.find((p) => p.id === pageId);
      const orig = page?.stickers?.find((s) => s.id === stickerId);
      if (!orig) return;
      const maxZ = Math.max(0, ...(page?.stickers ?? []).map((s) => s.zIndex));
      const copy: Sticker = {
        ...orig,
        id: uid(),
        x: Math.min(orig.x + 0.04, 1 - orig.width),
        y: Math.min(orig.y + 0.04, 1 - orig.height),
        zIndex: maxZ + 1,
      };
      commit(mapPage(pageId, (p) => addStickerToPage(p, copy)));
      set({ selection: { pageId, kind: "sticker", id: copy.id } });
    },

    // ── Page management ──
    addPage: () =>
      commit((pages) => [...pages, newPage("full")]),
    duplicatePage: (pageId) =>
      commit((pages) => {
        const i = pages.findIndex((p) => p.id === pageId);
        if (i < 0) return pages;
        const copy: BookPage = {
          ...structuredClone(pages[i]),
          id: uid(),
          isCover: false,
        };
        return [...pages.slice(0, i + 1), copy, ...pages.slice(i + 1)];
      }),
    deletePage: (pageId) =>
      commit((pages) => (pages.length <= 2 ? pages : pages.filter((p) => p.id !== pageId))),
    reorderPages: (from, to) =>
      commit((pages) => {
        const next = [...pages];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),

    // ── AI auto book creation ──
    smartCreate: (opts = {}) => {
      const { photos } = get();
      if (photos.length === 0) return;
      commit(() => {
        // Cover — strongest photo (largest pixel area), full bleed + title
        const strongest = photos.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a), photos[0]);
        const cover = newPage("full");
        cover.isCover = true;
        cover.fullBleed = true;
        cover.slotFills = { s0: strongest.id };
        cover.images = [strongest.id];
        cover.texts = [{
          id: uid(), text: "My Photo Book",
          x: 0.1, y: 0.66, width: 0.8, fontSize: 0.075,
          align: "center", weight: "bold", color: "#ffffff", role: "title",
        }];

        // Content pages from the remaining photos (orientation-aware, varied)
        const rest = photos.filter((p) => p.id !== strongest.id);
        const content = planContentPages(rest);

        // Optional auto backgrounds (skip full-bleed pages where the photo fills)
        if (opts.backgrounds?.length) {
          content.forEach((pg, idx) => {
            if (!pg.fullBleed) pg.background = opts.backgrounds![idx % opts.backgrounds!.length];
          });
        }

        // Optional subtle auto stickers (~every 3rd page)
        if (opts.stickers?.length) {
          content.forEach((pg, idx) => {
            if (idx % 3 === 2) pg.stickers = [cornerSticker(idx, opts.stickers![idx % opts.stickers!.length])];
          });
        }

        return [cover, ...content];
      });
    },
    autofill: () => {
      const { photos } = get();
      if (photos.length === 0) return;
      commit((pages) => {
        const used = new Set<string>();
        for (const p of pages) {
          Object.values(p.slotFills).forEach((id) => used.add(id));
          p.placements.forEach((pl) => used.add(pl.photoId));
        }
        const queue = photos.filter((ph) => !used.has(ph.id)).map((ph) => ph.id);
        let qi = 0;
        return pages.map((page) => {
          if (page.templateId === "blank") return page;
          const slots = getTemplate(page.templateId).slots;
          const slotFills = { ...page.slotFills };
          for (const slot of slots) {
            if (!slotFills[slot.id] && qi < queue.length) {
              slotFills[slot.id] = queue[qi++];
            }
          }
          return { ...page, slotFills };
        });
      });
    },

    // ── Load ──
    loadDocument: (layout, photos) =>
      set({ layout, photos, past: [], future: [], selection: null }),
  };
});
