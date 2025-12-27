import type { ReactNode } from "react";
import { cn } from "./cn";

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--token-surface)] p-6 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-[var(--token-primary)]">{title}</h3>
        {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormRow({ label, hint, children, inline }: { label: string; hint?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={cn("flex gap-4", inline ? "items-center" : "flex-col")}>
      <div className="min-w-[180px]">
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        {hint ? <p className="text-sm text-[var(--muted)]">{hint}</p> : null}
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
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--token-surface)] px-4 py-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        {title ? <p className="text-sm font-semibold text-[var(--token-primary)]">{title}</p> : <span />}
        <div className="flex items-center gap-3">
          {onRemove ? (
            <button
              type="button"
              className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--token-accent)]"
              onClick={onRemove}
            >
              Remove
            </button>
          ) : null}
          {onAdd ? (
            <button
              type="button"
              className="text-sm font-semibold text-[var(--token-primary)] hover:text-[var(--token-primary-strong)]"
              onClick={onAdd}
            >
              Add
            </button>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
