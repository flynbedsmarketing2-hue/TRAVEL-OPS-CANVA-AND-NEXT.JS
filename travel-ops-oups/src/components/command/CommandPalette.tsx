"use client";

import { useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { Command } from "./types";

type CommandPaletteProps = {
  isOpen: boolean;
  query: string;
  setQuery: (value: string) => void;
  filteredCommands: Command[];
  highlightedIndex: number;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  close: () => void;
  selectCommand: (command: Command) => void;
};

type CommandGroup = {
  label: string;
  commands: Command[];
};

export default function CommandPalette({
  isOpen,
  query,
  setQuery,
  filteredCommands,
  highlightedIndex,
  handleInputKeyDown,
  close,
  selectCommand,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandGroup>();
    filteredCommands.forEach((command) => {
      if (!map.has(command.group)) {
        map.set(command.group, { label: command.group, commands: [] });
      }
      map.get(command.group)?.commands.push(command);
    });
    return Array.from(map.values());
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--token-text)]/70 px-4 py-10 backdrop-blur sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          close();
        }
      }}
    >
      <div className="w-full max-w-3xl rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--token-surface)]/95 p-6 shadow-md backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-lg font-semibold tracking-tight text-[var(--text)]">
            Command palette
          </span>
          <button
            type="button"
            onClick={close}
            className="ml-auto rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--token-primary)] hover:text-[var(--text)]"
          >
            Esc
          </button>
        </div>
        <div className="mt-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--token-surface-2)] px-4 py-3 text-sm font-medium text-[var(--text)] shadow-sm outline-none transition-colors duration-150 focus:border-[var(--token-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]"
          />
        </div>

        <div className="mt-5 max-h-[60vh] overflow-y-auto space-y-6">
          {groups.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No commands found.</p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {group.commands.map((command) => {
                    const index = filteredCommands.findIndex((c) => c.id === command.id);
                    const isHighlighted = index === highlightedIndex;
                      return (
                        <button
                          key={command.id}
                          type="button"
                          onClick={() => selectCommand(command)}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)] ${
                            isHighlighted
                              ? "bg-[var(--token-accent)]/10 text-[var(--token-accent)] ring-1 ring-[var(--token-accent)]/40"
                              : "bg-[var(--token-surface)] text-[var(--text)] hover:bg-[var(--token-surface-2)]"
                          }`}
                        >
                          <span className="text-[var(--muted)]">{command.icon}</span>
                          <span>{command.label}</span>
                        </button>
                      );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

