"use client";

import { useState, useEffect, useRef } from "react";
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import { PAGE_H_OVER_W } from "@/lib/editor/layout";
import PageCanvas from "@/components/editor2/PageCanvas";

interface Props {
  layout: BookLayout;
  photos: UploadedPhoto[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Full-screen book viewer with page navigation.
 * Supports:
 * - Click corners to turn pages
 * - Swipe/drag to turn pages (on mobile & desktop)
 * - Keyboard navigation (arrow keys)
 */
export default function BookViewer({
  layout,
  photos,
  currentPage,
  onPageChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [pageWidth, setPageWidth] = useState(340);

  // Calculate page height based on aspect ratio — true portrait A4
  const ASPECT = PAGE_H_OVER_W; // height / width (297/210)
  const pageHeight = Math.round(pageWidth * ASPECT);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Use ~80% of available width, capped at 500px
        const width = Math.min(
          containerRef.current.clientWidth * 0.8,
          500
        );
        setPageWidth(Math.max(200, width));
      }
    };

    handleResize();
    const debounce = setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(debounce);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPageChange(Math.max(0, currentPage - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onPageChange(Math.min(layout.pages.length - 1, currentPage + 1));
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [currentPage, layout.pages.length, onPageChange]);

  // Detect click on page edges (left/right) for turning
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const threshold = pageWidth * 0.2; // 20% on each side

    if (relX < threshold) {
      onPageChange(Math.max(0, currentPage - 1));
    } else if (relX > rect.width - threshold) {
      onPageChange(Math.min(layout.pages.length - 1, currentPage + 1));
    }
  };

  // Handle drag/swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;
    const dragEnd = { x: e.clientX, y: e.clientY };
    const deltaX = dragEnd.x - dragStartRef.current.x;
    const threshold = 50; // minimum swipe distance in pixels

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swiped right = go to previous page
        onPageChange(Math.max(0, currentPage - 1));
      } else {
        // Swiped left = go to next page
        onPageChange(Math.min(layout.pages.length - 1, currentPage + 1));
      }
    }
    dragStartRef.current = null;
  };

  const page = layout.pages[currentPage];

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="flex items-center justify-center bg-neutral-900 select-none cursor-pointer"
      style={{ userSelect: "none" }}
    >
      {page && (
        <div className="relative shadow-2xl">
          <PageCanvas
            page={page}
            photos={photos}
            width={pageWidth}
            height={pageHeight}
          />
          {/* Corner indicators for page turning */}
          <div
            className="absolute left-0 top-0 w-1/5 h-full opacity-0 hover:opacity-10 bg-white transition-opacity cursor-pointer"
            title="ก่อนหน้า"
          />
          <div
            className="absolute right-0 top-0 w-1/5 h-full opacity-0 hover:opacity-10 bg-white transition-opacity cursor-pointer"
            title="ถัดไป"
          />
        </div>
      )}
    </div>
  );
}
