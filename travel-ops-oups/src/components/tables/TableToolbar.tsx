import type { ReactNode, Ref } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../ui/cn";

export type TableToolbarChip = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
};

export type TableToolbarProps = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    inputRef?: Ref<HTMLInputElement>;
  };
  chips?: TableToolbarChip[];
  leftActions?: ReactNode;
  primaryAction?: ReactNode;
  rightActions?: ReactNode;
  className?: string;
};

export default function TableToolbar({
  search,
  chips,
  leftActions,
  primaryAction,
  rightActions,
  className,
}: TableToolbarProps) {
  const hasPrimaryContent = Boolean(primaryAction || rightActions);
  const chipBaseClasses =
    "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--token-surface-2)] px-6 py-4 shadow-sm transition duration-150 hover:border-[var(--token-border)]",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {search ? (
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              ref={search.inputRef}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder ?? "Search"}
              className="pl-10"
              aria-label={search.ariaLabel ?? search.placeholder ?? "Search"}
            />
          </div>
        ) : null}

        {leftActions ? (
          <div className="flex flex-wrap items-center gap-2">
            {leftActions}
          </div>
        ) : null}

        {hasPrimaryContent ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {rightActions}
            {primaryAction}
          </div>
        ) : null}
      </div>

      {chips && chips.length ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClick}
              className={cn(
                chipBaseClasses,
                chip.active
                  ? "border-[var(--token-accent)]/40 bg-[var(--token-surface)] text-[var(--text)] shadow-sm"
                  : "border-[var(--border)] bg-[var(--token-surface)] text-[var(--muted)] hover:border-[var(--token-border)] hover:text-[var(--text)]"
              )}
              aria-pressed={chip.active ?? false}
            >
              <span>{chip.label}</span>
              {chip.onRemove ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${chip.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    chip.onRemove?.();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      chip.onRemove?.();
                    }
                  }}
                  className="text-[0.65rem] text-[var(--muted)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)] hover:text-[var(--token-accent)]"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
