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
            size="icon"
            onClick={onOpenSidebar}
            className="lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
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
            aria-label="Basculer le theme"
            title="Basculer le theme"
            className="rounded-2xl text-slate-900 hover:text-primary"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Link href="/dashboard" className="inline-flex">
            <Button>Explorer</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
