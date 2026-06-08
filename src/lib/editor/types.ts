// ─── Editor Layout Types ───────────────────────────────────────────────────
// This is the single source of truth for the layout data model.
// The editor preview AND the print PDF export must both derive from these types.

/** A photo that has been uploaded by the user */
export interface UploadedPhoto {
  id: string;
  /** Object URL for display in the editor (web preview) */
  previewUrl: string;
  /** Original File object — kept for print export */
  file: File;
  width: number;   // natural px
  height: number;  // natural px
}

/** A photo placed on a book page.
 *  x, y, width, height are all expressed as fractions of the page's
 *  printable area (0–1), so the same numbers work at any canvas zoom level
 *  and in the PDF export.
 */
export interface PlacedPhoto {
  id: string;           // unique placement id
  photoId: string;      // references UploadedPhoto.id
  x: number;            // 0–1 fraction of page width
  y: number;            // 0–1 fraction of page height
  width: number;        // 0–1 fraction of page width
  height: number;       // 0–1 fraction of page height
}

/** A text caption placed on a page. Coordinates are 0–1 fractions,
 *  matching the photo placement coordinate system. */
export interface TextBox {
  id: string;
  text: string;
  x: number;            // 0–1 fraction of page width
  y: number;            // 0–1 fraction of page height
  width: number;        // 0–1 fraction of page width
  fontSize: number;     // fraction of page height (e.g. 0.05)
  align: "left" | "center" | "right";
  weight: "normal" | "bold";
  color: string;        // hex
  /** Cover role — lets cover templates reposition/restyle it while keeping text */
  role?: "title" | "subtitle" | "date" | "author";
}

/** A decorative sticker placed on a page.
 *  Geometry uses the same 0–1 fraction system as photos and text, so the
 *  editor preview and the print PDF stay in sync. */
export interface Sticker {
  id: string;          // unique placement id
  stickerId: string;   // stable library id "category/name" (auto-discovered)
  category: string;    // sticker category folder, e.g. "travel-journal"
  src: string;         // public path to the asset, e.g. "/stickers/travel-journal/airplane.svg"
  x: number;           // 0–1 fraction of page width (top-left)
  y: number;           // 0–1 fraction of page height (top-left)
  width: number;       // 0–1 fraction of page width
  height: number;      // 0–1 fraction of page height
  rotation: number;    // degrees, clockwise
  zIndex: number;      // stacking order among stickers on the page
}

/** One page of the photobook */
export interface BookPage {
  id: string;
  /** Which template is applied to this page (default: "blank") */
  templateId: string;
  /**
   * All photos ever added to this page.
   * NEVER deleted when template changes.
   * This is the source of truth for photos.
   */
  images: string[];  // Array of photoIds
  /**
   * Template mode: maps slotId → photoId.
   * Used when templateId !== "blank".
   * References photoIds from the images array.
   */
  slotFills: Record<string, string>;
  /**
   * Free-form mode: arbitrary placements.
   * Used when templateId === "blank".
   */
  placements: PlacedPhoto[];
  /** Optional text captions (additive — older pages may omit this) */
  texts?: TextBox[];
  /** Optional solid/preset background id or hex (additive) */
  background?: string;
  /** Marks the front-cover page so the cover editor can treat it specially */
  isCover?: boolean;
  /** Which cover design is applied (for picker highlight; additive) */
  coverTemplateId?: string;
  /** Full bleed mode: remove all margins/borders so images go edge-to-edge */
  fullBleed?: boolean;
  /** Horizontal crop offset (-100 to +100, center = 0) when fullBleed is ON */
  cropX?: number;
  /** Vertical crop offset (-100 to +100, center = 0) when fullBleed is ON */
  cropY?: number;
  /** Zoom level (100 to 300) when fullBleed is ON */
  zoom?: number;
  /** Decorative stickers on this page (additive — independent of template/slots) */
  stickers?: Sticker[];
}

/** Print product configuration chosen before checkout (saved with the book). */
export interface ProductConfig {
  size: string;     // SIZES id
  cover: string;    // COVERS id
  paper: string;    // PAPERS id
  quantity: number;
}

/** The full editor state — this is what gets saved to / loaded from the DB */
export interface BookLayout {
  pages: BookPage[];
  currentPageIndex: number;
  /** Print product configuration (additive — older projects may omit) */
  productConfig?: ProductConfig;
}

export type ResizeHandle = "se" | "sw" | "ne" | "nw";
