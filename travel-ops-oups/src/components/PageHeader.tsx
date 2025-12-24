import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-white/40 p-3 shadow-[8px_8px_18px_rgba(182,193,224,0.2),-8px_-8px_18px_rgba(255,255,255,0.7)] backdrop-blur">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-3xl text-sm leading-snug text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

