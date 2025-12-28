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
        "relative space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--token-surface)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md",
        "overflow-hidden before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--token-text)]/30 before:to-transparent",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h3 className="text-sm font-semibold tracking-tight text-[var(--token-primary)]">{title}</h3>
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
