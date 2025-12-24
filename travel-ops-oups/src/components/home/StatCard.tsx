'use client';

import { cn } from "../ui/cn";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  badge?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "accent";
};

const toneStyles: Record<StatCardProps["tone"], string> = {
  primary: "text-primary bg-primary/5 border border-primary/20",
  secondary: "text-secondary bg-secondary/5 border border-secondary/20",
  accent: "text-accent bg-accent/5 border border-accent/20",
};

export function StatCard({ label, value, badge, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/70 bg-[linear-gradient(145deg,#fefefe,#f1f5ff)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)]",
        toneStyles[tone] ?? toneStyles.primary
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        {badge ? (
          <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-white/10 dark:text-slate-100">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
