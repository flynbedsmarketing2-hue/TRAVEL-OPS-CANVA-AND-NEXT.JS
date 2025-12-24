import type { ReactNode } from "react";
import { cn } from "./cn";

type SectionCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, actions, children, className }: SectionCardProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-[16px] border border-[var(--border)] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
