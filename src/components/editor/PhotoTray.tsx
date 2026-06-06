"use client";

import { useRef } from "react";
import { uid } from "@/lib/uid";
import { UploadedPhoto } from "@/lib/editor/types";

interface Props {
  photos: UploadedPhoto[];
  onAdd: (photos: UploadedPhoto[]) => void;
}

export default function PhotoTray({ photos, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const loaded: UploadedPhoto[] = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<UploadedPhoto>((resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () =>
              resolve({
                id: uid(),
                previewUrl: url,
                file,
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            img.src = url;
          })
      )
    );
    onAdd(loaded);
  }

  function handleDragStart(e: React.DragEvent, photo: UploadedPhoto) {
    e.dataTransfer.setData("photoId", photo.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  function handleTrayDrop(e: React.DragEvent) {
    // Allow dropping files directly into the tray
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      className="w-32 bg-stone-900 border-l border-stone-700 flex flex-col overflow-y-auto flex-shrink-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleTrayDrop}
    >
      {/* Header */}
      <div className="px-2 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-700 text-center">
        รูปภาพ
      </div>

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        className="mx-2 mt-2 mb-1 py-2 rounded-lg border border-dashed border-stone-600 hover:border-amber-400 text-stone-500 hover:text-amber-400 text-xs flex flex-col items-center gap-1 transition-colors flex-shrink-0"
      >
        <span className="text-lg">+</span>
        <span>เพิ่มรูป</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Thumbnails */}
      <div className="flex flex-col gap-2 px-2 py-2 overflow-y-auto">
        {photos.map((photo) => (
          <div
            key={photo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, photo)}
            className="flex-shrink-0 w-full aspect-square rounded-md overflow-hidden border border-stone-700 hover:border-amber-400 transition-colors cursor-grab active:cursor-grabbing shadow"
            title="ลากไปวางบนหน้าหนังสือ"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt=""
              className="w-full h-full object-cover select-none"
              draggable={false}
            />
          </div>
        ))}
        {photos.length === 0 && (
          <p className="text-stone-600 text-[10px] text-center leading-relaxed mt-2">
            อัปโหลดรูปแล้วลากไปวางบนหน้าหนังสือ
          </p>
        )}
      </div>
    </div>
  );
}
