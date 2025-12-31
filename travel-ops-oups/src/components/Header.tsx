'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Plane, Sun } from "lucide-react";
import { primaryNavItems } from "./navigation";
import { useUiStore } from "../stores/useUiStore";

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useUiStore();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--token-surface)]/80 backdrop-blur-sm shadow-sm">
      <div className="container flex items-center justify-between px-2 py-4">
        <Link href="/" className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--token-surface)]/90 px-3 py-2 font-heading text-lg font-semibold text-[var(--text)] shadow-sm transition hover:ring-1 hover:ring-[var(--token-accent)]/10">
          <Plane className="h-5 w-5 text-[var(--token-accent)]" />
          TravelOPS
        </Link>

        <nav className="flex items-center gap-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border border-[var(--border)] bg-[var(--token-surface-2)] text-[var(--text)] shadow-sm"
                    : "text-[var(--muted)] hover:bg-[var(--token-surface-2)]/80 hover:text-[var(--text)]"
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
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--token-surface)]/90 px-3.5 py-2 text-sm font-semibold text-[var(--muted)] shadow-sm transition hover:text-[var(--text)]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-[var(--token-text)] px-5 py-2.5 text-sm font-semibold text-[var(--token-inverse)] shadow-md transition hover:bg-[var(--token-secondary)] hover:scale-[1.01]"
          >
            Open
          </Link>
        </div>
      </div>
    </header>
  );
}

