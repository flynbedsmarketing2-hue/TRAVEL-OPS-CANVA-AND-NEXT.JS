"use client";

import { useEffect } from "react";

type ShortcutsHelpProps = {
  isOpen: boolean;
  onClose: () => void;
};

const shortcuts = [
  { label: "Cmd/Ctrl + K", description: "Open command palette" },
  { label: "?", description: "Show this shortcuts help" },
  { label: "Esc", description: "Close dialogs" },
  { label: "/", description: "Focus search (when available)" },
];

export default function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--token-text)]/50 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(event) => {
        if ((event.target as HTMLElement).getAttribute("role") === "dialog") {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--token-surface)]/95 p-6 shadow-md backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Esc
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <li
              key={shortcut.label}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--token-surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text)]"
            >
              <span>{shortcut.description}</span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--token-surface)] px-3 py-0.5 text-xs font-medium uppercase tracking-[0.3em] text-[var(--muted)]">
                {shortcut.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
