// ─── Page Templates ────────────────────────────────────────────────────────
// Each template defines named slots. Slot coordinates are 0–1 fractions
// of the page's printable area — same coordinate system used for print export.

export interface TemplateSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: string;
  label: string;        // Thai display name
  icon: string;         // emoji icon for picker
  slots: TemplateSlot[];
}

const PAD = 0.04; // inner margin as fraction of page
const GAP = 0.03; // gap between slots

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    label: "ว่างเปล่า",
    icon: "⬜",
    slots: [],
  },
  {
    id: "full",
    label: "1 รูป เต็มหน้า",
    icon: "🟫",
    slots: [
      { id: "s0", x: PAD, y: PAD, width: 1 - PAD * 2, height: 1 - PAD * 2 },
    ],
  },
  {
    id: "two-h",
    label: "2 รูป แนวนอน",
    icon: "⬛⬛",
    slots: [
      {
        id: "s0",
        x: PAD,
        y: PAD,
        width: 1 - PAD * 2,
        height: (1 - PAD * 2 - GAP) / 2,
      },
      {
        id: "s1",
        x: PAD,
        y: PAD + (1 - PAD * 2 - GAP) / 2 + GAP,
        width: 1 - PAD * 2,
        height: (1 - PAD * 2 - GAP) / 2,
      },
    ],
  },
  {
    id: "two-v",
    label: "2 รูป แนวตั้ง",
    icon: "▪▪",
    slots: [
      {
        id: "s0",
        x: PAD,
        y: PAD,
        width: (1 - PAD * 2 - GAP) / 2,
        height: 1 - PAD * 2,
      },
      {
        id: "s1",
        x: PAD + (1 - PAD * 2 - GAP) / 2 + GAP,
        y: PAD,
        width: (1 - PAD * 2 - GAP) / 2,
        height: 1 - PAD * 2,
      },
    ],
  },
  {
    id: "four-grid",
    label: "4 รูป ตาราง",
    icon: "⊞",
    slots: (() => {
      const w = (1 - PAD * 2 - GAP) / 2;
      const h = (1 - PAD * 2 - GAP) / 2;
      return [
        { id: "s0", x: PAD,         y: PAD,         width: w, height: h },
        { id: "s1", x: PAD + w + GAP, y: PAD,       width: w, height: h },
        { id: "s2", x: PAD,         y: PAD + h + GAP, width: w, height: h },
        { id: "s3", x: PAD + w + GAP, y: PAD + h + GAP, width: w, height: h },
      ];
    })(),
  },
  {
    id: "feature-left",
    label: "ใหญ่ซ้าย + 2 เล็ก",
    icon: "▉▪",
    slots: (() => {
      const bigW = (1 - PAD * 2 - GAP) * 0.62;
      const smallW = 1 - PAD * 2 - GAP - bigW;
      const smallH = (1 - PAD * 2 - GAP) / 2;
      return [
        { id: "s0", x: PAD, y: PAD, width: bigW, height: 1 - PAD * 2 },
        { id: "s1", x: PAD + bigW + GAP, y: PAD,               width: smallW, height: smallH },
        { id: "s2", x: PAD + bigW + GAP, y: PAD + smallH + GAP, width: smallW, height: smallH },
      ];
    })(),
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
