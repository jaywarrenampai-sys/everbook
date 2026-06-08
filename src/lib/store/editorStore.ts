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
  defaultSticker,
  addSticker as addStickerToPage,
  updateSticker as updateStickerOnPage,
  removeSticker as removeStickerFromPage,
} from "@/lib/editor/layout";
import { getTemplate } from "@/lib/editor/templates";
import { uid } from "@/lib/uid";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "single";
export type Panel = "images" | "templates" | "layouts" | "backgrounds" | "stickers";
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
  setBackground: (pageId: string, background?: string) => void;
  setFullBleed: (pageId: string, fullBleed: boolean) => void;
  setCropX: (pageId: string, cropX: number) => void;
  setCropY: (pageId: string, cropY: number) => void;
  setZoom: (pageId: string, zoom: number) => void;

  // ── Text ──
  addTextBox: (pageId: string) => void;
  updateTextBox: (pageId: string, box: TextBox) => void;

  // ── Stickers ──
  addSticker: (pageId: string, stickerId: string, src: string, x?: number, y?: number) => void;
  updateSticker: (pageId: string, sticker: Sticker) => void;
  duplicateSticker: (pageId: string, stickerId: string) => void;

  // ── Page management ──
  addPage: () => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (from: number, to: number) => void;

  // ── Smart features ──
  smartCreate: () => void;
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
    setBackground: (pageId, background) =>
      commit(mapPage(pageId, (p) => setBackgroundOnPage(p, background))),
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
    addSticker: (pageId, stickerId, src, x, y) => {
      // zIndex = one above the current max on this page
      const page = get().layout.pages.find((p) => p.id === pageId);
      const maxZ = Math.max(0, ...(page?.stickers ?? []).map((s) => s.zIndex));
      const sticker = defaultSticker(stickerId, src, x, y, maxZ + 1);
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

    // ── Smart features ──
    smartCreate: () => {
      const { photos } = get();
      if (photos.length === 0) return;
      commit(() => {
        const pages: BookPage[] = [];
        // Cover with the first photo
        const cover = newPage("full");
        cover.isCover = true;
        cover.slotFills = { s0: photos[0].id };
        pages.push(cover);

        // Inside cover blank
        pages.push(newPage("blank"));

        // Distribute the rest across content pages
        let i = 1;
        while (i < photos.length) {
          const remaining = photos.length - i;
          const take = remaining >= 4 ? 4 : remaining;
          const tmplId = take === 1 ? "full" : take === 2 ? "two-v" : take === 3 ? "feature-left" : "four-grid";
          const page = newPage(tmplId);
          const slots = getTemplate(tmplId).slots;
          slots.forEach((slot, k) => {
            if (photos[i + k]) page.slotFills[slot.id] = photos[i + k].id;
          });
          pages.push(page);
          i += take;
        }
        // Ensure even page count for spreads
        if (pages.length % 2 !== 0) pages.push(newPage("blank"));
        return pages;
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
