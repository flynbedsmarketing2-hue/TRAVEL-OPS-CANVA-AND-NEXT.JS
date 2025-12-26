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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={(event) => {
        if ((event.target as HTMLElement).getAttribute("role") === "dialog") {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[18px] border border-white/20 bg-white/90 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.4)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          >
            Esc
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
              <span>{shortcut.description}</span>
              <span className="rounded-full border border-slate-300 bg-white px-3 py-0.5 text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {shortcut.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
