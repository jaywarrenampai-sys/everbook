"use client";

import { useRef, useState } from "react";
import {
  ImageIcon,
  ImagePlus,
  Layout,
  LayoutGrid,
  Palette,
  Smile,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEditorStore, Panel } from "@/lib/store/editorStore";
import { UploadedPhoto } from "@/lib/editor/types";
import { TEMPLATES, getTemplate } from "@/lib/editor/templates";
import { uid } from "@/lib/uid";

// Solid background swatches for the Backgrounds panel
const BACKGROUNDS = [
  "#ffffff",
  "#F7F3EC",
  "#EDE4D6",
  "#F3D7CB",
  "#FBE8C9",
  "#D7EFE4",
  "#D6E6F2",
  "#6E7B5B",
  "#B4734E",
  "#2E2620",
];

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

const FUN_COLOR: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  peach: "bg-peach text-peach-foreground",
  mint: "bg-mint text-mint-foreground",
  sky: "bg-sky text-sky-foreground",
  butter: "bg-butter text-butter-foreground",
};

const RAIL: { id: Panel; label: string; icon: React.ReactNode; color: keyof typeof FUN_COLOR }[] = [
  { id: "images", label: "รูปภาพ", color: "peach", icon: <ImageIcon className="size-5" /> },
  { id: "templates", label: "เทมเพลต", color: "sky", icon: <LayoutGrid className="size-5" /> },
  { id: "layouts", label: "เลย์เอาต์", color: "mint", icon: <Layout className="size-5" /> },
  { id: "backgrounds", label: "พื้นหลัง", color: "butter", icon: <Palette className="size-5" /> },
  { id: "stickers", label: "สติกเกอร์", color: "peach", icon: <Smile className="size-5" /> },
];

function RailButton({
  icon,
  label,
  color,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: keyof typeof FUN_COLOR;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-transform hover:-translate-y-0.5 lg:w-full ${
        active ? "bg-secondary/50" : ""
      }`}
    >
      <span
        className={`inline-flex size-11 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 group-active:scale-95 ${FUN_COLOR[color]} ${
          active ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-card" : ""
        }`}
      >
        {icon}
      </span>
      <span className={`text-[11px] font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

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

  const currentPage = layout.pages[layout.currentPageIndex];

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploading(true);
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
    <div className="flex h-full shrink-0 gap-2 p-2">
      {/* Icon rail */}
      <div className="flex flex-col gap-2 rounded-3xl border-2 border-border bg-card p-2 shadow-sm">
        {RAIL.map((r) => (
          <RailButton
            key={r.id}
            icon={r.icon}
            label={r.label}
            color={r.color}
            active={activePanel === r.id}
            onClick={() => setPanel(r.id)}
          />
        ))}
      </div>

      {/* Panel */}
      <div className="flex w-64 flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-sm">
        {/* ── IMAGES ── */}
        {activePanel === "images" && (
          <>
            <div className="space-y-2.5 border-b border-border/60 p-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Upload className="size-4" />
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={smartCreate}
                  disabled={photos.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-sky px-3 py-2.5 text-xs font-bold text-sky-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <Sparkles className="size-3.5" />
                  สร้างอัตโนมัติ
                </button>
                <button
                  onClick={autofill}
                  disabled={photos.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-mint px-3 py-2.5 text-xs font-bold text-mint-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <ImagePlus className="size-3.5" />
                  เติมรูปอัตโนมัติ
                </button>
              </div>

              {/* Hide used */}
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  <span className="font-bold text-foreground">{usedTotal}</span> ใช้แล้ว /{" "}
                  <span className="font-bold text-foreground">{photos.length}</span> ทั้งหมด
                </span>
                <button
                  onClick={() => setHideUsed(!hideUsed)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition-colors ${
                    hideUsed ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`size-2 rounded-full ${hideUsed ? "bg-primary" : "bg-muted-foreground/50"}`} />
                  ซ่อนที่ใช้แล้ว
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {uploading && <div className="py-6 text-center text-xs text-muted-foreground">กำลังโหลด…</div>}
              {shown.length === 0 && !uploading && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-center text-muted-foreground">
                  <ImageIcon className="size-7 opacity-50" />
                  <p className="text-sm font-medium">
                    {photos.length === 0 ? "เพิ่มรูปภาพเพื่อเริ่มต้น" : "ไม่มีรูปที่ยังไม่ได้ใช้"}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
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
                      className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border-2 transition-transform hover:-translate-y-0.5 active:cursor-grabbing ${
                        armedPhotoId === photo.id ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                      title="คลิกเพื่อวางในหน้าปัจจุบัน"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.previewUrl} alt="" draggable={false} className="size-full object-cover" />
                      {armedPhotoId === photo.id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-foreground/35 text-[10px] font-semibold text-background">
                          แตะหน้าเพื่อวาง
                        </span>
                      )}
                      {uses > 0 && (
                        <span className="absolute right-1 top-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
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
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 font-heading text-base font-bold text-foreground">
              {activePanel === "templates" ? "เทมเพลต" : "เลย์เอาต์"}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const def = getTemplate(tmpl.id);
                const active = currentPage?.templateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => currentPage && applyTemplate(currentPage.id, tmpl.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all hover:-translate-y-0.5 ${
                      active ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted" style={{ aspectRatio: "0.77" }}>
                      {def.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="absolute rounded bg-primary/30"
                          style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.width * 100}%`, height: `${slot.height * 100}%` }}
                        />
                      ))}
                    </div>
                    <span className="text-center text-xs font-semibold text-foreground">{tmpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BACKGROUNDS ── */}
        {activePanel === "backgrounds" && (
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 font-heading text-base font-bold text-foreground">พื้นหลังหน้านี้</h2>
            <div className="grid grid-cols-5 gap-2.5">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => currentPage && setBackground(currentPage.id, bg === "#ffffff" ? undefined : bg)}
                  className={`aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                    currentPage?.background === bg ? "border-foreground" : "border-border"
                  }`}
                  style={{ background: bg }}
                  title={bg}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STICKERS (placeholder) ── */}
        {activePanel === "stickers" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="text-4xl">🎉</span>
            <p className="font-heading text-base font-bold text-foreground">สติกเกอร์เร็วๆ นี้</p>
            <p className="text-sm text-muted-foreground">เรากำลังเตรียมสติกเกอร์น่ารักๆ ให้คุณ</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFiles}
        style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
