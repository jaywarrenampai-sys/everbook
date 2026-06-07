"use client";

import { BookPage, UploadedPhoto } from "@/lib/editor/types";
import PageCanvas from "./PageCanvas";

interface Props {
  page: BookPage;
  photos: UploadedPhoto[];
  width: number;
  height: number;
  side: "left" | "right";
}

/**
 * Interactive page renderer for the editor.
 * Wraps PageCanvas with selection, dragging, and other interactions.
 * Currently minimal; selection & resizing can be added incrementally.
 */
export default function EditablePage({ page, photos, width, height, side }: Props) {
  return (
    <PageCanvas
      page={page}
      photos={photos}
      width={width}
      height={height}
      fullBleed={page.fullBleed}
    />
  );
}
