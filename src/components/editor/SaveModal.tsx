"use client";

import { useState } from "react";

interface Props {
  defaultTitle: string;
  isSaving: boolean;
  onSave: (title: string) => void;
  onClose: () => void;
}

export default function SaveModal({ defaultTitle, isSaving, onSave, onClose }: Props) {
  const [title, setTitle] = useState(defaultTitle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 font-heading text-xl font-extrabold text-foreground">บันทึกหนังสือ</h2>
        <p className="mb-5 text-sm text-muted-foreground">ตั้งชื่อหนังสือของคุณ</p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ทริปครอบครัว 2024"
          className="mb-6 w-full rounded-2xl border-2 border-border bg-secondary/30 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onSave(title)}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border-2 border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(title)}
            disabled={isSaving || !title.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span> กำลังบันทึก…
              </>
            ) : (
              "บันทึก"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
