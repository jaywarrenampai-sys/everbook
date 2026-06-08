"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, Pencil, Trash2, BookOpen } from "lucide-react";
import {
  listProjects,
  duplicateProject,
  renameProject,
  deleteProject,
  ProjectSummary,
} from "@/lib/projects/localProjects";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "เมื่อสักครู่";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h / 24);
  return `${d} วันที่แล้ว`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onDuplicate(id: string) {
    await duplicateProject(id);
    refresh();
  }
  async function onRename(id: string, current: string) {
    const name = window.prompt("เปลี่ยนชื่อหนังสือ", current);
    if (name && name.trim()) {
      await renameProject(id, name.trim());
      refresh();
    }
  }
  async function onDelete(id: string, name: string) {
    if (window.confirm(`ลบ "${name}" ? การลบไม่สามารถย้อนกลับได้`)) {
      await deleteProject(id);
      refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="font-heading text-xl font-extrabold text-foreground">หนังสือของฉัน</span>
          </Link>
          <Link
            href="/editor?new=1"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            สร้างหนังสือใหม่
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {projects === null ? (
          <p className="py-20 text-center text-muted-foreground">กำลังโหลด…</p>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card py-20 text-center">
            <span className="text-5xl">📖</span>
            <p className="font-heading text-lg font-bold text-foreground">ยังไม่มีหนังสือ</p>
            <p className="text-sm text-muted-foreground">เริ่มสร้างหนังสือภาพเล่มแรกของคุณ</p>
            <Link
              href="/editor?new=1"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Plus className="size-4" />
              สร้างหนังสือใหม่
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((p) => (
              <div key={p.id} className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-sm">
                <button
                  onClick={() => router.push(`/editor?projectId=${p.id}`)}
                  className="relative block w-full overflow-hidden bg-muted"
                  style={{ aspectRatio: "210 / 297" }}
                  title="เปิด"
                >
                  {p.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover} alt={p.name} className="size-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-4xl">📕</span>
                  )}
                </button>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-1 font-heading text-sm font-bold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.pageCount} หน้า · {timeAgo(p.updatedAt)}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      onClick={() => router.push(`/editor?projectId=${p.id}`)}
                      className="flex-1 rounded-full bg-primary px-2 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                    >
                      เปิด
                    </button>
                    <button onClick={() => onDuplicate(p.id)} title="ทำสำเนา" className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-secondary">
                      <Copy className="size-3.5" />
                    </button>
                    <button onClick={() => onRename(p.id, p.name)} title="เปลี่ยนชื่อ" className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-secondary">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => onDelete(p.id, p.name)} title="ลบ" className="inline-flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
