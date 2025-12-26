'use client';

import { useEffect } from "react";
import { useResolvedTheme } from "../hooks/useResolvedTheme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  return <>{children}</>;
}

