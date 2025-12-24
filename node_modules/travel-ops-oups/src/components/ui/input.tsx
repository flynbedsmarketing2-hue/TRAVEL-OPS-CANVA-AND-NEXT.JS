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
        "h-11 w-full rounded-xl border border-white/70 bg-[#f4f7ff] px-3 text-sm text-slate-900 shadow-[inset_7px_7px_14px_rgba(182,193,224,0.55),inset_-8px_-8px_14px_rgba(255,255,255,0.92)] outline-none transition placeholder:text-slate-400 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-[inset_8px_8px_18px_rgba(0,0,0,0.35),inset_-8px_-8px_18px_rgba(40,40,80,0.28)]",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

