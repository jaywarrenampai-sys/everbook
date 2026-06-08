// ─── Product options & live pricing ─────────────────────────────────────────
// ⚠️ PLACEHOLDER PRICES (THB) — confirm with the printer before launch.
// All money is Thai Baht. Unit price = size base + cover + (pages × paper/page),
// then × quantity.

import { ProductConfig } from "@/lib/editor/types";

export interface SizeOption { id: string; label: string; sub: string; base: number }
export interface CoverOption { id: string; label: string; sub: string; price: number }
export interface PaperOption { id: string; label: string; sub: string; perPage: number }

export const SIZES: SizeOption[] = [
  { id: "a4-portrait", label: "A4 แนวตั้ง", sub: "210 × 297 มม.", base: 350 },
  { id: "a4-landscape", label: "A4 แนวนอน", sub: "297 × 210 มม.", base: 350 },
  { id: "square-8", label: "สี่เหลี่ยม 8×8", sub: "20 × 20 ซม.", base: 420 },
  { id: "square-12", label: "สี่เหลี่ยม 12×12", sub: "30 × 30 ซม.", base: 650 },
];

export const COVERS: CoverOption[] = [
  { id: "soft", label: "ปกอ่อน", sub: "Soft Cover", price: 150 },
  { id: "hard", label: "ปกแข็ง", sub: "Hard Cover", price: 350 },
  { id: "premium-hard", label: "ปกแข็งพรีเมียม", sub: "Premium Hard Cover", price: 600 },
];

export const PAPERS: PaperOption[] = [
  { id: "standard", label: "มาตรฐาน", sub: "Standard", perPage: 12 },
  { id: "premium-matte", label: "พรีเมียมด้าน", sub: "Premium Matte", perPage: 18 },
  { id: "premium-gloss", label: "พรีเมียมเงา", sub: "Premium Gloss", perPage: 20 },
];

export const QUANTITIES = [1, 2, 3, 5, 10];

export interface ShippingOption { id: string; label: string; sub: string; price: number }
export const SHIPPING: ShippingOption[] = [
  { id: "standard", label: "จัดส่งมาตรฐาน", sub: "3-5 วันทำการ", price: 60 },
  { id: "express", label: "จัดส่งด่วน", sub: "1-2 วันทำการ", price: 150 },
];
export function shippingPrice(id: string): number {
  return SHIPPING.find((s) => s.id === id)?.price ?? 0;
}

export const DEFAULT_CONFIG: ProductConfig = {
  size: "a4-portrait",
  cover: "hard",
  paper: "premium-matte",
  quantity: 1,
};

/** Normalise a possibly-partial / legacy config to a valid one. */
export function normalizeConfig(c?: Partial<ProductConfig>): ProductConfig {
  return {
    size: SIZES.some((s) => s.id === c?.size) ? c!.size! : DEFAULT_CONFIG.size,
    cover: COVERS.some((s) => s.id === c?.cover) ? c!.cover! : DEFAULT_CONFIG.cover,
    paper: PAPERS.some((s) => s.id === c?.paper) ? c!.paper! : DEFAULT_CONFIG.paper,
    quantity: QUANTITIES.includes(c?.quantity ?? 0) ? c!.quantity! : DEFAULT_CONFIG.quantity,
  };
}

export interface PriceBreakdown {
  sizeBase: number;
  coverPrice: number;
  paperTotal: number; // pages × perPage
  perPage: number;
  unit: number;       // price for one book
  total: number;      // unit × quantity
}

export function priceBreakdown(config: ProductConfig, pageCount: number): PriceBreakdown {
  const size = SIZES.find((s) => s.id === config.size) ?? SIZES[0];
  const cover = COVERS.find((s) => s.id === config.cover) ?? COVERS[0];
  const paper = PAPERS.find((s) => s.id === config.paper) ?? PAPERS[0];
  const pages = Math.max(0, pageCount);
  const paperTotal = pages * paper.perPage;
  const unit = size.base + cover.price + paperTotal;
  return {
    sizeBase: size.base,
    coverPrice: cover.price,
    paperTotal,
    perPage: paper.perPage,
    unit,
    total: unit * config.quantity,
  };
}

export function formatTHB(n: number): string {
  return `฿${n.toLocaleString("th-TH")}`;
}
