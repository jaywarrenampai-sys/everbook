"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@/lib/store/editorStore";
import { BookPage } from "@/lib/editor/types";
import PageCanvas from "./PageCanvas";
import { PAGE_H_OVER_W } from "@/lib/editor/layout";

const PW = 110;
const PH = Math.round(PW * PAGE_H_OVER_W); // true portrait A4 (297/210)

interface Spread {
  label: string;
  left: BookPage | null;
  right: BookPage | null;
  editIndex: number;
}

function buildSpreads(pages: BookPage[]): Spread[] {
  const out: Spread[] = [];
  if (pages[0]) out.push({ label: "ปก", left: pages[0], right: null, editIndex: 0 });
  if (pages[1]) out.push({ label: "หน้า 1", left: null, right: pages[1], editIndex: 1 });
  for (let i = 2; i < pages.length; i += 2) {
    out.push({
      label: pages[i + 1] ? `หน้า ${i}-${i + 1}` : `หน้า ${i}`,
      left: pages[i],
      right: pages[i + 1] ?? null,
      editIndex: i,
    });
  }
  return out;
}

export default function PageGrid() {
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const goToPage = useEditorStore((s) => s.goToPage);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const duplicatePage = useEditorStore((s) => s.duplicatePage);
  const addPage = useEditorStore((s) => s.addPage);

  const spreads = buildSpreads(layout.pages);
  const activeIndex = layout.currentPageIndex;

  function edit(index: number) {
    goToPage(index);
    setViewMode("single");
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted to-background p-8">
      <div className="grid gap-x-5 gap-y-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))" }}>
        {spreads.map((sp, i) => (
          <SpreadCard
            key={i}
            spread={sp}
            photos={photos}
            active={sp.editIndex === activeIndex || (sp.right && layout.pages.indexOf(sp.right) === activeIndex) || false}
            onEdit={() => edit(sp.editIndex)}
            onDuplicate={() => duplicatePage((sp.right ?? sp.left)!.id)}
          />
        ))}

        {/* Add page */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={addPage}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-all hover:bg-primary/10"
            style={{ width: PW * 2 + 2, height: PH }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold">เพิ่มหน้า</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SpreadCard({
  spread,
  photos,
  active,
  onEdit,
  onDuplicate,
}: {
  spread: Spread;
  photos: ReturnType<typeof useEditorStore.getState>["photos"];
  active: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onEdit}
        className={`relative cursor-pointer rounded-2xl border-2 p-1.5 transition-all hover:-translate-y-0.5 ${active ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card shadow-sm hover:border-primary/40"}`}
        style={{ width: PW * 2 + 2 + 12 }}
      >
        <div className="flex overflow-hidden rounded-xl border border-border">
          <PageCanvas page={spread.left} photos={photos} width={PW} height={PH} />
          <div className="w-px shrink-0 bg-border" style={{ height: PH }} />
          <PageCanvas page={spread.right} photos={photos} width={PW} height={PH} />
        </div>

        {hover && (
          <div className="absolute right-2 top-2 flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold text-background backdrop-blur-sm transition-colors hover:bg-foreground">
              แก้ไข
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold text-background backdrop-blur-sm transition-colors hover:bg-foreground">
              ทำสำเนา
            </button>
          </div>
        )}
      </div>
      <span className="text-[11px] font-semibold text-muted-foreground">{spread.label}</span>
      <motion.span initial={false} />
    </div>
  );
}
