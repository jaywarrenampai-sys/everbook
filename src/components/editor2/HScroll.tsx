"use client";

import { useEffect, useRef } from "react";

/**
 * Reusable horizontal scroll row for category bars.
 * Desktop: mouse wheel (deltaY → scrollLeft), shift+wheel, click-and-drag,
 * and a subtle thin scrollbar. Auto-scrolls the active chip into view when
 * `activeKey` changes. Mobile: native swipe/touch scrolling is untouched
 * (wheel never fires on touch; drag is mouse-only).
 */
export default function HScroll({
  children,
  className = "",
  activeKey,
}: {
  children: React.ReactNode;
  className?: string;
  activeKey?: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  // Wheel → horizontal (non-passive so preventDefault works).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return; // nothing to scroll
      if (e.deltaY === 0 && e.deltaX !== 0) return; // let native horizontal pass
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Auto-scroll the active chip into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[data-active="true"]');
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeKey]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") return; // keep touch native
        drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerLeave={() => { drag.current = null; }}
      className={`flex cursor-grab gap-1.5 overflow-x-auto active:cursor-grabbing [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border ${className}`}
    >
      {children}
    </div>
  );
}
