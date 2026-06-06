"use client";

import { useRef } from "react";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";

interface Props {
  pages: BookPage[];
  currentPageIndex: number;
  photos: UploadedPhoto[];
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function PageThumbnailStrip({
  pages,
  currentPageIndex,
  photos,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: Props) {
  const dragIndex = useRef<number | null>(null);

  function getPhoto(photoId: string): UploadedPhoto | undefined {
    return photos.find((p) => p.id === photoId);
  }

  function getFirstPhotoUrl(page: BookPage): string | null {
    // Template mode
    const firstFill = Object.values(page.slotFills)[0];
    if (firstFill) return getPhoto(firstFill)?.previewUrl ?? null;
    // Free mode
    if (page.placements[0]) return getPhoto(page.placements[0].photoId)?.previewUrl ?? null;
    return null;
  }

  return (
    <div className="h-28 bg-stone-900 border-t border-stone-700 flex items-center gap-2 px-3 overflow-x-auto flex-shrink-0">
      {pages.map((page, i) => {
        const template = getTemplate(page.templateId);
        const previewUrl = getFirstPhotoUrl(page);
        const isActive = i === currentPageIndex;

        return (
          <div
            key={page.id}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current !== null && dragIndex.current !== i) {
                onReorder(dragIndex.current, i);
                dragIndex.current = null;
              }
            }}
            className={`relative flex-shrink-0 group cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
              isActive
                ? "border-amber-400 scale-105 shadow-lg shadow-amber-900/40"
                : "border-stone-600 hover:border-stone-400"
            }`}
            style={{ width: 64, height: 90 }}
            onClick={() => onSelect(i)}
          >
            {/* Thumbnail content */}
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                <span className="text-stone-500 text-lg">{template.icon}</span>
              </div>
            )}

            {/* Page number badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
              {i + 1}
            </div>

            {/* Delete button — appears on hover, not on the first page */}
            {pages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(i); }}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      {/* Add page button */}
      <button
        onClick={onAdd}
        className="flex-shrink-0 w-16 border-2 border-dashed border-stone-600 hover:border-amber-400 rounded-md flex flex-col items-center justify-center text-stone-500 hover:text-amber-400 transition-colors gap-1"
        style={{ height: 90 }}
      >
        <span className="text-xl">+</span>
        <span className="text-[9px]">หน้าใหม่</span>
      </button>
    </div>
  );
}
