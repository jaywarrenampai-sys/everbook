"use client";

/**
 * Mobile bottom sheet — slides up from the bottom. Mounted only when `open`
 * (children render lazily for performance). Mobile-only (md:hidden).
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  height = "78vh",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl border-t-2 border-border bg-background shadow-2xl"
        style={{ maxHeight: height, animation: "ev-slide-up .22s ease-out" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
        <div className="flex shrink-0 items-center justify-between px-4 py-2">
          <span className="font-heading text-base font-bold text-foreground">{title}</span>
          <button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-lg text-foreground" aria-label="ปิด">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
      <style>{`@keyframes ev-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  );
}
