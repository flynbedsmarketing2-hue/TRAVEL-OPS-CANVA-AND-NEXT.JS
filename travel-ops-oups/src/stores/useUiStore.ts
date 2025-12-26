'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistStorage } from "./storeUtils";

export type ThemeMode = "light" | "dark" | "system";

type UiStore = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const storage = makePersistStorage();

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        const next: ThemeMode = current === "light" ? "dark" : current === "dark" ? "system" : "light";
        set({ theme: next });
      },
    }),
    {
      name: "travelops-ui-store",
      storage,
    }
  )
);

