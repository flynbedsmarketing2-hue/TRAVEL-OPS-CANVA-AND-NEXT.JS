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
};

export default function RowActionsMenu({ actions }: Props) {
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
        aria-label="Actions"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
          <div className="py-1">
            {actions.map((action) => {
              const classes = cn(
                "flex items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none dark:text-slate-100 dark:hover:bg-slate-800",
                action.tone === "danger" && "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
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
