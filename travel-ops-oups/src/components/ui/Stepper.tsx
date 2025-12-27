import type { ReactNode } from "react";
import { cn } from "./cn";

type Step = { id: string; label: string; description?: string };

export function Stepper({ steps, current }: { steps: Step[]; current: string }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const active = step.id === current;
        const done = steps.findIndex((s) => s.id === current) > index;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--token-surface)] px-3 py-2.5 shadow-sm",
              active && "border-[var(--token-primary)]/40"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                active
                  ? "border-[var(--token-primary)] bg-[var(--token-primary)]/10 text-[var(--token-primary)]"
                  : done
                    ? "border-[var(--token-primary)]/40 bg-[var(--token-surface-2)] text-[var(--token-primary)]"
                    : "border-[var(--border)] text-[var(--muted)]"
              )}
            >
              {index + 1}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text)]">{step.label}</p>
              {step.description ? <p className="text-xs text-[var(--muted)]">{step.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function StickyPreview({ title, children, footer }: { title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <aside className="sticky top-20 h-fit rounded-[16px] border border-[var(--border)] bg-[var(--token-surface)] p-4 shadow-sm">
      {title ? <p className="text-sm font-semibold text-[var(--text)]">{title}</p> : null}
      <div className="mt-3 space-y-3 text-sm text-[var(--muted)]">{children}</div>
      {footer ? <div className="mt-4 border-t border-[var(--border)] pt-3">{footer}</div> : null}
    </aside>
  );
}
