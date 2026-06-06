"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useEditorStore } from "@/lib/store/editorStore";
import { BookPage } from "@/lib/editor/types";
import PageCanvas from "./PageCanvas";

const PW = 110;
const PH = Math.round(PW / 0.77); // portrait 8.5:11

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
    <div className="flex-1 overflow-y-auto bg-[#f2f2f2] p-8">
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
            className="group flex items-center justify-center rounded-sm border-2 border-dashed border-neutral-300 transition-all hover:border-neutral-500 hover:bg-neutral-50"
            style={{ width: PW * 2 + 2, height: PH }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-neutral-400 group-hover:text-neutral-600">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-[11px] font-medium text-neutral-400">เพิ่มหน้า</span>
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
        className={`relative cursor-pointer rounded-sm transition-all ${active ? "shadow-md ring-2 ring-neutral-900" : "shadow-sm ring-1 ring-neutral-200 hover:ring-neutral-400"}`}
        style={{ width: PW * 2 + 2 }}
      >
        <div className="flex overflow-hidden rounded-sm">
          <PageCanvas page={spread.left} photos={photos} width={PW} height={PH} />
          <div className="w-px shrink-0 bg-neutral-200" style={{ height: PH }} />
          <PageCanvas page={spread.right} photos={photos} width={PW} height={PH} />
        </div>

        {hover && (
          <div className="absolute right-2 top-2 flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="rounded-sm bg-neutral-800/85 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-neutral-900">
              แก้ไข
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="rounded-sm bg-neutral-800/85 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-neutral-900">
              ทำสำเนา
            </button>
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium text-neutral-500">{spread.label}</span>
      <motion.span initial={false} />
    </div>
  );
}
