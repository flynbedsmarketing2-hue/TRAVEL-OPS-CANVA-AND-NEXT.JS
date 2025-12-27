'use client';

import { useEffect } from "react";
import { cn } from "./cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-[var(--token-text)]/20 backdrop-blur"
        onClick={() => onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--token-surface)] shadow-md",
          className
        )}
      >
        {title ? (
          <div className="border-b border-[var(--border)] px-6 py-4">
            <p className="font-heading text-lg font-semibold text-[var(--text)]">{title}</p>
          </div>
        ) : null}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

