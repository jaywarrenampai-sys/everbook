"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  History,
  Printer,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";
import { useEditorStore } from "@/lib/store/editorStore";

interface Props {
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onOrder: () => void;
}

const FUN_COLOR: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  mint: "bg-mint text-mint-foreground",
  sky: "bg-sky text-sky-foreground",
  butter: "bg-butter text-butter-foreground",
};

function FunButton({
  children,
  icon,
  color = "primary",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: keyof typeof FUN_COLOR;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 ${FUN_COLOR[color]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function IconChip({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`inline-flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground"
      }`}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default function TopBar({ onBack, onSave, onPreview, onOrder }: Props) {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const saveState = useEditorStore((s) => s.saveState);
  const title = useEditorStore((s) => s.projectTitle);
  const layout = useEditorStore((s) => s.layout);

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 py-3">
        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform hover:-translate-y-0.5"
          title="กลับหน้าแรก"
          aria-label="กลับหน้าแรก"
        >
          <ArrowLeft className="size-5" />
        </button>

        <span className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block max-w-[140px] truncate font-heading text-base font-extrabold text-foreground">
              {title || "หนังสือของฉัน"}
            </span>
            <span className="block text-xs font-medium text-muted-foreground">
              {layout.pages.length} หน้า
            </span>
          </span>
        </span>

        <span className="mx-1 hidden h-8 w-px bg-border sm:block" />

        {/* Undo / Redo / History */}
        <IconChip label="ย้อนกลับ" onClick={undo} disabled={past.length === 0} icon={<Undo2 className="size-4" />} />
        <IconChip label="ทำซ้ำ" onClick={redo} disabled={future.length === 0} icon={<Redo2 className="size-4" />} />
        <div className="relative">
          <IconChip label="ประวัติ" active={historyOpen} onClick={() => setHistoryOpen((v) => !v)} icon={<History className="size-4" />} />
          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border-2 border-border bg-card p-3 text-sm shadow-lg"
              >
                <p className="mb-1 font-semibold text-foreground">ประวัติการแก้ไข</p>
                <p className="text-muted-foreground">
                  ย้อนกลับได้ {past.length} ขั้น · ทำซ้ำได้ {future.length} ขั้น
                </p>
                <div className="mt-2 flex gap-2 border-t border-border/60 pt-2">
                  <button
                    onClick={() => undo()}
                    disabled={past.length === 0}
                    className="flex-1 rounded-full bg-muted py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={() => redo()}
                    disabled={future.length === 0}
                    className="flex-1 rounded-full bg-muted py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    ทำซ้ำ
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save / Preview / Order */}
        <FunButton color="mint" icon={<Save className="size-4" />} onClick={onSave} className="hidden sm:inline-flex">
          {saveState === "saving" ? "กำลังบันทึก…" : saveState === "saved" ? "บันทึกแล้ว ✓" : "บันทึก"}
        </FunButton>
        <FunButton color="sky" icon={<Eye className="size-4" />} onClick={onPreview}>
          ดูตัวอย่าง
        </FunButton>
        <FunButton color="primary" icon={<Printer className="size-4" />} onClick={onOrder} className="hidden sm:inline-flex">
          สั่งพิมพ์
        </FunButton>
      </div>
    </header>
  );
}
