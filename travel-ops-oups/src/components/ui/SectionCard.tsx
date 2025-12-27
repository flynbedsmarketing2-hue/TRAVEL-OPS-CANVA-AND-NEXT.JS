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
        "space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--token-surface)] p-5 shadow-sm",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{title}</h3>
            ) : null}
            {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
