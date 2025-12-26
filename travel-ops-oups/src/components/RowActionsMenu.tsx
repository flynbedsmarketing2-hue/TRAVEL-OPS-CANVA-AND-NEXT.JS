import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { cn } from "./ui/cn";

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "danger";
};

type Props = {
  actions: Action[];
  ariaLabel?: string;
};

export default function RowActionsMenu({ actions, ariaLabel = "Actions" }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-[linear-gradient(145deg,#f9fbff,#e9eeff)] text-slate-700 shadow-[6px_6px_12px_rgba(182,193,224,0.32),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-3 w-48 overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#f9fbff,#e9eeff)] shadow-[12px_12px_26px_rgba(182,193,224,0.32),-10px_-10px_24px_rgba(255,255,255,0.9)] transition duration-150 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[10px_10px_26px_rgba(0,0,0,0.45),-8px_-8px_20px_rgba(40,40,80,0.3)]">
          <div className="py-1">
            {actions.map((action) => {
              const classes = cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 transition-colors duration-150 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
                action.tone === "danger" && "text-red-600 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-950/40"
              );

              if (action.href) {
                return (
                  <Link key={action.label} href={action.href} className={classes} onClick={() => setOpen(false)}>
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  className={classes}
                  onClick={() => {
                    action.onClick?.();
                    setOpen(false);
                  }}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
