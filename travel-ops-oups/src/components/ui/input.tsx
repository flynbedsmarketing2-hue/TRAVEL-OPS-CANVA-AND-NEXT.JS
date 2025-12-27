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
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--token-border)] bg-[var(--token-surface)] px-3 text-sm text-[var(--text)] shadow-sm outline-none transition duration-150 placeholder:text-[var(--muted)] focus:border-[var(--token-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

