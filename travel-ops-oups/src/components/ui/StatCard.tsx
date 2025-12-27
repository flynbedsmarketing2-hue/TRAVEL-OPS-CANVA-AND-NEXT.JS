import type { ReactNode } from "react";
import { cn } from "./cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "accent" | "muted";
};

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-[var(--border)] bg-[var(--token-surface)]",
  primary: "border-primary/20 bg-primary/10 text-primary",
  accent: "border-[var(--border)] bg-accent/10 text-[var(--text)]",
  muted: "border-[var(--border)] bg-[var(--token-surface-2)] text-[var(--muted)]",
};

export function StatCard({ label, value, sublabel, icon, tone = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-3 rounded-[var(--radius-lg)] border px-4 py-3 shadow-sm",
        toneMap[tone]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
          {sublabel ? <p className="text-xs text-[var(--muted)]">{sublabel}</p> : null}
        </div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </div>
      <div className="text-[22px] font-semibold leading-7 text-[var(--text)]">{value}</div>
    </div>
  );
}
