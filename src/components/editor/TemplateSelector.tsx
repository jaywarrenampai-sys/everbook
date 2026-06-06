"use client";

import { TEMPLATES } from "@/lib/editor/templates";

interface Props {
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
}

export default function TemplateSelector({ currentTemplateId, onSelect }: Props) {
  return (
    <div className="w-44 bg-stone-900 border-r border-stone-700 flex flex-col overflow-y-auto flex-shrink-0">
      <div className="px-3 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-700">
        เทมเพลต
      </div>
      <div className="flex flex-col gap-1 p-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
              currentTemplateId === t.id
                ? "bg-amber-600 text-white"
                : "text-stone-300 hover:bg-stone-700 hover:text-white"
            }`}
          >
            <span className="text-base w-6 text-center">{t.icon}</span>
            <span className="leading-tight text-xs">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
