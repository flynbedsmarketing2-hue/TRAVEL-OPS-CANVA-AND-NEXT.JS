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
    <div className="flex w-full flex-col gap-3 rounded-[16px] border border-[var(--border)] bg-white/80 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-colors duration-150 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          {breadcrumb && breadcrumb.length ? (
            <nav className="flex flex-wrap items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {breadcrumb.map((item, index) => (
                <span key={item.label + index} className="flex items-center gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-slate-500 transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:focus-visible:ring-offset-slate-900"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                  )}
                  {index < breadcrumb.length - 1 ? <span aria-hidden="true">›</span> : null}
                </span>
              ))}
            </nav>
          ) : null}
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-100">{title}</h1>
            {resolvedDescription ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">{resolvedDescription}</p>
            ) : null}
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
