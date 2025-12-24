import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "./cn";
import { Input } from "./input";

type FilterBarProps = {
  searchPlaceholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function FilterBar({ searchPlaceholder = "Search...", value, onChange, filters, actions, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 bg-white dark:bg-slate-900"
        />
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
