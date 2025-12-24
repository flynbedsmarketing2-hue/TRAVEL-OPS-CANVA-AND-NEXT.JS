import * as React from "react";
import { cn } from "./cn";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(140deg,#f9fbff,#e9eeff)] shadow-[12px_12px_30px_rgba(182,193,224,0.38),-12px_-12px_28px_rgba(255,255,255,0.9)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-[10px_10px_28px_rgba(0,0,0,0.5),-10px_-10px_26px_rgba(40,40,80,0.35)]">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-white/70 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 backdrop-blur dark:bg-slate-900/60 dark:text-slate-300",
        className
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[#dfe6ff]/70 dark:divide-slate-800/70", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("bg-white/50 transition hover:bg-white/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/60", className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-5 py-3.5", className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-3 align-top text-slate-700 dark:text-slate-200", className)} {...props} />;
}

