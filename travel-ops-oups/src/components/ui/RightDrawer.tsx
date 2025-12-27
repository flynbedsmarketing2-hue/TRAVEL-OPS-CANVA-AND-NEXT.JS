"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type DrawerStatusTone = "success" | "warning" | "info";

type RightDrawerProps = {
  title: string;
  description?: string;
  statusLabel?: string;
  statusTone?: DrawerStatusTone;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const focusableSelectors =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const statusClasses: Record<DrawerStatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200",
  info: "border-[var(--border)] bg-[var(--token-surface-2)] text-[var(--text)]",
};

export function RightDrawer({
  title,
  description,
  statusLabel,
  statusTone = "info",
  isOpen,
  onClose,
  children,
  className,
}: RightDrawerProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", keyHandler);
    const timer = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 10);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keyHandler);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div role="presentation" className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative h-full w-full max-w-xl overflow-y-auto border-l border-[var(--border)] bg-[var(--token-surface)] p-6 shadow-xl transition duration-300 ease-out",
          className
        )}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
                {statusLabel ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                      statusClasses[statusTone]
                    )}
                  >
                    {statusLabel}
                  </span>
                ) : null}
              </div>
              {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted)] transition hover:border-primary/40 hover:text-[var(--text)]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="divide-y divide-[var(--border)]">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
