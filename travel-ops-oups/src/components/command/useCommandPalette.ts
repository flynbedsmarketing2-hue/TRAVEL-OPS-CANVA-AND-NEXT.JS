"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Command } from "./types";

export type CommandPaletteState = {
  isOpen: boolean;
  query: string;
  setQuery: (value: string) => void;
  filteredCommands: Command[];
  highlightedIndex: number;
  handleInputKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  open: () => void;
  close: () => void;
  selectCommand: (command: Command) => void;
};

export function useCommandPalette(commands: Command[]): CommandPaletteState {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) => {
      const labelMatches = command.label.toLowerCase().includes(normalized);
      const keywordsMatches = command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(normalized)
      );
      return labelMatches || keywordsMatches;
    });
  }, [commands, query]);

  useEffect(() => {
    const adjustIndex = () => {
      if (filteredCommands.length === 0) {
        setHighlightedIndex(-1);
        return;
      }
      setHighlightedIndex((prev) => {
        if (prev < 0) return 0;
        if (prev >= filteredCommands.length) return filteredCommands.length - 1;
        return prev;
      });
    };
    adjustIndex();
  }, [filteredCommands]);

  useEffect(() => {
    const handleGlobalKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isOpen]);

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!filteredCommands.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredCommands[highlightedIndex];
      if (command) selectCommand(command);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setQuery("");
    }
  };

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const selectCommand = (command: Command) => {
    command.action();
    close();
  };

  return {
    isOpen,
    query,
    setQuery,
    filteredCommands,
    highlightedIndex,
    handleInputKeyDown,
    open: () => setIsOpen(true),
    close,
    selectCommand,
  };
}
