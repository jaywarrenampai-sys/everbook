"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store/editorStore";
import BookViewer from "@/components/preview/BookViewer";
import PreviewControls from "@/components/preview/PreviewControls";

/**
 * Book preview page
 * Full-screen viewer with page navigation for the photobook
 */
export default function PreviewPage() {
  const router = useRouter();
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const [currentPage, setCurrentPage] = useState(0);

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

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      {/* Viewer */}
      <div className="flex-1 overflow-hidden">
        <BookViewer
          layout={layout}
          photos={photos}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Controls footer */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-center justify-between gap-4">
          <PreviewControls
            currentPage={currentPage}
            totalPages={layout.pages.length}
            onPrevious={() => setCurrentPage(Math.max(0, currentPage - 1))}
            onNext={() =>
              setCurrentPage(Math.min(layout.pages.length - 1, currentPage + 1))
            }
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
