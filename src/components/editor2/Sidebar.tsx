"use client";

import { useRef, useState } from "react";
import { useEditorStore, Panel } from "@/lib/store/editorStore";
import { UploadedPhoto } from "@/lib/editor/types";
import { TEMPLATES, getTemplate } from "@/lib/editor/templates";
import { uid } from "@/lib/uid";

// Solid background swatches for the Backgrounds panel
const BACKGROUNDS = ["#ffffff", "#F7F3EC", "#EDE4D6", "#2E2620", "#1A1612", "#B4734E", "#6E7B5B", "#F3D7CB"];

async function processFiles(files: FileList): Promise<UploadedPhoto[]> {
  const out: UploadedPhoto[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("image/")) continue;
    const previewUrl = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 800, h: 600 });
      img.src = previewUrl;
    });
    out.push({ id: uid(), previewUrl, file, width: dims.w, height: dims.h });
  }
  return out;
}

const RAIL: { id: Panel; label: string; icon: React.ReactNode }[] = [
  { id: "images", label: "รูปภาพ", icon: <path d="M2 4h16v12H2zM2 13l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" /> },
  { id: "templates", label: "เทมเพลต", icon: <><rect x="2" y="2" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /></> },
  { id: "layouts", label: "เลย์เอาต์", icon: <><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /></> },
  { id: "backgrounds", label: "พื้นหลัง", icon: <><rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M2 7h16M7 2v16" stroke="currentColor" strokeWidth="1.3" /></> },
  { id: "stickers", label: "สติกเกอร์", icon: <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M7 9h.01M13 9h.01M7 13s1 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
];

export default function Sidebar({ onArm }: { onArm?: () => void } = {}) {
  const activePanel = useEditorStore((s) => s.activePanel);
  const armedPhotoId = useEditorStore((s) => s.armedPhotoId);
  const armPhoto = useEditorStore((s) => s.armPhoto);
  const setPanel = useEditorStore((s) => s.setPanel);
  const photos = useEditorStore((s) => s.photos);
  const addPhotos = useEditorStore((s) => s.addPhotos);
  const usageCount = useEditorStore((s) => s.usageCount);
  const hideUsed = useEditorStore((s) => s.hideUsedPhotos);
  const setHideUsed = useEditorStore((s) => s.setHideUsed);
  const smartCreate = useEditorStore((s) => s.smartCreate);
  const autofill = useEditorStore((s) => s.autofill);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const setBackground = useEditorStore((s) => s.setBackground);
  const layout = useEditorStore((s) => s.layout);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const currentPage = layout.pages[layout.currentPageIndex];

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    setAddOpen(false);
    try {
      addPhotos(await processFiles(e.target.files));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const usedTotal = photos.filter((p) => usageCount(p.id) > 0).length;
  const shown = hideUsed ? photos.filter((p) => usageCount(p.id) === 0) : photos;

  return (
    <div className="flex h-full shrink-0">
      {/* Icon rail */}
      <div className="flex w-14 flex-col items-center gap-1 border-r border-neutral-200 bg-white py-3">
        {RAIL.map((r) => (
          <button
            key={r.id}
            onClick={() => setPanel(r.id)}
            className={`flex w-12 flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
              activePanel === r.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">{r.icon}</svg>
            <span className="text-[8px] font-medium leading-none">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="flex w-60 flex-col overflow-hidden border-r border-neutral-200 bg-white">
        {/* ── IMAGES ── */}
        {activePanel === "images" && (
          <>
            <div className="space-y-2 border-b border-neutral-100 p-3">
              <div className="relative">
                <button
                  onClick={() => setAddOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-500"
                >
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    เพิ่มรูปภาพ
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" className={addOpen ? "rotate-180" : ""}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {addOpen && (
                  <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
                    <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50">
                      📁 จากคอมพิวเตอร์
                    </button>
                  </div>
                )}
              </div>

              {/* Smart Creation */}
              <button
                onClick={smartCreate}
                disabled={photos.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-40"
              >
                ✨ สร้างอัตโนมัติ
              </button>

              {/* Autofill */}
              <button
                onClick={autofill}
                disabled={photos.length === 0}
                className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                เติมรูปอัตโนมัติ
              </button>
            </div>

            {/* Hide used */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
              <span className="text-[11px] text-neutral-500">{usedTotal} ใช้แล้ว / {photos.length} ทั้งหมด</span>
              <label className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                ซ่อนที่ใช้แล้ว
                <button
                  onClick={() => setHideUsed(!hideUsed)}
                  className={`relative h-4 w-8 rounded-full transition-colors ${hideUsed ? "bg-neutral-800" : "bg-neutral-200"}`}
                >
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${hideUsed ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-2">
              {uploading && <div className="py-6 text-center text-xs text-neutral-400">กำลังโหลด…</div>}
              {shown.length === 0 && !uploading && (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-xs text-neutral-300">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="3" y="7" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" /><circle cx="11" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 24l6-6 5 5 4-3 9 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  {photos.length === 0 ? "เพิ่มรูปภาพเพื่อเริ่มต้น" : "ไม่มีรูปที่ยังไม่ได้ใช้"}
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {shown.map((photo) => {
                  const uses = usageCount(photo.id);
                  return (
                    <button
                      key={photo.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("photoId", photo.id)}
                      onClick={() => {
                        const next = armedPhotoId === photo.id ? null : photo.id;
                        armPhoto(next);
                        if (next) onArm?.();
                      }}
                      className={`group relative cursor-grab overflow-hidden rounded-sm active:cursor-grabbing ${
                        armedPhotoId === photo.id ? "ring-2 ring-neutral-900 ring-offset-1" : ""
                      }`}
                      style={{ aspectRatio: "1" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.previewUrl} alt="" draggable={false} className="h-full w-full object-cover" />
                      {armedPhotoId === photo.id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/35 text-[10px] font-semibold text-white">
                          แตะหน้าเพื่อวาง
                        </span>
                      )}
                      {uses > 0 && (
                        <span className="absolute bottom-1 right-1 min-w-[16px] rounded-sm bg-neutral-900/70 px-1 text-center text-[9px] font-bold leading-4 text-white">
                          {uses}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── TEMPLATES / LAYOUTS ── */}
        {(activePanel === "templates" || activePanel === "layouts") && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 text-xs font-semibold text-neutral-600">
              {activePanel === "templates" ? "เทมเพลต" : "เลย์เอาต์"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => {
                const def = getTemplate(tmpl.id);
                const active = currentPage?.templateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => currentPage && applyTemplate(currentPage.id, tmpl.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-md border-2 p-2 transition-colors ${active ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}
                  >
                    <div className="relative w-full overflow-hidden rounded-sm bg-neutral-100" style={{ aspectRatio: "0.77" }}>
                      {def.slots.map((slot) => (
                        <div key={slot.id} className="absolute border border-neutral-200 bg-neutral-300" style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.width * 100}%`, height: `${slot.height * 100}%` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-neutral-600">{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BACKGROUNDS ── */}
        {activePanel === "backgrounds" && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-3 text-xs font-semibold text-neutral-600">พื้นหลังหน้านี้</div>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => currentPage && setBackground(currentPage.id, bg === "#ffffff" ? undefined : bg)}
                  className="aspect-square rounded-md border border-neutral-200 ring-offset-1 transition-transform hover:scale-105"
                  style={{ background: bg }}
                  title={bg}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STICKERS (placeholder) ── */}
        {activePanel === "stickers" && (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-neutral-400">
            <div>
              <div className="mb-2 text-2xl">🎉</div>
              สติกเกอร์เร็วๆ นี้
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
    </div>
  );
}
