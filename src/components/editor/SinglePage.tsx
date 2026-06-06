"use client";

import { BookPage, UploadedPhoto, PlacedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import {
  fillSlot,
  clearSlot,
  addPlacement,
  updatePlacement,
  removePlacement,
  defaultPlacement,
} from "@/lib/editor/layout";
import TemplateSlotView from "./TemplateSlotView";
import PlacedPhotoItem from "./PlacedPhotoItem";
import { useState } from "react";

interface Props {
  page: BookPage;
  photos: UploadedPhoto[];
  widthPx: number;
  heightPx: number;
  /** is this the left or right page in the spread? */
  side: "left" | "right";
  onChange: (updated: BookPage) => void;
}

export default function SinglePage({
  page,
  photos,
  widthPx,
  heightPx,
  side,
  onChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const template = getTemplate(page.templateId);

  function getPhoto(photoId: string): UploadedPhoto | undefined {
    return photos.find((p) => p.id === photoId);
  }

  // ── Template drag-drop ────────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    if (page.templateId === "blank") e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    if (page.templateId !== "blank") return;
    e.preventDefault();
    const photoId = e.dataTransfer.getData("photoId");
    if (!photoId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / widthPx;
    const relY = (e.clientY - rect.top) / heightPx;
    const placement: PlacedPhoto = {
      ...defaultPlacement(photoId),
      x: Math.max(0, relX - 0.2),
      y: Math.max(0, relY - 0.2),
    };
    onChange(addPlacement(page, placement));
    setSelectedId(placement.id);
  }

  // spine shadow direction
  const spineClass =
    side === "left"
      ? "shadow-[inset_-8px_0_16px_-8px_rgba(0,0,0,0.18)]"
      : "shadow-[inset_8px_0_16px_-8px_rgba(0,0,0,0.18)]";

  return (
    <div
      style={{ width: widthPx, height: heightPx }}
      className={`relative bg-white overflow-hidden flex-shrink-0 ${spineClass}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => setSelectedId(null)}
    >
      {/* Template slots */}
      {template.slots.map((slot) => (
        <TemplateSlotView
          key={slot.id}
          slot={slot}
          photo={page.slotFills[slot.id] ? getPhoto(page.slotFills[slot.id]) : undefined}
          pageWidthPx={widthPx}
          pageHeightPx={heightPx}
          onDrop={(slotId, photoId) => onChange(fillSlot(page, slotId, photoId))}
          onClear={(slotId) => onChange(clearSlot(page, slotId))}
        />
      ))}

      {/* Blank / free-form placements */}
      {page.templateId === "blank" &&
        page.placements.map((placement) => {
          const photo = getPhoto(placement.photoId);
          if (!photo) return null;
          return (
            <PlacedPhotoItem
              key={placement.id}
              placement={placement}
              photo={photo}
              isSelected={selectedId === placement.id}
              pageWidthPx={widthPx}
              pageHeightPx={heightPx}
              onSelect={() => setSelectedId(placement.id)}
              onChange={(updated) => onChange(updatePlacement(page, updated))}
              onDelete={() => {
                onChange(removePlacement(page, placement.id));
                setSelectedId(null);
              }}
            />
          );
        })}

      {/* Empty state for blank pages */}
      {page.templateId === "blank" && page.placements.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-200 pointer-events-none select-none">
          <span className="text-4xl mb-2">📷</span>
          <span className="text-xs">ลากรูปมาวาง</span>
        </div>
      )}
    </div>
  );
}
