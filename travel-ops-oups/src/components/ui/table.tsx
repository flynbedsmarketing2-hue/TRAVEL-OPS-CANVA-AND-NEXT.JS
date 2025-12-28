import * as React from "react";
import { cn } from "./cn";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--token-surface)]/80 shadow-sm backdrop-blur-lg transition-all duration-200 hover:shadow-md">
      <table className={cn("w-full min-w-full text-left text-sm md:text-base", className)} {...props} />
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
  return (
    <tbody
      className={cn(
        "divide-y divide-[var(--border)] [&>tr:nth-child(even)]:bg-[var(--token-surface-2)]",
        className
      )}
      {...props}
    />
  );
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "group bg-[var(--token-surface)] transition hover:bg-[var(--token-surface-2)] hover:-translate-y-[1px]",
        className
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-5 py-3", className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-5 py-3 align-middle text-[var(--text)] leading-relaxed", className)}
      {...props}
    />
  );
}

