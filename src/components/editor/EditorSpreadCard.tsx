"use client";

import { useState } from "react";
import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import PageThumbnail from "./PageThumbnail";

// Portrait A4 page: height = width * 1.414
const PAGE_W = 112;
const PAGE_H = Math.round(PAGE_W * 1.414); // 158px

interface SpreadItem {
  label:      string;
  leftPage:   BookPage | null;
  rightPage:  BookPage | null;
  leftIndex:  number | null;
  rightIndex: number | null;
}

interface Props {
  spread:      SpreadItem;
  photos:      UploadedPhoto[];
  isActive:    boolean;
  onEdit:      () => void;
  onDuplicate: () => void;
}

export default function EditorSpreadCard({ spread, photos, isActive, onEdit, onDuplicate }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Card */}
      <div
        className={`relative cursor-pointer rounded-sm transition-all duration-100 ${
          isActive
            ? "ring-2 ring-neutral-900 shadow-md"
            : "ring-1 ring-neutral-200 shadow-sm hover:ring-neutral-400"
        }`}
        style={{ width: PAGE_W * 2 + 2 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onEdit}
      >
        {/* Pages */}
        <div className="flex overflow-hidden rounded-sm">
          <PageThumbnail page={spread.leftPage}  photos={photos} width={PAGE_W} height={PAGE_H} />
          {/* Spine */}
          <div className="w-px bg-neutral-200 shrink-0" style={{ height: PAGE_H }} />
          <PageThumbnail page={spread.rightPage} photos={photos} width={PAGE_W} height={PAGE_H} />
        </div>

        {/* Hover overlay buttons (EDIT + DUPLICATE) */}
        {hovered && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1 bg-neutral-800/85 hover:bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded-sm backdrop-blur-sm transition-colors"
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path d="M2 9.5l2-2 5-5a1.414 1.414 0 0 0-2-2l-5 5-2 2h2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              EDIT
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="flex items-center gap-1 bg-neutral-800/85 hover:bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded-sm backdrop-blur-sm transition-colors"
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 1h6a1 1 0 0 1 1 1v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              DUPLICATE
            </button>
          </div>
        )}
      </div>

      {/* Label */}
      <span className="text-[11px] text-neutral-500 font-medium">{spread.label}</span>
    </div>
  );
}

export type { SpreadItem };
