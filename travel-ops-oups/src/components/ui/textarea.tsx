'use client';

import * as React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[140px] w-full rounded-xl border border-[var(--token-border)] bg-[var(--token-surface)] px-4 py-3 text-base text-[var(--text)] shadow-sm outline-none transition duration-200 ease-out placeholder:text-[var(--muted)] hover:border-[var(--token-text)]/40 hover:bg-[var(--token-surface-2)] focus:border-[var(--token-text)] focus:ring-2 focus:ring-[var(--token-text)]/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

