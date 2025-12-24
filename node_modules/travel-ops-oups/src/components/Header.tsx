'use client';

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Plane, ShoppingCart, Telescope, Moon, Sun } from "lucide-react";
import { useUiStore } from "../stores/useUiStore";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Packages",
    href: "/packages",
    icon: Briefcase,
  },
  {
    label: "Voyages",
    href: "/voyages",
    icon: Plane,
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    label: "Ops",
    href: "/ops",
    icon: Telescope,
  },
];

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useUiStore();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[linear-gradient(120deg,#f9fbff,#e9eeff)] shadow-[0_10px_24px_rgba(182,193,224,0.28)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 2xl:max-w-screen-2xl">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 font-heading text-lg font-semibold text-primary shadow-[8px_8px_16px_rgba(182,193,224,0.28),-8px_-8px_16px_rgba(255,255,255,0.9)]"
        >
          <Plane className="h-5 w-5" />
          TravelOps Platform
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border border-white/70 bg-white/80 text-primary shadow-[8px_8px_18px_rgba(182,193,224,0.32),-8px_-8px_18px_rgba(255,255,255,0.9)]"
                    : "text-slate-600 hover:bg-white/70 hover:shadow-[6px_6px_14px_rgba(182,193,224,0.28),-6px_-6px_14px_rgba(255,255,255,0.9)] dark:text-slate-300 dark:hover:bg-slate-900/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#f9fbff,#e9eeff)] px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-[6px_6px_14px_rgba(182,193,224,0.32),-6px_-6px_14px_rgba(255,255,255,0.9)] transition hover:text-primary dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:bg-slate-900/60"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#7c8bff] via-[#6ba7ff] to-[#5ed0ff] px-5 py-2.5 text-sm font-semibold text-white shadow-[10px_10px_22px_rgba(118,136,200,0.32),-8px_-8px_18px_rgba(255,255,255,0.9)] transition hover:brightness-[1.02]"
          >
            Open
          </Link>
        </div>
      </div>
    </header>
  );
}
