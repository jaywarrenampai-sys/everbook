"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store/editorStore";
import {
  loadProject,
  saveProject,
  getLastProject,
  setLastProject,
} from "@/lib/projects/localProjects";
import { makeCoverThumbnail } from "@/lib/projects/thumbnail";
import { uid } from "@/lib/uid";
import TopBar from "@/components/editor2/TopBar";
import Sidebar from "@/components/editor2/Sidebar";
import PageGrid from "@/components/editor2/PageGrid";
import SingleSpreadView from "@/components/editor2/SingleSpreadView";
import BottomBar from "@/components/editor2/BottomBar";
import SaveModal from "@/components/editor/SaveModal";

export default function EditorClient() {
  const router = useRouter();

  const viewMode = useEditorStore((s) => s.viewMode);
  const layout = useEditorStore((s) => s.layout);
  const photos = useEditorStore((s) => s.photos);
  const projectId = useEditorStore((s) => s.projectId);
  const projectTitle = useEditorStore((s) => s.projectTitle);
  const setProject = useEditorStore((s) => s.setProject);
  const setSaveState = useEditorStore((s) => s.setSaveState);
  const loadDocument = useEditorStore((s) => s.loadDocument);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const removeSelected = useEditorStore((s) => s.removeSelected);

  const [showSave, setShowSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileTools, setMobileTools] = useState(false);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Save the current document to local storage (autosave + manual) ──
  const saveNow = useCallback(
    async (nameOverride?: string) => {
      const s = useEditorStore.getState();
      if (!s.projectId) return;
      setSaveState("saving");
      try {
        const cover = await makeCoverThumbnail(s.layout, s.photos);
        await saveProject({
          id: s.projectId,
          name: nameOverride ?? s.projectTitle,
          layout: s.layout,
          photos: s.photos,
          cover,
        });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [setSaveState]
  );

  // ── Load on mount: ?projectId → that project; else recover last; else new ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("projectId");
      const isNew = params.get("new");
      let targetId = pid || (!isNew ? getLastProject() : null);

      if (targetId) {
        try {
          const loaded = await loadProject(targetId);
          if (!cancelled && loaded) {
            loadDocument(loaded.layout, loaded.photos);
            setProject(loaded.id, loaded.name);
            setLastProject(loaded.id);
            return;
          }
        } catch {
          /* fall through to new */
        }
      }
      // Fresh project — assign an id so autosave has a target.
      if (!cancelled) {
        const newId = uid();
        setProject(newId, useEditorStore.getState().projectTitle);
        setLastProject(newId);
      }
    })();
    return () => {
      cancelled = true;
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autosave: debounced on every change (covers photo/template/sticker/text/bg) ──
  useEffect(() => {
    const t = setTimeout(() => saveNow(), 1200);
    return () => clearTimeout(t);
  }, [layout, photos, projectTitle, saveNow]);

  // ── Autosave: heartbeat every 30s ──
  useEffect(() => {
    const i = setInterval(() => saveNow(), 30000);
    return () => clearInterval(i);
  }, [saveNow]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (e.key === "Delete" || e.key === "Backspace") { removeSelected(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, removeSelected]);

  async function handleSave(title: string) {
    setIsSaving(true);
    setProject(projectId, title);
    await saveNow(title);
    setShowSave(false);
    setIsSaving(false);
    flash("บันทึกแล้ว ✓");
  }

  function goToOrder() {
    const params = new URLSearchParams({ ...(projectId ? { projectId } : {}), pages: String(layout.pages.length) });
    router.push(`/checkout?${params.toString()}`);
  }

  function goToPreview() {
    const params = new URLSearchParams({ ...(projectId ? { projectId } : {}), pages: String(layout.pages.length) });
    router.push(`/preview?${params.toString()}`);
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <TopBar
        onBack={() => router.push("/projects")}
        onSave={() => setShowSave(true)}
        onPreview={goToPreview}
        onOrder={goToOrder}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar (static) */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Canvas */}
        {viewMode === "grid" ? <PageGrid /> : <SingleSpreadView />}

        {/* Mobile sidebar drawer */}
        {mobileTools && (
          <>
            <div className="absolute inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileTools(false)} />
            <div className="absolute inset-y-0 left-0 z-40 shadow-2xl md:hidden">
              <Sidebar onArm={() => setMobileTools(false)} />
            </div>
          </>
        )}

        {/* Mobile tools button */}
        <button
          onClick={() => setMobileTools((v) => !v)}
          className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          เครื่องมือ
        </button>
      </div>

      <BottomBar />

      {showSave && (
        <SaveModal
          defaultTitle={projectTitle}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => setShowSave(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
