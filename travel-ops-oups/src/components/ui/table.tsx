import * as React from "react";
import { cn } from "./cn";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border-[var(--border)] bg-[var(--token-surface)] shadow-soft transition-colors duration-150">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[var(--token-surface-2)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[var(--border)] dark:divide-slate-800", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "bg-[var(--token-surface)] transition hover:bg-[var(--token-surface-2)] dark:bg-[var(--token-surface)] dark:hover:bg-slate-800/70",
        className
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3.5", className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-top text-[var(--text)] dark:text-white",
        className
      )}
      {...props}
    />
  );
}

