'use client';

import * as React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full rounded-[var(--radius-md)] border border-[var(--token-border)] bg-[var(--token-surface)] px-4 text-base text-[var(--text)] shadow-sm outline-none transition duration-200 ease-out placeholder:text-[var(--muted)] hover:border-[var(--token-text)]/40 hover:bg-[var(--token-surface-2)] focus:border-[var(--token-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-text)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

