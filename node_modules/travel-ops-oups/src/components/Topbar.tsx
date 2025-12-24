'use client';

import { Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useUiStore } from "../stores/useUiStore";
import { Button } from "./ui/button";

type Props = {
  onOpenSidebar?: () => void;
};

export default function Topbar({ onOpenSidebar }: Props) {
  const { theme, toggleTheme } = useUiStore();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-[linear-gradient(120deg,#f9fbff,#e9eeff)] shadow-[0_12px_28px_rgba(182,193,224,0.26)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 2xl:max-w-screen-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => onOpenSidebar?.()}
            className="flex items-center gap-2 rounded-full bg-white/40 px-3 py-2 text-slate-700 shadow-sm shadow-slate-900/10 transition hover:bg-white hover:text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold">Menu</span>
          </Button>
          <Link
            href="/"
            className="hidden text-sm font-semibold text-slate-700 transition hover:text-primary lg:inline"
          >
            TravelOps
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="rounded-2xl text-slate-900 hover:text-primary"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Link href="/dashboard" className="inline-flex">
            <Button>Explore</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
