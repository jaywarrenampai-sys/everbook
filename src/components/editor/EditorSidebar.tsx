"use client";

import { useRef, useState } from "react";
import { BookLayout, UploadedPhoto } from "@/lib/editor/types";
import { getTemplate } from "@/lib/editor/templates";
import { uid } from "@/lib/uid";

type Tab = "images" | "templates" | "layouts" | "backgrounds";

interface Props {
  tab:            Tab;
  onTabChange:    (t: Tab) => void;
  photos:         UploadedPhoto[];
  layout:         BookLayout;
  onAddPhotos:    (photos: UploadedPhoto[]) => void;
  onSelectTemplate: (templateId: string) => void;
  currentTemplateId: string;
}

// ── Photo usage counter ───────────────────────────────────────────────────────
function countUsage(photoId: string, layout: BookLayout): number {
  let n = 0;
  for (const page of layout.pages) {
    n += Object.values(page.slotFills).filter((id) => id === photoId).length;
    n += page.placements.filter((p) => p.photoId === photoId).length;
  }
  return n;
}

// ── Process uploaded files → UploadedPhoto ────────────────────────────────────
async function processFiles(files: FileList): Promise<UploadedPhoto[]> {
  const results: UploadedPhoto[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("image/")) continue;
    const previewUrl = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 800, h: 600 });
      img.src = previewUrl;
    });
    results.push({
      id:         uid(),
      previewUrl,
      file,
      width:      dims.w,
      height:     dims.h,
    });
  }
  return results;
}

// ── Template shapes (CSS-only previews) ──────────────────────────────────────
const TEMPLATES = [
  { id: "full",         label: "เต็มหน้า" },
  { id: "two-v",        label: "2 แนวตั้ง" },
  { id: "two-h",        label: "2 แนวนอน" },
  { id: "four-grid",    label: "4 รูป"    },
  { id: "feature-left", label: "รูปเด่น"  },
  { id: "blank",        label: "ว่างเปล่า" },
];

// ── Layout options ────────────────────────────────────────────────────────────
const LAYOUTS = TEMPLATES; // reuse for now

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  {
    id: "images",
    label: "Images",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="7" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M3 15l4-4 3 3 2-2 5 3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Templates",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "layouts",
    label: "Layouts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "backgrounds",
    label: "Backgrounds",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 7h16M7 2v16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function EditorSidebar({
  tab,
  onTabChange,
  photos,
  layout,
  onAddPhotos,
  onSelectTemplate,
  currentTemplateId,
}: Props) {
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [hideUsed, setHideUsed] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
    setAddMenuOpen(false);
    try {
      const processed = await processFiles(e.target.files);
      onAddPhotos(processed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const usedCount  = photos.filter((p) => countUsage(p.id, layout) > 0).length;
  const shownPhotos = hideUsed
    ? photos.filter((p) => countUsage(p.id, layout) === 0)
    : photos;

  return (
    <div className="flex h-full shrink-0">
      {/* ── Icon strip ─────────────────────────────────────────────────────── */}
      <div className="w-14 bg-white border-r border-neutral-200 flex flex-col items-center py-3 gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex flex-col items-center gap-1 w-12 py-2 rounded-lg transition-colors ${
              tab === t.id
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {t.icon}
            <span className="text-[8px] font-medium leading-none">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      <div className="w-60 bg-white border-r border-neutral-200 flex flex-col overflow-hidden">

        {/* ── IMAGES panel ─────────────────────────────────────────────────── */}
        {tab === "images" && (
          <>
            {/* Add photos button */}
            <div className="p-3 border-b border-neutral-100 space-y-2">
              <div className="relative">
                <button
                  onClick={() => setAddMenuOpen((v) => !v)}
                  className="w-full flex items-center justify-between border border-neutral-300 hover:border-neutral-500 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Add more photos
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${addMenuOpen ? "rotate-180" : ""}`}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {addMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      จากคอมพิวเตอร์
                    </button>
                  </div>
                )}
              </div>

              {/* Autofill (stub) */}
              <button
                className="w-full border border-neutral-200 rounded-md px-3 py-1.5 text-sm text-neutral-400 cursor-not-allowed"
                disabled
              >
                Autofill
              </button>
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium">Thumbs</span>
              <div className="w-px h-3 bg-neutral-200" />
              <span className="text-[11px] text-neutral-400">Sort</span>
              <div className="flex-1" />
              {/* Hide used toggle */}
              <span className="text-[10px] text-neutral-400">Hide used</span>
              <button
                onClick={() => setHideUsed((v) => !v)}
                className={`relative w-8 h-4 rounded-full transition-colors ${hideUsed ? "bg-neutral-800" : "bg-neutral-200"}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${hideUsed ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Count */}
            <div className="px-3 py-1.5 text-[11px] text-neutral-500 border-b border-neutral-100">
              {usedCount} used photos / {photos.length} all
            </div>

            {/* Photo grid */}
            <div className="flex-1 overflow-y-auto p-2">
              {uploading && (
                <div className="flex items-center justify-center py-6 text-neutral-400 text-xs">
                  กำลังโหลด…
                </div>
              )}

              {shownPhotos.length === 0 && !uploading && (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-300 text-xs text-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="3" y="7" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="11" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 24l6-6 5 5 4-3 9 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  {photos.length === 0 ? "เพิ่มรูปภาพเพื่อเริ่มต้น" : "ไม่มีรูปที่ยังไม่ได้ใช้"}
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {shownPhotos.map((photo) => {
                  const uses = countUsage(photo.id, layout);
                  return (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("photoId", photo.id)}
                      className="relative cursor-grab active:cursor-grabbing group rounded-sm overflow-hidden"
                      style={{ aspectRatio: "1" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      {/* Usage badge */}
                      {uses > 0 && (
                        <span className="absolute bottom-1 right-1 bg-neutral-900/70 text-white text-[9px] font-bold rounded-sm px-1 min-w-[16px] text-center leading-4">
                          {uses}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── TEMPLATES panel ──────────────────────────────────────────────── */}
        {tab === "templates" && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pt-3 pb-2 text-xs font-semibold text-neutral-600 border-b border-neutral-100">
              Templates:
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => {
                const tDef   = getTemplate(tmpl.id);
                const isActive = currentTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onSelectTemplate(tmpl.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-md border-2 transition-colors ${
                      isActive ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {/* Mini template preview */}
                    <div className="w-full bg-neutral-100 rounded-sm overflow-hidden" style={{ aspectRatio: "0.707" }}>
                      <div className="relative w-full h-full">
                        {tDef.slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="absolute bg-neutral-300 border border-neutral-200"
                            style={{
                              left:   `${slot.x * 100}%`,
                              top:    `${slot.y * 100}%`,
                              width:  `${slot.width * 100}%`,
                              height: `${slot.height * 100}%`,
                            }}
                          />
                        ))}
                        {tDef.slots.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                            <span className="text-[8px]">ว่าง</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-600 font-medium">{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LAYOUTS panel ────────────────────────────────────────────────── */}
        {tab === "layouts" && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs font-semibold text-neutral-600 mb-3">Layouts:</div>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onSelectTemplate(l.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md border-2 transition-colors ${
                    currentTemplateId === l.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="w-full bg-neutral-100 rounded-sm" style={{ aspectRatio: "0.707", height: 50 }} />
                  <span className="text-[10px] text-neutral-500">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── BACKGROUNDS panel ────────────────────────────────────────────── */}
        {tab === "backgrounds" && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-neutral-400 text-xs">
              <div className="text-2xl mb-2">🎨</div>
              เร็วๆ นี้
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
