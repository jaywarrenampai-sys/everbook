"use client";

import { TemplateSlot } from "@/lib/editor/templates";
import { UploadedPhoto } from "@/lib/editor/types";

interface Props {
  slot: TemplateSlot;
  photo: UploadedPhoto | undefined;
  pageWidthPx: number;
  pageHeightPx: number;
  onDrop: (slotId: string, photoId: string) => void;
  onClear: (slotId: string) => void;
}

export default function TemplateSlotView({
  slot,
  photo,
  pageWidthPx,
  pageHeightPx,
  onDrop,
  onClear,
}: Props) {
  const style: React.CSSProperties = {
    position: "absolute",
    left:   `${slot.x * 100}%`,
    top:    `${slot.y * 100}%`,
    width:  `${slot.width * 100}%`,
    height: `${slot.height * 100}%`,
  };

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const photoId = e.dataTransfer.getData("photoId");
    if (photoId) onDrop(slot.id, photoId);
  }

  // suppress unused var warning — pageWidthPx / pageHeightPx reserved for future crop
  void pageWidthPx; void pageHeightPx;

  return (
    <div
      style={style}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="group overflow-hidden"
    >
      {photo ? (
        // Filled slot
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.previewUrl}
            alt=""
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
          {/* Clear button on hover */}
          <button
            onClick={() => onClear(slot.id)}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
          >
            ×
          </button>
          {/* Drag-over overlay */}
          <div className="absolute inset-0 bg-amber-400/30 opacity-0 group-hover:opacity-0 peer-[.drag-over]:opacity-100 pointer-events-none" />
        </div>
      ) : (
        // Empty slot — dashed drop zone
        <div className="w-full h-full border-2 border-dashed border-stone-300 rounded-sm flex flex-col items-center justify-center text-stone-300 bg-stone-50/60 transition-colors hover:border-amber-400 hover:bg-amber-50/40">
          <span className="text-2xl mb-1 pointer-events-none">+</span>
          <span className="text-[10px] pointer-events-none">วางรูปที่นี่</span>
        </div>
      )}
    </div>
  );
}
