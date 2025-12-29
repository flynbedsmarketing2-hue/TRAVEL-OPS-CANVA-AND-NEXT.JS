'use client';

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useUiStore } from "../stores/useUiStore";
import { Button } from "./ui/button";
import { useResolvedTheme } from "../hooks/useResolvedTheme";

type Props = {
  onOpenSidebar?: () => void;
};

export default function Topbar({ onOpenSidebar }: Props) {
  const { toggleTheme, theme } = useUiStore();
  const resolvedTheme = useResolvedTheme();
  const themeLabel = theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--token-surface)]/70 shadow-sm backdrop-blur-xl">
      <div className="container flex h-16 w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => onOpenSidebar?.()}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-[var(--text)] shadow-sm transition hover:bg-[var(--surface-2)]/80 hover:text-[var(--token-primary)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold">Menu</span>
          </Button>
          <Link
            href="/"
            className="hidden text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text)]/80 transition hover:text-primary lg:inline"
          >
            TravelOPS
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="rounded-full border border-[var(--border)] bg-[var(--token-surface)] px-3 text-[var(--text)] hover:bg-[var(--token-surface-2)]"
          >
            {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">{themeLabel}</span>
          </Button>

          <Link href="/dashboard" className="inline-flex">
            <Button>Explore</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
