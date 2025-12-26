"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

type DrawerProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const focusableSelectors =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Drawer({ title, description, isOpen, onClose, children, className }: DrawerProps) {
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
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-stretch justify-end"
    >
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
          "relative h-full w-full max-w-md overflow-y-auto bg-[var(--token-surface)] p-6 shadow-lg transition duration-300 ease-out dark:bg-[var(--token-surface)]",
          className
        )}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
              {description ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900 dark:text-slate-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
