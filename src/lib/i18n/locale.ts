"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "th" | "en";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

/** Persisted UI language. Thai is the default (main) language. */
export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "th",
      setLocale: (locale) => set({ locale }),
      toggle: () => set({ locale: get().locale === "th" ? "en" : "th" }),
    }),
    { name: "everbook-locale" }
  )
);
