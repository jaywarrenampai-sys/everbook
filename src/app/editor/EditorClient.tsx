"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/store/editorStore";
import { saveProject, SerializedPhoto } from "@/lib/supabase/projects";
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
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const removeSelected = useEditorStore((s) => s.removeSelected);

  const [serialized, setSerialized] = useState<SerializedPhoto[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileTools, setMobileTools] = useState(false);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

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
    setSaveState("saving");
    try {
      const { projectId: pid, serializedPhotos } = await saveProject(projectId, title, layout, photos, serialized);
      setProject(pid, title);
      setSerialized(serializedPhotos);
      setSaveState("saved");
      setShowSave(false);
      flash("บันทึกสำเร็จ ✓");
    } catch (err) {
      setSaveState("error");
      flash(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
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
        onBack={() => router.push("/")}
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
