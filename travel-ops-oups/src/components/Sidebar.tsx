'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { isActive, navItems } from "./navigation";
import { cn } from "./ui/cn";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

const navSections = [
  { label: "Workspace", items: navItems.slice(0, 3) },
  { label: "Management", items: navItems.slice(3, 6) },
  { label: "Admin", items: navItems.slice(6) },
];

export default function Sidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === null) return;
    const storedCollapsed = stored === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed((prev) => (prev === storedCollapsed ? prev : storedCollapsed));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  const widthClass = collapsed ? "w-20" : "w-[280px]";
  const paddingClass = collapsed ? "px-3 py-4" : "px-4 py-6";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-[var(--border)] bg-[var(--token-surface)]/80 shadow-md backdrop-blur-xl transition-[width,transform,box-shadow,color] duration-300 lg:static",
        widthClass,
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "flex transition-opacity duration-200",
          collapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-2",
          paddingClass
        )}
      >
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-3 font-heading text-base font-semibold text-[var(--text)] transition-opacity duration-200",
            collapsed ? "justify-center" : ""
          )}
          onClick={() => onClose?.()}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--token-surface-2)] text-[var(--token-accent)] shadow-sm">
            <Plane className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "text-sm font-semibold leading-tight text-[var(--text)] transition-opacity duration-200",
              collapsed ? "sr-only" : "opacity-100"
            )}
          >
            Nouba Plus
          </span>
        </Link>

          <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--token-surface)] text-[var(--muted)] shadow-sm transition hover:text-[var(--token-primary)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/70"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("space-y-4", paddingClass)}>
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className={cn(
            "px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] transition duration-200",
                collapsed ? "opacity-0" : "opacity-100",
                "font-mono"
              )}
            >
              {section.label}
            </p>
            <div className="mt-1 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose?.()}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[var(--radius-md)] border border-transparent text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--token-text)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]",
                      collapsed ? "justify-center px-3 py-2.5" : "px-4 py-3",
                      active
                        ? "bg-[var(--token-surface-2)] text-[var(--text)] shadow-md before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1.5 before:rounded-full before:bg-[var(--token-text)]/80"
                        : "text-[var(--text)] hover:border-[var(--border)] hover:bg-[var(--token-surface-2)] hover:shadow-md"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        collapsed ? "text-[var(--text)]" : "text-[var(--muted)]",
                        active ? "scale-110" : "scale-100 group-hover:scale-105"
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "transition-opacity duration-200",
                        collapsed ? "sr-only" : "opacity-100"
                      )}
                    >
                      {item.label}
                    </span>
                    {collapsed ? (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--token-surface)] px-3 py-1 text-xs font-semibold text-[var(--text)] shadow-soft group-hover:inline-block">
                        {item.label}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
