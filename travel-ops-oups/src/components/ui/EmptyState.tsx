import type { ReactNode } from "react";
import { cn } from "./cn";
import { Button } from "./button";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({ icon, title, description, primaryAction, secondaryAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[16px] border border-[var(--border)] bg-white p-8 text-center shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {icon ? <div className="text-primary">{icon}</div> : null}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description ? <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {primaryAction ? (
            <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
          ) : null}
          {secondaryAction ? (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
