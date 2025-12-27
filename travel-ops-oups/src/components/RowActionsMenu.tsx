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

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    const focusTimer = window.setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLElement>("[role='menuitem']");
      first?.focus();
    }, 0);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--token-surface)] text-[var(--text)] shadow-sm transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-3 w-48 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] shadow-md transition duration-150"
        >
          <div className="py-1">
            {actions.map((action) => {
              const classes = cn(
                "flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-[var(--text)] transition-colors duration-150 hover:bg-[var(--token-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]",
                action.tone === "danger" && "text-red-600 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-950/40"
              );

              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    role="menuitem"
                    className={classes}
                    onClick={() => setOpen(false)}
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
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
