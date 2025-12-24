import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[16px] border border-[var(--border)] bg-white/80 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[24px] font-semibold leading-7 text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-3xl text-sm leading-5 text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

