import type { ReactNode } from "react";
import { cn } from "./cn";

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-[16px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">{title}</h3>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function FormRow({ label, hint, children, inline }: { label: string; hint?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={cn("flex gap-3", inline ? "items-center" : "flex-col")}>
      <div className="min-w-[160px]">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function RepeatableRow({
  title,
  onAdd,
  onRemove,
  children,
}: {
  title?: string;
  onAdd?: () => void;
  onRemove?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-white px-3 py-3 shadow-[0_6px_14px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        {title ? <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{title}</p> : <span />}
        <div className="flex items-center gap-2">
          {onRemove ? (
            <button
              type="button"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              onClick={onRemove}
            >
              Remove
            </button>
          ) : null}
          {onAdd ? (
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:text-primary-strong"
              onClick={onAdd}
            >
              Add
            </button>
          ) : null}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
