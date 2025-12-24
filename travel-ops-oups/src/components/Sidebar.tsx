'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { isActive, navItems } from "./navigation";
import { cn } from "./ui/cn";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const items = navItems;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/70 bg-[linear-gradient(155deg,#f9fbff,#e9eeff)] shadow-[16px_0_36px_rgba(182,193,224,0.35)] backdrop-blur-xl transition-transform dark:border-slate-800/70 dark:bg-slate-950/60 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-base font-semibold text-slate-800 dark:text-slate-100"
          onClick={() => onClose?.()}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-[6px_6px_12px_rgba(182,193,224,0.32),-6px_-6px_12px_rgba(255,255,255,0.9)]">
            <Plane className="h-5 w-5" />
          </span>
          TravelOps
        </Link>
      </div>

      <div className="px-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Menu
        </p>
        <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-[inset_8px_8px_14px_rgba(182,193,224,0.15),inset_-8px_-8px_14px_rgba(255,255,255,0.9)] transition",
                  active
                    ? "border border-white/70 bg-white/70 text-primary shadow-[10px_10px_20px_rgba(182,193,224,0.28),-10px_-10px_20px_rgba(255,255,255,0.92)]"
                    : "text-slate-700 hover:bg-white/80 hover:shadow-[8px_8px_18px_rgba(182,193,224,0.28),-8px_-8px_18px_rgba(255,255,255,0.9)] dark:text-slate-200 dark:hover:bg-slate-900/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
