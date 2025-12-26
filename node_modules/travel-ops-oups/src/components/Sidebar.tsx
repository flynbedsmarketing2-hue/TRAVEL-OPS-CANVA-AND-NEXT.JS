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
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  const widthClass = collapsed ? "w-20" : "w-[280px]";
  const paddingClass = collapsed ? "px-2 py-4" : "px-4 py-5";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r border-white/70 bg-[linear-gradient(155deg,#f9fbff,#e9eeff)] shadow-[16px_0_36px_rgba(182,193,224,0.35)] backdrop-blur-xl transition-[width,transform,box-shadow] duration-300 dark:border-slate-800/70 dark:bg-slate-950/60 lg:static",
        widthClass,
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className={cn("flex items-center justify-between gap-2 transition-opacity duration-200", paddingClass)}>
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2 font-heading text-base font-semibold text-slate-800 dark:text-slate-100 transition-opacity duration-200",
            collapsed ? "justify-center" : ""
          )}
          onClick={() => onClose?.()}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-[6px_6px_12px_rgba(182,193,224,0.32),-6px_-6px_12px_rgba(255,255,255,0.9)]">
            <Plane className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "text-sm font-semibold leading-tight text-slate-800 transition-opacity duration-200 dark:text-slate-100",
              collapsed ? "opacity-0" : "opacity-100"
            )}
          >
            TravelOps
          </span>
        </Link>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-slate-600 shadow transition hover:bg-white hover:text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("space-y-4", paddingClass)}>
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className={cn(
                "px-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 transition-opacity duration-200",
                collapsed ? "opacity-0" : "opacity-100"
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
                      "relative flex items-center gap-3 rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/40 border-l-4 border-transparent",
                      collapsed ? "justify-center px-2 py-2" : "px-4 py-2.5",
                      active
                        ? "border-primary bg-white/80 text-primary shadow-[0_10px_20px_rgba(59,130,246,0.25)]"
                        : "text-slate-700 hover:bg-white/60 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        collapsed ? "text-slate-700" : "text-slate-600",
                        active ? "scale-110" : "scale-100"
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
