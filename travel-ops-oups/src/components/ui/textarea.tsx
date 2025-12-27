'use client';

import * as React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-xl border border-[var(--token-border)] bg-[var(--token-surface)] px-3 py-2.5 text-sm text-[var(--text)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--token-accent)]/60 focus:ring-2 focus:ring-[var(--token-accent)]/25 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

