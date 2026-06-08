"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store/editorStore";
import { buildSpreads } from "@/lib/editor/spreads";
import BookViewer from "@/components/preview/BookViewer";
import PreviewControls from "@/components/preview/PreviewControls";

/**
 * Book preview page
 * Full-screen viewer that turns the book one spread at a time.
 */
export default function PreviewPage() {
  const router = useRouter();
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const [spreadIndex, setSpreadIndex] = useState(0);

  // If no pages loaded, redirect to editor
  useEffect(() => {
    if (layout.pages.length === 0) {
      router.push("/editor");
    }
  }, [layout.pages.length, router]);

  if (layout.pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-neutral-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const spreads = buildSpreads(layout.pages);
  const idx = Math.min(spreadIndex, spreads.length - 1);
  const spread = spreads[idx];

  const goPrev = () => setSpreadIndex(Math.max(0, idx - 1));
  const goNext = () => setSpreadIndex(Math.min(spreads.length - 1, idx + 1));

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      {/* Viewer */}
      <div className="flex-1 overflow-hidden">
        <BookViewer
          left={spread?.left ?? null}
          right={spread?.right ?? null}
          photos={photos}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      {/* Controls footer */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-center justify-between gap-4">
          <PreviewControls
            currentPage={idx}
            totalPages={spreads.length}
            onPrevious={goPrev}
            onNext={goNext}
          />
          <button
            onClick={() => router.push("/editor")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white hover:bg-neutral-800"
          >
            ← กลับไปแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
