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
              "flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900",
              active && "border-primary/40 shadow-[0_10px_22px_rgba(93,135,255,0.15)]"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : done
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-[var(--border)] text-slate-500"
              )}
            >
              {index + 1}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.label}</p>
              {step.description ? <p className="text-xs text-slate-500">{step.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function StickyPreview({ title, children, footer }: { title?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <aside className="sticky top-20 h-fit rounded-[16px] border border-[var(--border)] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
      {title ? <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{title}</p> : null}
      <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">{children}</div>
      {footer ? <div className="mt-4 border-t border-[var(--border)] pt-3">{footer}</div> : null}
    </aside>
  );
}
