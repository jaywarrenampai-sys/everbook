"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEditorStore } from "@/lib/store/editorStore";

interface Props {
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onOrder: () => void;
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
  active,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-0.5 rounded px-2.5 py-1 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-35 ${
        active ? "bg-neutral-100 text-neutral-900" : ""
      }`}
    >
      {children}
      <span className="text-[9px] leading-none">{label}</span>
    </button>
  );
}

export default function TopBar({ onBack, onSave, onPreview, onOrder }: Props) {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const saveState = useEditorStore((s) => s.saveState);
  const title = useEditorStore((s) => s.projectTitle);

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <header className="no-scrollbar relative z-30 flex h-13 shrink-0 items-center gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-2 py-2 md:px-3">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex h-8 w-8 items-center justify-center rounded text-neutral-600 transition-colors hover:bg-neutral-100"
        title="กลับ"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="mx-1 h-5 w-px bg-neutral-200" />

      {/* Undo / Redo */}
      <IconBtn label="ย้อนกลับ" onClick={undo} disabled={past.length === 0}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M3 7h7a4 4 0 0 1 0 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M3 7l3-3M3 7l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconBtn>
      <IconBtn label="ทำซ้ำ" onClick={redo} disabled={future.length === 0}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M13 7H6a4 4 0 0 0 0 8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13 7l-3-3M13 7l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconBtn>

      {/* History */}
      <div className="relative">
        <IconBtn label="ประวัติ" active={historyOpen} onClick={() => setHistoryOpen((v) => !v)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconBtn>
        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400">ประวัติการแก้ไข</div>
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-neutral-600">
                <span>ก้าวที่ย้อนได้</span>
                <span className="font-mono">{past.length}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-neutral-600">
                <span>ก้าวที่ทำซ้ำได้</span>
                <span className="font-mono">{future.length}</span>
              </div>
              <div className="mt-1 flex gap-2 border-t border-neutral-100 pt-2">
                <button
                  onClick={() => { undo(); }}
                  disabled={past.length === 0}
                  className="flex-1 rounded bg-neutral-100 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={() => { redo(); }}
                  disabled={future.length === 0}
                  className="flex-1 rounded bg-neutral-100 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
                >
                  ทำซ้ำ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title (center) */}
      <div className="flex-1 text-center">
        <span className="hidden truncate text-sm font-medium text-neutral-700 sm:inline">{title}</span>
      </div>

      {/* Save / Preview / Order */}
      <IconBtn label={saveState === "saving" ? "…" : saveState === "saved" ? "✓" : "บันทึก"} onClick={onSave}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M13 10v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2M8 2v7M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconBtn>
      <IconBtn label="ดูตัวอย่าง" onClick={onPreview}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </IconBtn>

      <button
        onClick={onOrder}
        className="ml-1 flex shrink-0 items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 md:px-4"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M2 2h2l2.5 7h5L14 5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="13" r="1" fill="currentColor" />
          <circle cx="12" cy="13" r="1" fill="currentColor" />
        </svg>
        สั่งพิมพ์
      </button>
    </header>
  );
}
