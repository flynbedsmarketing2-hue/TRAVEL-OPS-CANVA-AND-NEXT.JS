import Link from "next/link";
import type { ReactNode } from "react";

export type PageHeaderBreadcrumb = {
  label: string;
  href?: string;
};

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: PageHeaderBreadcrumb[];
  actions?: ReactNode;
  tabs?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  description,
  breadcrumb,
  actions,
  tabs,
}: PageHeaderProps) {
  const resolvedDescription = description ?? subtitle;

  return (
    <div className="flex w-full flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--token-surface)]/90 p-6 shadow-sm transition-colors duration-150 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex-1 min-w-0 space-y-2">
          {breadcrumb && breadcrumb.length ? (
            <nav className="flex flex-wrap items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              {breadcrumb.map((item, index) => (
                <span key={item.label + index} className="flex items-center gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-[var(--muted)] transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--token-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--token-surface)]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--muted)]">{item.label}</span>
                  )}
                  {index < breadcrumb.length - 1 ? <span aria-hidden="true">›</span> : null}
                </span>
              ))}
            </nav>
          ) : null}
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--token-primary)]">{eyebrow}</p>
          ) : null}
          <div>
            <h1 className="font-heading">{title}</h1>
            {resolvedDescription ? <p className="text-sm text-[var(--muted)]">{resolvedDescription}</p> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 transition-colors duration-150">{actions}</div>
        ) : null}
      </div>
      {tabs ? <div className="w-full">{tabs}</div> : null}
    </div>
  );
}
