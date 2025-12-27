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
  const { toggleTheme } = useUiStore();
  const resolvedTheme = useResolvedTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--token-surface)]/90 shadow-sm backdrop-blur">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-6 lg:px-8 2xl:max-w-screen-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => onOpenSidebar?.()}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2 text-[var(--text)] shadow-sm transition hover:bg-[var(--surface-2)] hover:text-[var(--token-primary)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold">Menu</span>
          </Button>
          <Link
            href="/"
            className="hidden text-sm font-semibold text-[var(--text)]/80 transition hover:text-primary lg:inline"
          >
            Nouba Plus
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="rounded-[var(--radius-md)] text-[var(--text)] hover:text-[var(--token-primary)]"
          >
            {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Link href="/dashboard" className="inline-flex">
            <Button>Explore</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
