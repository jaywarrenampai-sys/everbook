"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookImage,
  ImageIcon,
  ImagePlus,
  Layout,
  LayoutGrid,
  Palette,
  Search,
  Smile,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEditorStore, Panel } from "@/lib/store/editorStore";
import { UploadedPhoto } from "@/lib/editor/types";
import { TEMPLATES, getTemplate } from "@/lib/editor/templates";
import { COVER_CATEGORIES, COVER_TEMPLATES } from "@/lib/editor/coverTemplates";
import { uid } from "@/lib/uid";

// ── Library types (from the auto-discovery APIs) ──
interface LibCategory { id: string; label: string; emoji: string; count: number }
interface LibItem { id: string; category: string; name: string; src: string }

// 10 pastel solid colours for the "Solid Colors" background tab (not files)
const SOLID_COLORS = [
  "#ffffff", "#fce4ec", "#f8d7e3", "#ffe3c2", "#fff3bf",
  "#e6fcf5", "#d3f9d8", "#d0ebff", "#e5dbff", "#ffe8cc",
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
  { id: "covers", label: "ปก", color: "sky", icon: <BookImage className="size-5" /> },
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
  const applyCoverTemplate = useEditorStore((s) => s.applyCoverTemplate);
  const setBackground = useEditorStore((s) => s.setBackground);
  const setBackgroundAll = useEditorStore((s) => s.setBackgroundAll);
  const addSticker = useEditorStore((s) => s.addSticker);
  const goToPage = useEditorStore((s) => s.goToPage);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const layout = useEditorStore((s) => s.layout);

  const fileRef = useRef<HTMLInputElement>(null);
  const catScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startLeft: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  // ── Sticker library (lazy / category loading) ──
  const [stickerCats, setStickerCats] = useState<LibCategory[]>([]);
  const [stickerCat, setStickerCat] = useState<string>("");
  const [itemsByCat, setItemsByCat] = useState<Record<string, LibItem[]>>({});
  const [stickerQuery, setStickerQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LibItem[] | null>(null);
  const [stickersLoading, setStickersLoading] = useState(false);

  // ── Background library (lazy) ──
  const [bgCats, setBgCats] = useState<LibCategory[]>([]);
  const [bgCat, setBgCat] = useState<string>("solid-colors");
  const [bgByCat, setBgByCat] = useState<Record<string, LibItem[]>>({});
  const [bgQuery, setBgQuery] = useState("");
  const [bgResults, setBgResults] = useState<LibItem[] | null>(null);
  const [bgLoading, setBgLoading] = useState(false);
  const [bgScope, setBgScope] = useState<"current" | "all">("current");

  // ── Cover template picker ──
  const [coverCat, setCoverCat] = useState<string>("family");

  // Load category list once, the first time the Stickers panel is opened.
  useEffect(() => {
    if (activePanel !== "stickers" || stickerCats.length > 0) return;
    fetch("/api/stickers")
      .then((r) => r.json())
      .then((d: { categories: LibCategory[] }) => {
        setStickerCats(d.categories ?? []);
        if (d.categories?.[0]) setStickerCat((c) => c || d.categories[0].id);
      })
      .catch(() => {});
  }, [activePanel, stickerCats.length]);

  // Lazily load the active category's stickers (cached after first fetch).
  useEffect(() => {
    if (activePanel !== "stickers" || !stickerCat || itemsByCat[stickerCat]) return;
    setStickersLoading(true);
    fetch(`/api/stickers/${stickerCat}`)
      .then((r) => r.json())
      .then((d: { stickers: LibItem[] }) =>
        setItemsByCat((m) => ({ ...m, [stickerCat]: d.stickers ?? [] }))
      )
      .catch(() => {})
      .finally(() => setStickersLoading(false));
  }, [activePanel, stickerCat, itemsByCat]);

  // Debounced cross-category sticker search.
  useEffect(() => {
    const q = stickerQuery.trim();
    if (!q) { setSearchResults(null); return; }
    const t = setTimeout(() => {
      setStickersLoading(true);
      fetch(`/api/stickers?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: { stickers: LibItem[] }) => setSearchResults(d.stickers ?? []))
        .catch(() => setSearchResults([]))
        .finally(() => setStickersLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [stickerQuery]);

  // Load background category list once when the Backgrounds panel opens.
  useEffect(() => {
    if (activePanel !== "backgrounds" || bgCats.length > 0) return;
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((d: { categories: LibCategory[] }) => setBgCats(d.categories ?? []))
      .catch(() => {});
  }, [activePanel, bgCats.length]);

  // Lazily load the active background category (skip the special solid-colors).
  useEffect(() => {
    if (activePanel !== "backgrounds" || bgCat === "solid-colors" || bgByCat[bgCat]) return;
    setBgLoading(true);
    fetch(`/api/backgrounds/${bgCat}`)
      .then((r) => r.json())
      .then((d: { backgrounds: LibItem[] }) => setBgByCat((m) => ({ ...m, [bgCat]: d.backgrounds ?? [] })))
      .catch(() => {})
      .finally(() => setBgLoading(false));
  }, [activePanel, bgCat, bgByCat]);

  // Debounced background search.
  useEffect(() => {
    const q = bgQuery.trim();
    if (!q) { setBgResults(null); return; }
    const t = setTimeout(() => {
      setBgLoading(true);
      fetch(`/api/backgrounds?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: { backgrounds: LibItem[] }) => setBgResults(d.backgrounds ?? []))
        .catch(() => setBgResults([]))
        .finally(() => setBgLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [bgQuery]);

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

  // Desktop: translate vertical mouse-wheel into horizontal scroll on the
  // category bar. Uses a native non-passive listener so preventDefault works.
  // Touch devices never fire `wheel`, so mobile swipe scrolling is untouched.
  useEffect(() => {
    const el = catScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return; // nothing to scroll
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activePanel, stickerCats.length, stickerQuery]);

  // Stickers shown: search results take precedence, else the active category.
  const shownStickers: LibItem[] = searchResults ?? itemsByCat[stickerCat] ?? [];

  function placeSticker(st: LibItem) {
    if (!currentPage) return;
    addSticker(currentPage.id, st.id, st.category, st.src); // centred on current page
    onArm?.();
  }

  // Apply a background (hex colour or image src) to current page or all pages.
  function applyBackground(value?: string) {
    if (bgScope === "all") setBackgroundAll(value);
    else if (currentPage) setBackground(currentPage.id, value);
  }

  // Apply a cover design to the cover page (page 0 / isCover) and jump to it.
  function applyCover(coverId: string) {
    const coverIdx = layout.pages.findIndex((p) => p.isCover);
    const idx = coverIdx >= 0 ? coverIdx : 0;
    const coverPage = layout.pages[idx];
    if (!coverPage) return;
    applyCoverTemplate(coverPage.id, coverId);
    goToPage(idx);
    setViewMode("single");
    onArm?.();
  }
  const shownCovers = COVER_TEMPLATES.filter((c) => c.category === coverCat);

  // Tabs for the background panel: Solid Colors (special) + discovered file cats.
  const bgTabs: LibCategory[] = [
    { id: "solid-colors", label: "Solid Colors", emoji: "🎨", count: SOLID_COLORS.length },
    ...bgCats.filter((c) => c.id !== "solid-colors"),
  ];
  const shownBackgrounds: LibItem[] = bgResults ?? bgByCat[bgCat] ?? [];

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
                    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted" style={{ aspectRatio: "210 / 297" }}>
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

        {/* ── COVER TEMPLATES ── */}
        {activePanel === "covers" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-border/60 p-3">
              <h2 className="font-heading text-base font-bold text-foreground">ปกหนังสือ</h2>
              <p className="text-xs text-muted-foreground">เลือกดีไซน์ปก — รูป ข้อความ สติกเกอร์ และพื้นหลังจะถูกเก็บไว้</p>
            </div>

            {/* Category chips */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border/60 p-3">
              {COVER_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCoverCat(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    coverCat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {/* Design grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2.5">
                {shownCovers.map((def) => {
                  const slots = getTemplate(def.templateId).slots;
                  const isImg = !!def.background && def.background.startsWith("/");
                  const active = currentPage?.coverTemplateId === def.id;
                  return (
                    <button
                      key={def.id}
                      onClick={() => applyCover(def.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition-all hover:-translate-y-0.5 ${
                        active ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-lg border border-border"
                        style={{ aspectRatio: "210 / 297", background: !def.background ? "#e7e2d8" : isImg ? "#e7e2d8" : def.background }}
                      >
                        {isImg && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={def.background} alt="" className="absolute inset-0 size-full object-cover" />
                        )}
                        {slots.map((slot, i) => (
                          <div
                            key={i}
                            className="absolute bg-primary/25"
                            style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.width * 100}%`, height: `${slot.height * 100}%` }}
                          />
                        ))}
                        {/* title indicator */}
                        <div className="absolute inset-x-2 bottom-3 h-1.5 rounded bg-foreground/35" />
                        <div className="absolute inset-x-5 bottom-1.5 h-1 rounded bg-foreground/20" />
                      </div>
                      <span className="text-center text-xs font-semibold text-foreground">{def.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── BACKGROUNDS LIBRARY ── */}
        {activePanel === "backgrounds" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search */}
            <div className="border-b border-border/60 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={bgQuery}
                  onChange={(e) => setBgQuery(e.target.value)}
                  placeholder="ค้นหาพื้นหลัง…"
                  className="w-full rounded-2xl border-2 border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Apply scope toggle */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">ใช้กับ</span>
              <div className="inline-flex rounded-full border-2 border-border bg-card p-0.5">
                <button
                  onClick={() => setBgScope("current")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${bgScope === "current" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  หน้านี้
                </button>
                <button
                  onClick={() => setBgScope("all")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${bgScope === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  ทุกหน้า
                </button>
              </div>
            </div>

            {/* Category chips (hidden while searching) */}
            {!bgQuery.trim() && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border/60 p-3">
                {bgTabs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setBgCat(c.id)}
                    title={c.label}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      bgCat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Solid colours tab */}
              {!bgQuery.trim() && bgCat === "solid-colors" ? (
                <div className="grid grid-cols-5 gap-2.5">
                  {SOLID_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => applyBackground(c === "#ffffff" ? undefined : c)}
                      className={`aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                        currentPage?.background === c ? "border-foreground" : "border-border"
                      }`}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              ) : bgLoading && shownBackgrounds.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">กำลังโหลด…</div>
              ) : shownBackgrounds.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-center text-muted-foreground">
                  <span className="text-2xl">🖼️</span>
                  <p className="text-sm font-medium">{bgQuery.trim() ? "ไม่พบพื้นหลัง" : "ยังไม่มีพื้นหลังในหมวดนี้"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {shownBackgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => applyBackground(bg.src)}
                      className={`overflow-hidden rounded-xl border-2 transition-transform hover:-translate-y-0.5 ${
                        currentPage?.background === bg.src ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                      style={{ aspectRatio: "210 / 297" }}
                      title={bg.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bg.src} alt={bg.name} loading="lazy" draggable={false} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STICKERS ── */}
        {activePanel === "stickers" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search */}
            <div className="border-b border-border/60 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={stickerQuery}
                  onChange={(e) => setStickerQuery(e.target.value)}
                  placeholder="ค้นหาสติกเกอร์…"
                  className="w-full rounded-2xl border-2 border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Category chips (hidden while searching) */}
            {!stickerQuery.trim() && (
              <div
                ref={catScrollRef}
                onPointerDown={(e) => {
                  if (e.pointerType !== "mouse") return; // mouse-drag only; keep touch native
                  dragRef.current = { startX: e.clientX, startLeft: e.currentTarget.scrollLeft };
                }}
                onPointerMove={(e) => {
                  if (!dragRef.current) return;
                  e.currentTarget.scrollLeft = dragRef.current.startLeft - (e.clientX - dragRef.current.startX);
                }}
                onPointerUp={() => { dragRef.current = null; }}
                onPointerLeave={() => { dragRef.current = null; }}
                className="flex cursor-grab gap-1.5 overflow-x-auto border-b border-border/60 p-3 active:cursor-grabbing [scrollbar-width:thin]"
              >
                {stickerCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setStickerCat(c.id)}
                    title={c.label}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      stickerCat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sticker grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {stickersLoading && shownStickers.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">กำลังโหลด…</div>
              ) : shownStickers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-center text-muted-foreground">
                  <span className="text-2xl">🔍</span>
                  <p className="text-sm font-medium">
                    {stickerQuery.trim() ? "ไม่พบสติกเกอร์" : "ยังไม่มีสติกเกอร์ในหมวดนี้"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {shownStickers.map((st) => (
                    <button
                      key={st.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("stickerId", st.id);
                        e.dataTransfer.setData("stickerSrc", st.src);
                        e.dataTransfer.setData("stickerCategory", st.category);
                      }}
                      onClick={() => placeSticker(st)}
                      className="group aspect-square cursor-grab rounded-xl border-2 border-border bg-background p-1.5 transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
                      title="คลิกหรือลากเพื่อวางบนหน้า"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={st.src} alt={st.name} loading="lazy" draggable={false} className="size-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
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
