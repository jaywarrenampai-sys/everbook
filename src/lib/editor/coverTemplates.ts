// ─── Cover Template Library ──────────────────────────────────────────────────
// Curated front-cover designs. Each reuses an existing photo-frame template id
// (so photo remapping is automatic) plus a text layout (title / subtitle / date
// / author) and an optional themed background. Applying a cover design never
// deletes content — see applyCoverTemplate() in layout.ts.

export type CoverRole = "title" | "subtitle" | "date" | "author";

export interface CoverText {
  role: CoverRole;
  x: number;
  y: number;
  width: number;
  fontSize: number; // fraction of page height
  align: "left" | "center" | "right";
  weight: "normal" | "bold";
  color: string;
  placeholder: string;
}

export interface CoverTemplate {
  id: string;
  category: string;
  label: string;
  templateId: string; // existing photo-frame template
  background?: string; // hex or image path — applied only if page has none
  texts: CoverText[];
}

export interface CoverCategory {
  id: string;
  label: string;
  emoji: string;
}

export const COVER_CATEGORIES: CoverCategory[] = [
  { id: "family", label: "Family", emoji: "🏠" },
  { id: "baby", label: "Baby", emoji: "👶" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "minimal", label: "Minimal", emoji: "◻️" },
  { id: "luxury", label: "Luxury", emoji: "✨" },
  { id: "modern", label: "Modern", emoji: "🟦" },
  { id: "scrapbook", label: "Scrapbook", emoji: "📷" },
  { id: "seasonal", label: "Seasonal", emoji: "🍃" },
];

// ── Text-layout presets ──
function bottomBlock(color: string): CoverText[] {
  return [
    { role: "title", x: 0.1, y: 0.64, width: 0.8, fontSize: 0.072, align: "center", weight: "bold", color, placeholder: "ชื่อหนังสือ" },
    { role: "subtitle", x: 0.15, y: 0.755, width: 0.7, fontSize: 0.034, align: "center", weight: "normal", color, placeholder: "คำโปรยสั้นๆ" },
    { role: "date", x: 0.2, y: 0.83, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "2024" },
    { role: "author", x: 0.2, y: 0.885, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "โดย ครอบครัวของเรา" },
  ];
}
function topBlock(color: string): CoverText[] {
  return [
    { role: "title", x: 0.1, y: 0.07, width: 0.8, fontSize: 0.07, align: "center", weight: "bold", color, placeholder: "ชื่อหนังสือ" },
    { role: "subtitle", x: 0.15, y: 0.18, width: 0.7, fontSize: 0.032, align: "center", weight: "normal", color, placeholder: "คำโปรยสั้นๆ" },
    { role: "date", x: 0.2, y: 0.88, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "2024" },
    { role: "author", x: 0.2, y: 0.93, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "โดย ..." },
  ];
}
function centerBlock(color: string): CoverText[] {
  return [
    { role: "title", x: 0.1, y: 0.4, width: 0.8, fontSize: 0.085, align: "center", weight: "bold", color, placeholder: "ชื่อหนังสือ" },
    { role: "subtitle", x: 0.15, y: 0.53, width: 0.7, fontSize: 0.034, align: "center", weight: "normal", color, placeholder: "คำโปรยสั้นๆ" },
    { role: "date", x: 0.2, y: 0.86, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "2024" },
    { role: "author", x: 0.2, y: 0.91, width: 0.6, fontSize: 0.026, align: "center", weight: "normal", color, placeholder: "โดย ..." },
  ];
}

const WHITE = "#ffffff";
const DARK = "#2E2620";

export const COVER_TEMPLATES: CoverTemplate[] = [
  // Family
  { id: "family-photo", category: "family", label: "ภาพเต็ม", templateId: "full", texts: bottomBlock(WHITE) },
  { id: "family-warm", category: "family", label: "โทนอุ่น", templateId: "full", background: "#F7F3EC", texts: topBlock(DARK) },
  // Baby
  { id: "baby-soft", category: "baby", label: "พาสเทล", templateId: "full", background: "#fce4ec", texts: bottomBlock(WHITE) },
  { id: "baby-center", category: "baby", label: "ตรงกลาง", templateId: "blank", background: "#e3f2fd", texts: centerBlock(DARK) },
  // Travel
  { id: "travel-full", category: "travel", label: "วิวเต็มจอ", templateId: "full", texts: bottomBlock(WHITE) },
  { id: "travel-top", category: "travel", label: "หัวเรื่องบน", templateId: "full", texts: topBlock(WHITE) },
  // Wedding
  { id: "wedding-cream", category: "wedding", label: "ครีมหรู", templateId: "full", background: "#fbf6ef", texts: bottomBlock(WHITE) },
  { id: "wedding-center", category: "wedding", label: "คลาสสิก", templateId: "blank", background: "#f3ece1", texts: centerBlock(DARK) },
  // Birthday
  { id: "birthday-fun", category: "birthday", label: "สนุกสนาน", templateId: "full", texts: bottomBlock(WHITE) },
  { id: "birthday-color", category: "birthday", label: "สีสด", templateId: "blank", background: "#fff3bf", texts: centerBlock(DARK) },
  // Minimal
  { id: "minimal-white", category: "minimal", label: "ขาวสะอาด", templateId: "blank", background: "#ffffff", texts: centerBlock(DARK) },
  { id: "minimal-frame", category: "minimal", label: "กรอบรูปเดียว", templateId: "full", texts: bottomBlock(WHITE) },
  // Luxury
  { id: "luxury-dark", category: "luxury", label: "ดำหรู", templateId: "blank", background: "#1A1612", texts: centerBlock("#E8D9B5") },
  { id: "luxury-photo", category: "luxury", label: "ภาพหรู", templateId: "full", texts: bottomBlock("#F3D7CB") },
  // Modern
  { id: "modern-top", category: "modern", label: "ทันสมัยบน", templateId: "full", texts: topBlock(WHITE) },
  { id: "modern-split", category: "modern", label: "แยกซ้าย-ขวา", templateId: "two-v", background: "#d0ebff", texts: topBlock(DARK) },
  // Scrapbook
  { id: "scrapbook-grid", category: "scrapbook", label: "ตาราง 4 รูป", templateId: "four-grid", background: "#fff5f7", texts: topBlock(DARK) },
  { id: "scrapbook-feature", category: "scrapbook", label: "เด่นซ้าย", templateId: "feature-left", background: "#f0f9ff", texts: topBlock(DARK) },
  // Seasonal
  { id: "seasonal-spring", category: "seasonal", label: "ฤดูใบไม้ผลิ", templateId: "full", background: "#e8f5e9", texts: bottomBlock(WHITE) },
  { id: "seasonal-warm", category: "seasonal", label: "ใบไม้ร่วง", templateId: "blank", background: "#ffe8cc", texts: centerBlock(DARK) },
];

export function getCoverTemplate(id: string): CoverTemplate | undefined {
  return COVER_TEMPLATES.find((c) => c.id === id);
}
