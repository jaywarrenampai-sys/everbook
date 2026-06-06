"use client";

import { useRef } from "react";
import {
  PlacedPhoto,
  UploadedPhoto,
  ResizeHandle,
} from "@/lib/editor/types";
import {
  clampPlacement,
  pxToFraction,
  MIN_PLACEMENT_SIZE,
} from "@/lib/editor/layout";

interface Props {
  placement: PlacedPhoto;
  photo: UploadedPhoto;
  isSelected: boolean;
  pageWidthPx: number;
  pageHeightPx: number;
  onSelect: () => void;
  onChange: (updated: PlacedPhoto) => void;
  onDelete: () => void;
}

export default function PlacedPhotoItem({
  placement,
  photo,
  isSelected,
  pageWidthPx,
  pageHeightPx,
  onSelect,
  onChange,
  onDelete,
}: Props) {
  const dragStart = useRef<{ mouseX: number; mouseY: number; placement: PlacedPhoto } | null>(null);

  // ── Move ──────────────────────────────────────────────────────────────────
  function handleMoveStart(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect();
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, placement };

    function onMove(me: MouseEvent) {
      if (!dragStart.current) return;
      const dx = pxToFraction(me.clientX - dragStart.current.mouseX, pageWidthPx);
      const dy = pxToFraction(me.clientY - dragStart.current.mouseY, pageHeightPx);
      const updated = clampPlacement({
        ...dragStart.current.placement,
        x: dragStart.current.placement.x + dx,
        y: dragStart.current.placement.y + dy,
      });
      onChange(updated);
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function handleResizeStart(e: React.MouseEvent, handle: ResizeHandle) {
    e.stopPropagation();
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, placement };

    function onMove(me: MouseEvent) {
      if (!dragStart.current) return;
      const dx = pxToFraction(me.clientX - dragStart.current.mouseX, pageWidthPx);
      const dy = pxToFraction(me.clientY - dragStart.current.mouseY, pageHeightPx);
      const orig = dragStart.current.placement;

      let { x, y, width, height } = orig;

      if (handle === "se") {
        width = Math.max(MIN_PLACEMENT_SIZE, orig.width + dx);
        height = Math.max(MIN_PLACEMENT_SIZE, orig.height + dy);
      } else if (handle === "sw") {
        const newWidth = Math.max(MIN_PLACEMENT_SIZE, orig.width - dx);
        x = orig.x + (orig.width - newWidth);
        width = newWidth;
        height = Math.max(MIN_PLACEMENT_SIZE, orig.height + dy);
      } else if (handle === "ne") {
        width = Math.max(MIN_PLACEMENT_SIZE, orig.width + dx);
        const newHeight = Math.max(MIN_PLACEMENT_SIZE, orig.height - dy);
        y = orig.y + (orig.height - newHeight);
        height = newHeight;
      } else if (handle === "nw") {
        const newWidth = Math.max(MIN_PLACEMENT_SIZE, orig.width - dx);
        const newHeight = Math.max(MIN_PLACEMENT_SIZE, orig.height - dy);
        x = orig.x + (orig.width - newWidth);
        y = orig.y + (orig.height - newHeight);
        width = newWidth;
        height = newHeight;
      }

      onChange(clampPlacement({ ...orig, x, y, width, height }));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${placement.x * 100}%`,
    top: `${placement.y * 100}%`,
    width: `${placement.width * 100}%`,
    height: `${placement.height * 100}%`,
    cursor: "move",
    userSelect: "none",
  };

  const handleClass =
    "absolute w-3 h-3 bg-white border-2 border-amber-500 rounded-sm z-10";

  return (
    <div
      style={style}
      onMouseDown={handleMoveStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.previewUrl}
        alt=""
        className="w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* Selection border */}
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-amber-500 pointer-events-none rounded-sm" />

          {/* Delete button */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center z-20 hover:bg-red-600 shadow"
          >
            ×
          </button>

          {/* Resize handles */}
          <div className={`${handleClass} -top-1.5 -left-1.5 cursor-nw-resize`}
            onMouseDown={(e) => handleResizeStart(e, "nw")} />
          <div className={`${handleClass} -top-1.5 -right-1.5 cursor-ne-resize`}
            onMouseDown={(e) => handleResizeStart(e, "ne")} />
          <div className={`${handleClass} -bottom-1.5 -left-1.5 cursor-sw-resize`}
            onMouseDown={(e) => handleResizeStart(e, "sw")} />
          <div className={`${handleClass} -bottom-1.5 -right-1.5 cursor-se-resize`}
            onMouseDown={(e) => handleResizeStart(e, "se")} />
        </>
      )}
    </div>
  );
}
