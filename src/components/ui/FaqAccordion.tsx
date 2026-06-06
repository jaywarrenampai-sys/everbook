"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-stone-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-5 text-left group"
          >
            <span className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">
              {item.q}
            </span>
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                open === i
                  ? "bg-amber-700 text-white rotate-45"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="pb-5 text-stone-600 text-sm leading-relaxed pr-12">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
