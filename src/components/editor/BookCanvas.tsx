"use client";

import { useRef, useState, useEffect } from "react";
import { BookPage, UploadedPhoto, PlacedPhoto } from "@/lib/editor/types";
import {
  PAGE_ASPECT_RATIO,
  addPlacement,
  updatePlacement,
  removePlacement,
  defaultPlacement,
} from "@/lib/editor/layout";
import PlacedPhotoItem from "./PlacedPhotoItem";

interface Props {
  page: BookPage;
  photos: UploadedPhoto[];
  onChange: (updated: BookPage) => void;
}

export default function BookCanvas({ page, photos, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Measure container and compute canvas dimensions
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const canvasWidth = Math.min(containerWidth - 48, 900);
      const canvasHeight = canvasWidth / PAGE_ASPECT_RATIO;
      if (canvasHeight > containerHeight - 48) {
        const h = containerHeight - 48;
        setCanvasSize({ width: h * PAGE_ASPECT_RATIO, height: h });
      } else {
        setCanvasSize({ width: canvasWidth, height: canvasHeight });
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Drag-and-drop from photo tray ─────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);

    const photoId = e.dataTransfer.getData("photoId");
    if (!photoId) return;

    // Calculate drop position relative to the canvas
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / canvasSize.width;
    const relY = (e.clientY - rect.top) / canvasSize.height;

    const placement: PlacedPhoto = {
      ...defaultPlacement(photoId),
      x: Math.max(0, relX - 0.2),
      y: Math.max(0, relY - 0.2),
    };

    onChange(addPlacement(page, placement));
    setSelectedId(placement.id);
  }

  function handleCanvasClick() {
    setSelectedId(null);
  }

  // ── Photo lookup ──────────────────────────────────────────────────────────
  function getPhoto(photoId: string): UploadedPhoto | undefined {
    return photos.find((p) => p.id === photoId);
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-stone-200 overflow-hidden"
    >
      {canvasSize.width === 0 ? (
        <div className="text-stone-400 text-sm">กำลังโหลด...</div>
      ) : (
        <div
          style={{ width: canvasSize.width, height: canvasSize.height }}
          className={`relative bg-white shadow-2xl rounded-sm overflow-hidden select-none transition-all ${
            isDragOver ? "ring-4 ring-amber-400 ring-offset-2" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {/* Empty state */}
          {page.placements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 pointer-events-none">
              <div className="text-5xl mb-3">📷</div>
              <p className="text-sm font-medium">ลากรูปภาพมาวางที่นี่</p>
              <p className="text-xs mt-1">หรือคลิกรูปในถาดด้านล่าง</p>
            </div>
          )}

          {/* Placed photos */}
          {page.placements.map((placement) => {
            const photo = getPhoto(placement.photoId);
            if (!photo) return null;
            return (
              <PlacedPhotoItem
                key={placement.id}
                placement={placement}
                photo={photo}
                isSelected={selectedId === placement.id}
                pageWidthPx={canvasSize.width}
                pageHeightPx={canvasSize.height}
                onSelect={() => setSelectedId(placement.id)}
                onChange={(updated) => onChange(updatePlacement(page, updated))}
                onDelete={() => {
                  onChange(removePlacement(page, placement.id));
                  setSelectedId(null);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
