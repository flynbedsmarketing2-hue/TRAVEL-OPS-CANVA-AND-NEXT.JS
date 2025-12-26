'use client';

import { useEffect, useState } from "react";
import { useUiStore } from "../stores/useUiStore";

export type ResolvedTheme = "light" | "dark";

export function useResolvedTheme(): ResolvedTheme {
  const themeMode = useUiStore((state) => state.theme);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    themeMode === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const next =
        themeMode === "system"
          ? matcher.matches
            ? "dark"
            : "light"
          : themeMode;
      setResolved(next);
    };
    update();
    matcher.addEventListener("change", update);
    return () => matcher.removeEventListener("change", update);
  }, [themeMode]);

  return resolved;
}
