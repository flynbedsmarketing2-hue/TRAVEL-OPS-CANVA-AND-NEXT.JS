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
  primary: "text-[var(--primary)] bg-[var(--token-surface-2)] border border-[var(--border)]",
  secondary: "text-[var(--muted)] bg-[var(--token-surface-2)] border border-[var(--border)]",
  accent: "text-[var(--accent)] bg-[var(--token-surface-2)] border border-[var(--border)]",
};

export function StatCard({ label, value, badge, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--token-surface)] p-5 shadow-sm transition hover:-translate-y-0.5",
        toneStyles[tone] ?? toneStyles.primary
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          {label}
        </span>
        <Icon className="h-5 w-5 text-[var(--muted)]" />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
        {badge ? (
          <span className="rounded-full bg-[var(--token-surface-2)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
