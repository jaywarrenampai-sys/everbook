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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-lg font-bold text-stone-800 mb-1">บันทึกหนังสือ</h2>
        <p className="text-sm text-stone-500 mb-6">ตั้งชื่อหนังสือของคุณ</p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ทริปครอบครัว 2024"
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onSave(title)}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(title)}
            disabled={isSaving || !title.trim()}
            className="flex-1 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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
